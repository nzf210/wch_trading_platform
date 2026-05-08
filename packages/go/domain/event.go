package domain

import (
	"time"
)

type EventType string

type EventEnvelope struct {
	EventID        string      `json:"event_id"`
	EventType      EventType   `json:"event_type"`
	EventVersion   string      `json:"event_version"`
	OccurredAt     time.Time   `json:"occurred_at"`
	Producer       string      `json:"producer"`
	TenantID       *string     `json:"tenant_id,omitempty"`
	UserID         *string     `json:"user_id,omitempty"`
	BotID          *string     `json:"bot_id,omitempty"`
	CorrelationID  string      `json:"correlation_id"`
	CausationID    *string     `json:"causation_id,omitempty"`
	IdempotencyKey string      `json:"idempotency_key"`
	Payload        interface{} `json:"payload"`
}

const (
	// Bot events
	EventTypeBotCreated   EventType = "bot.created"
	EventTypeBotActivated EventType = "bot.activated"
	EventTypeBotPaused    EventType = "bot.paused"
	EventTypeBotStopped   EventType = "bot.stopped"
	EventTypeBotError     EventType = "bot.error"

	// Subscription events
	EventTypeSubscriptionVerified EventType = "subscription.verified"

	// Trading events
	EventTypeSignalGenerated          EventType = "signal.generated"
	EventTypeRiskCheckRequested       EventType = "risk.check.requested"
	EventTypeRiskCheckPassed          EventType = "risk.check.passed"
	EventTypeRiskCheckFailed          EventType = "risk.check.failed"
	EventTypeOrderIntentCreated       EventType = "order.intent.created"
	EventTypeOrderSubmitted           EventType = "order.submitted"
	EventTypeOrderAccepted            EventType = "order.accepted"
	EventTypeOrderRejected            EventType = "order.rejected"
	EventTypeExecutionFilled          EventType = "execution.filled"
	EventTypeExecutionPartiallyFilled EventType = "execution.partially_filled"
	EventTypeExecutionFailed          EventType = "execution.failed"

	// Position events
	EventTypePositionUpdated EventType = "position.updated"
	EventTypePnLUpdated      EventType = "pnl.updated"

	// System events
	EventTypeEmergencyStopActivated EventType = "emergency_stop.activated"
)
