package risk

import (
	"context"
	"database/sql"
	"fmt"
	"wch-trading-platform/packages/go/domain"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetByBotID(ctx context.Context, botID string) (*domain.RiskSettings, error) {
	risk := &domain.RiskSettings{}
	query := `
		SELECT id, bot_id, max_position_size, max_daily_loss, stop_loss_percent, take_profit_percent, emergency_stop, created_at, updated_at
		FROM risk_settings WHERE bot_id = $1
	`
	err := r.db.QueryRowContext(ctx, query, botID).Scan(
		&risk.ID, &risk.BotID, &risk.MaxPositionSize, &risk.MaxDailyLoss, &risk.StopLossPercent, &risk.TakeProfitPercent, &risk.EmergencyStop, &risk.CreatedAt, &risk.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("risk settings not found for bot: %s", botID)
		}
		return nil, err
	}
	return risk, nil
}

func (r *Repository) Update(ctx context.Context, risk *domain.RiskSettings) error {
	query := `
		UPDATE risk_settings
		SET max_position_size = $1, max_daily_loss = $2, stop_loss_percent = $3, take_profit_percent = $4, emergency_stop = $5, updated_at = NOW()
		WHERE bot_id = $6
	`
	_, err := r.db.ExecContext(ctx, query,
		risk.MaxPositionSize, risk.MaxDailyLoss, risk.StopLossPercent, risk.TakeProfitPercent, risk.EmergencyStop, risk.BotID,
	)
	return err
}

func (r *Repository) SetEmergencyStop(ctx context.Context, botID string, stop bool) error {
	query := `UPDATE risk_settings SET emergency_stop = $1, updated_at = NOW() WHERE bot_id = $2`
	_, err := r.db.ExecContext(ctx, query, stop, botID)
	return err
}

func (r *Repository) SetGlobalEmergencyStop(ctx context.Context, userID string, stop bool) error {
	query := `
		UPDATE risk_settings
		SET emergency_stop = $1, updated_at = NOW()
		WHERE bot_id IN (SELECT id FROM bots WHERE user_id = $2)
	`
	_, err := r.db.ExecContext(ctx, query, stop, userID)
	return err
}
