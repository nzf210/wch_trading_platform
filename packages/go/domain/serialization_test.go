package domain

import (
	"encoding/json"
	"testing"
	"time"
)

func TestSignalJSONUsesFrozenWireFields(t *testing.T) {
	now := time.Date(2026, 5, 8, 12, 0, 0, 0, time.UTC)
	price := 101.25
	hostname := "scanner-1"

	signal := Signal{
		ID:            "sig-1",
		BotID:         "bot-1",
		UserID:        "user-1",
		Exchange:      "binance",
		Symbol:        "BTCUSDT",
		Strategy:      "trend_following",
		Action:        SignalActionBuy,
		Price:         &price,
		Confidence:    0.91,
		Status:        SignalStatusPending,
		SchemaVersion: "v2",
		FeatureSnapshot: JSONObject{
			"ema_fast": 10.0,
		},
		TTLMs:    30000,
		DedupKey: "dedup-1",
		Provenance: Provenance{
			Source:   "scanner-go",
			Version:  "2026.05.08",
			Hostname: &hostname,
		},
		Payload: JSONObject{
			"reason": "strategy match",
		},
		CreatedAt: now,
	}

	raw, err := json.Marshal(signal)
	if err != nil {
		t.Fatalf("marshal signal: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshal signal: %v", err)
	}

	expectedKeys := []string{
		"id",
		"bot_id",
		"user_id",
		"exchange",
		"symbol",
		"strategy",
		"action",
		"price",
		"confidence",
		"status",
		"schema_version",
		"feature_snapshot",
		"ttl_ms",
		"dedup_key",
		"provenance",
		"payload",
		"created_at",
	}

	for _, key := range expectedKeys {
		if _, ok := got[key]; !ok {
			t.Fatalf("expected key %q in marshaled signal", key)
		}
	}

	if _, ok := got["schemaVersion"]; ok {
		t.Fatalf("unexpected camelCase key %q in marshaled signal", "schemaVersion")
	}
}

func TestEventEnvelopeJSONOmitsOptionalFieldsWhenEmpty(t *testing.T) {
	envelope := EventEnvelope{
		EventID:        "evt-1",
		EventType:      EventTypeSignalGenerated,
		EventVersion:   "v2",
		OccurredAt:     time.Date(2026, 5, 8, 12, 0, 0, 0, time.UTC),
		Producer:       "scanner-go",
		CorrelationID:  "corr-1",
		IdempotencyKey: "idem-1",
		Payload: JSONObject{
			"signal_id": "sig-1",
		},
	}

	raw, err := json.Marshal(envelope)
	if err != nil {
		t.Fatalf("marshal event envelope: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshal event envelope: %v", err)
	}

	if got["event_type"] != string(EventTypeSignalGenerated) {
		t.Fatalf("unexpected event_type: %#v", got["event_type"])
	}

	for _, key := range []string{"tenant_id", "user_id", "bot_id", "causation_id"} {
		if _, ok := got[key]; ok {
			t.Fatalf("expected optional key %q to be omitted", key)
		}
	}
}
