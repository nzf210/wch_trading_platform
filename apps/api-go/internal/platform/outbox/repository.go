package outbox

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
	"wch-trading-platform/packages/go/domain"

	"github.com/google/uuid"
)

type Event struct {
	ID        string           `json:"id"`
	Type      domain.EventType `json:"event_type"`
	Payload   json.RawMessage  `json:"payload"`
	Metadata  json.RawMessage  `json:"metadata"`
	Status    string           `json:"status"`
	CreatedAt time.Time        `json:"created_at"`
}

type Metadata struct {
	Producer       string     `json:"producer,omitempty"`
	TenantID       *string    `json:"tenant_id,omitempty"`
	UserID         *string    `json:"user_id,omitempty"`
	BotID          *string    `json:"bot_id,omitempty"`
	CorrelationID  string     `json:"correlation_id,omitempty"`
	CausationID    *string    `json:"causation_id,omitempty"`
	IdempotencyKey string     `json:"idempotency_key,omitempty"`
	OccurredAt     *time.Time `json:"occurred_at,omitempty"`
}

func SaveEvent(ctx context.Context, tx *sql.Tx, eventType domain.EventType, payload any, metadata *Metadata) error {
	normalized := normalizeMetadata(ctx, metadata)

	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	metadataJSON, err := json.Marshal(normalized)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO outbox_events (id, event_type, payload, metadata, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err = tx.ExecContext(ctx, query,
		uuid.New().String(), eventType, payloadJSON, metadataJSON, "pending", time.Now(),
	)
	return err
}

func normalizeMetadata(ctx context.Context, metadata *Metadata) Metadata {
	if metadata == nil {
		metadata = &Metadata{}
	}

	normalized := *metadata
	if normalized.Producer == "" {
		normalized.Producer = "apps/api-go"
	}
	if normalized.CorrelationID == "" {
		if correlationID, ok := ctx.Value(domain.CorrelationIDKey).(string); ok {
			normalized.CorrelationID = correlationID
		}
	}
	if normalized.IdempotencyKey == "" {
		normalized.IdempotencyKey = uuid.New().String()
	}
	if normalized.OccurredAt == nil {
		now := time.Now().UTC()
		normalized.OccurredAt = &now
	}

	return normalized
}
