package outbox

import (
	"context"
	"encoding/json"
	"testing"
	"time"
	platformredis "wch-trading-platform/apps/api-go/internal/platform/redis"
	"wch-trading-platform/packages/go/domain"
)

func TestBuildEnvelopeUsesV2Contract(t *testing.T) {
	occurredAt := time.Date(2026, 5, 8, 14, 0, 0, 0, time.UTC)
	payload := []byte(`{"bot_id":"bot-1","new_status":"paper_active"}`)
	metadata, err := json.Marshal(Metadata{
		Producer:       "apps/api-go",
		UserID:         stringPtr("user-1"),
		BotID:          stringPtr("bot-1"),
		CorrelationID:  "corr-1",
		IdempotencyKey: "idem-1",
		OccurredAt:     &occurredAt,
	})
	if err != nil {
		t.Fatalf("marshal metadata: %v", err)
	}

	ctx := context.WithValue(context.Background(), domain.CorrelationIDKey, "corr-from-context")

	envelope, err := buildEnvelope(ctx, "evt-1", domain.EventTypeBotActivated, payload, metadata)
	if err != nil {
		t.Fatalf("build envelope: %v", err)
	}

	if envelope.EventVersion != "v2" {
		t.Fatalf("expected event version v2, got %q", envelope.EventVersion)
	}
	if envelope.EventType != domain.EventTypeBotActivated {
		t.Fatalf("unexpected event type: %q", envelope.EventType)
	}
	if envelope.Producer != "apps/api-go" || envelope.CorrelationID != "corr-1" || envelope.IdempotencyKey != "idem-1" {
		t.Fatalf("envelope metadata not propagated: %#v", envelope)
	}
	if envelope.CausationID == nil || *envelope.CausationID != "evt-1" {
		t.Fatalf("expected fallback causation_id to equal event id")
	}
	if envelope.UserID == nil || *envelope.UserID != "user-1" {
		t.Fatalf("expected user_id to be propagated")
	}
	if !envelope.OccurredAt.Equal(occurredAt) {
		t.Fatalf("expected occurred_at to be preserved")
	}
}

func TestBuildEnvelopeFallsBackToContextCorrelationID(t *testing.T) {
	payload := []byte(`{"bot_id":"bot-1"}`)

	envelope, err := buildEnvelope(
		context.WithValue(context.Background(), domain.CorrelationIDKey, "corr-from-context"),
		"evt-2",
		domain.EventTypeBotCreated,
		payload,
		nil,
	)
	if err != nil {
		t.Fatalf("build envelope: %v", err)
	}

	if envelope.CorrelationID != "corr-from-context" {
		t.Fatalf("expected correlation id from context, got %q", envelope.CorrelationID)
	}
}

func TestStreamForEventType(t *testing.T) {
	testCases := map[domain.EventType]string{
		domain.EventTypeSignalGenerated: platformredis.StreamMarketEvents,
		domain.EventTypeOrderSubmitted:  platformredis.StreamTradeEvents,
		domain.EventTypeExecutionFilled: platformredis.StreamTradeEvents,
		domain.EventTypeBotCreated:      platformredis.StreamControlEvents,
	}

	for eventType, expected := range testCases {
		if got := platformredis.StreamForEventType(eventType); got != expected {
			t.Fatalf("StreamForEventType(%q) = %q, want %q", eventType, got, expected)
		}
	}
}

func TestOutboxRetryDelayCaps(t *testing.T) {
	if got := outboxRetryDelay(1); got != 5*time.Second {
		t.Fatalf("retry delay for attempt 1 = %s, want 5s", got)
	}
	if got := outboxRetryDelay(3); got != 20*time.Second {
		t.Fatalf("retry delay for attempt 3 = %s, want 20s", got)
	}
	if got := outboxRetryDelay(10); got != 5*time.Minute {
		t.Fatalf("retry delay should cap at 5m, got %s", got)
	}
}

func stringPtr(value string) *string {
	return &value
}
