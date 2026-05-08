package bots

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"wch-trading-platform/apps/api-go/internal/platform/outbox"
	"wch-trading-platform/packages/go/domain"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateBot(ctx context.Context, bot *domain.Bot, risk *domain.RiskSettings) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	configJSON, err := json.Marshal(bot.Config)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO bots (id, user_id, exchange_account_id, name, mode, strategy, symbol, quote_asset, capital, status, config, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`
	_, err = tx.ExecContext(ctx, query,
		bot.ID, bot.UserID, bot.ExchangeAccountID, bot.Name, bot.Mode, bot.Strategy, bot.Symbol, bot.QuoteAsset, bot.Capital, bot.Status, configJSON, bot.CreatedAt, bot.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to insert bot: %w", err)
	}

	riskQuery := `
		INSERT INTO risk_settings (id, bot_id, max_position_size, max_daily_loss, stop_loss_percent, take_profit_percent, emergency_stop, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err = tx.ExecContext(ctx, riskQuery,
		risk.ID, risk.BotID, risk.MaxPositionSize, risk.MaxDailyLoss, risk.StopLossPercent, risk.TakeProfitPercent, risk.EmergencyStop, risk.CreatedAt, risk.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to insert risk settings: %w", err)
	}

	// Save Outbox Event
	if err := outbox.SaveEvent(ctx, tx, domain.EventTypeBotCreated, bot, &outbox.Metadata{
		UserID: &bot.UserID,
		BotID:  &bot.ID,
	}); err != nil {
		return fmt.Errorf("failed to save outbox event: %w", err)
	}

	return tx.Commit()
}

func (r *Repository) GetBotByID(ctx context.Context, id string) (*domain.Bot, *domain.RiskSettings, error) {
	bot := &domain.Bot{}
	var configJSON []byte

	query := `
		SELECT id, user_id, exchange_account_id, name, mode, strategy, symbol, quote_asset, capital, status, config, created_at, updated_at
		FROM bots WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&bot.ID, &bot.UserID, &bot.ExchangeAccountID, &bot.Name, &bot.Mode, &bot.Strategy, &bot.Symbol, &bot.QuoteAsset, &bot.Capital, &bot.Status, &configJSON, &bot.CreatedAt, &bot.UpdatedAt,
	)
	if err != nil {
		return nil, nil, err
	}

	if err := json.Unmarshal(configJSON, &bot.Config); err != nil {
		return nil, nil, err
	}

	risk := &domain.RiskSettings{}
	riskQuery := `
		SELECT id, bot_id, max_position_size, max_daily_loss, stop_loss_percent, take_profit_percent, emergency_stop, created_at, updated_at
		FROM risk_settings WHERE bot_id = $1
	`
	err = r.db.QueryRowContext(ctx, riskQuery, id).Scan(
		&risk.ID, &risk.BotID, &risk.MaxPositionSize, &risk.MaxDailyLoss, &risk.StopLossPercent, &risk.TakeProfitPercent, &risk.EmergencyStop, &risk.CreatedAt, &risk.UpdatedAt,
	)
	if err != nil {
		return nil, nil, err
	}

	return bot, risk, nil
}

func (r *Repository) UpdateBotStatus(ctx context.Context, id string, status domain.BotStatus, reason string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var oldStatus domain.BotStatus
	err = tx.QueryRowContext(ctx, "SELECT status FROM bots WHERE id = $1 FOR UPDATE", id).Scan(&oldStatus)
	if err != nil {
		return err
	}

	query := `UPDATE bots SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err = tx.ExecContext(ctx, query, status, id)
	if err != nil {
		return err
	}

	// Log Transition
	_, err = tx.ExecContext(ctx, `
		INSERT INTO bot_state_transitions (bot_id, from_state, to_state, reason)
		VALUES ($1, $2, $3, $4)`,
		id, oldStatus, status, reason,
	)
	if err != nil {
		return err
	}

	// Outbox Event
	var userID string
	if err := tx.QueryRowContext(ctx, "SELECT user_id FROM bots WHERE id = $1", id).Scan(&userID); err != nil {
		return err
	}

	eventData := BotStatusChangedEvent{
		BotID:     id,
		OldStatus: oldStatus,
		NewStatus: status,
		Reason:    reason,
	}
	if err := outbox.SaveEvent(ctx, tx, eventTypeForBotStatus(status), eventData, &outbox.Metadata{
		UserID: &userID,
		BotID:  &id,
	}); err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) ListBotsByUserID(ctx context.Context, userID string) ([]domain.Bot, error) {
	query := `
		SELECT id, user_id, exchange_account_id, name, mode, strategy, symbol, quote_asset, capital, status, config, created_at, updated_at
		FROM bots WHERE user_id = $1
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bots []domain.Bot
	for rows.Next() {
		var bot domain.Bot
		var configJSON []byte
		err := rows.Scan(
			&bot.ID, &bot.UserID, &bot.ExchangeAccountID, &bot.Name, &bot.Mode, &bot.Strategy, &bot.Symbol, &bot.QuoteAsset, &bot.Capital, &bot.Status, &configJSON, &bot.CreatedAt, &bot.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(configJSON, &bot.Config); err != nil {
			return nil, err
		}
		bots = append(bots, bot)
	}
	return bots, nil
}

func eventTypeForBotStatus(status domain.BotStatus) domain.EventType {
	switch status {
	case domain.BotStatusPaused:
		return domain.EventTypeBotPaused
	case domain.BotStatusStopped:
		return domain.EventTypeBotStopped
	case domain.BotStatusError:
		return domain.EventTypeBotError
	default:
		return domain.EventTypeBotActivated
	}
}
