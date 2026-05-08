package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"wch-trading-platform/packages/go/domain"

	_ "github.com/lib/pq"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(url string) (*Repository, error) {
	db, err := sql.Open("postgres", url)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return &Repository{db: db}, nil
}

func (r *Repository) GetActiveBots(ctx context.Context) ([]domain.Bot, error) {
	query := `
		SELECT id, user_id, exchange_account_id, name, mode, strategy, symbol, quote_asset, capital, status, config
		FROM bots
		WHERE status IN ('paper_active', 'live_active')
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bots []domain.Bot
	for rows.Next() {
		var b domain.Bot
		var configJSON []byte
		err := rows.Scan(&b.ID, &b.UserID, &b.ExchangeAccountID, &b.Name, &b.Mode, &b.Strategy, &b.Symbol, &b.QuoteAsset, &b.Capital, &b.Status, &configJSON)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(configJSON, &b.Config); err != nil {
			return nil, err
		}
		bots = append(bots, b)
	}
	return bots, nil
}

func (r *Repository) SaveSignal(ctx context.Context, signal *domain.Signal) error {
	query := `
		INSERT INTO scanner_signals (id, bot_id, user_id, exchange, symbol, strategy, action, price, confidence, schema_version, feature_snapshot, ttl_ms, dedup_key, provenance, payload, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`
	payloadJSON, _ := json.Marshal(signal.Payload)
	featureSnapshotJSON, _ := json.Marshal(signal.FeatureSnapshot)
	provenanceJSON, _ := json.Marshal(signal.Provenance)
	_, err := r.db.ExecContext(ctx, query,
		signal.ID, signal.BotID, signal.UserID, signal.Exchange, signal.Symbol, signal.Strategy, signal.Action, signal.Price, signal.Confidence, signal.SchemaVersion, featureSnapshotJSON, signal.TTLMs, signal.DedupKey, provenanceJSON, payloadJSON, signal.Status, signal.CreatedAt,
	)
	return err
}
