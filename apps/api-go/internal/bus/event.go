
package bus

import "time"

// EventEnvelope is the structure of events coming from the Redis stream.
// It mirrors the structure from the Rust services.
type EventEnvelope struct {
	EventID       string    `json:"event_id"`
	EventType     string    `json:"event_type"`
	EventVersion  string    `json:"event_version"`
	OccurredAt    time.Time `json:"occurred_at"`
	Producer      string    `json:"producer"`
	TenantID      *string   `json:"tenant_id"`
	UserID        *string   `json:"user_id"`
	BotID         *string   `json:"bot_id"`
	CorrelationID string    `json:"correlation_id"`
	CausationID   *string   `json:"causation_id"`
	IdempotencyKey string   `json:"idempotency_key"`
	Payload       any       `json:"payload"`
	Metadata      any       `json:"metadata"`
}
