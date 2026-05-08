package scanner

import (
	"testing"
	"time"
	"wch-trading-platform/packages/go/domain"
)

func TestBuildOrderIntentUsesCapitalBasedSizing(t *testing.T) {
	now := time.Date(2026, 5, 8, 12, 0, 0, 0, time.UTC)
	bot := domain.Bot{
		ID:      "bot-1",
		UserID:  "user-1",
		Capital: 1000,
		Config: domain.JSONObject{
			botConfigOrderAllocationPctKey: 0.02,
			botConfigQuantityPrecisionKey:  6,
		},
	}
	price := 200.0
	signal := domain.Signal{
		ID:       "signal-1",
		DedupKey: "dedup-1",
		Action:   domain.SignalActionBuy,
		Price:    &price,
		Payload: domain.JSONObject{
			"reason": "trend breakout",
		},
	}

	intent, err := BuildOrderIntent(bot, signal, now)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if intent.Side != domain.OrderSideBuy {
		t.Fatalf("expected buy side, got %s", intent.Side)
	}
	if intent.OrderType != domain.OrderTypeMarket {
		t.Fatalf("expected market order type, got %s", intent.OrderType)
	}
	if intent.Quantity != 0.1 {
		t.Fatalf("expected quantity 0.1, got %f", intent.Quantity)
	}
	if intent.Reason != "trend breakout" {
		t.Fatalf("expected reason from payload, got %q", intent.Reason)
	}
	if intent.SignalID == nil || *intent.SignalID != signal.ID {
		t.Fatalf("expected signal id %q, got %+v", signal.ID, intent.SignalID)
	}
}

func TestBuildOrderIntentRejectsInvalidPrice(t *testing.T) {
	bot := domain.Bot{
		ID:      "bot-1",
		UserID:  "user-1",
		Capital: 1000,
	}
	signal := domain.Signal{
		ID:       "signal-1",
		DedupKey: "dedup-1",
		Action:   domain.SignalActionSell,
	}

	if _, err := BuildOrderIntent(bot, signal, time.Now().UTC()); err == nil {
		t.Fatal("expected error for missing signal price")
	}
}
