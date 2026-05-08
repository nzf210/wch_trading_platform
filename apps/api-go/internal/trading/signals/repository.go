package signals

import (
	"context"
	"database/sql"
	"encoding/json"
	"wch-trading-platform/packages/go/domain"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListByUserID(ctx context.Context, userID string) ([]domain.Signal, error) {
	query := `
		SELECT id, bot_id, user_id, exchange, symbol, strategy, action, price, confidence, schema_version, feature_snapshot, ttl_ms, dedup_key, provenance, payload, status, created_at
		FROM scanner_signals
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 100
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var signals []domain.Signal
	for rows.Next() {
		var signal domain.Signal
		var featureSnapshotJSON []byte
		var provenanceJSON []byte
		var payloadJSON []byte
		if err := rows.Scan(&signal.ID, &signal.BotID, &signal.UserID, &signal.Exchange, &signal.Symbol, &signal.Strategy, &signal.Action, &signal.Price, &signal.Confidence, &signal.SchemaVersion, &featureSnapshotJSON, &signal.TTLMs, &signal.DedupKey, &provenanceJSON, &payloadJSON, &signal.Status, &signal.CreatedAt); err != nil {
			return nil, err
		}
		if len(featureSnapshotJSON) > 0 {
			if err := json.Unmarshal(featureSnapshotJSON, &signal.FeatureSnapshot); err != nil {
				return nil, err
			}
		}
		if signal.FeatureSnapshot == nil {
			signal.FeatureSnapshot = domain.JSONObject{}
		}
		if len(provenanceJSON) > 0 {
			if err := json.Unmarshal(provenanceJSON, &signal.Provenance); err != nil {
				return nil, err
			}
		}
		if len(payloadJSON) > 0 {
			if err := json.Unmarshal(payloadJSON, &signal.Payload); err != nil {
				return nil, err
			}
		}
		if signal.Payload == nil {
			signal.Payload = domain.JSONObject{}
		}
		if signal.SchemaVersion == "" {
			signal.SchemaVersion = "v1"
		}
		if signal.DedupKey == "" {
			signal.DedupKey = signal.ID
		}
		if signal.Provenance.Source == "" {
			signal.Provenance = domain.Provenance{
				Source:  "scanner-go",
				Version: "v1",
			}
		}
		signals = append(signals, signal)
	}
	return signals, nil
}
