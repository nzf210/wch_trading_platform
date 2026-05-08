package scanner

import (
	"testing"
	"time"
	"wch-trading-platform/packages/go/domain"
)

func TestBuildSignalProducesV2Fields(t *testing.T) {
	now := time.Date(2026, 5, 8, 12, 0, 0, 0, time.UTC)
	bot := domain.Bot{
		ID:         "bot-1",
		UserID:     "user-1",
		Strategy:   "random",
		Symbol:     "BTCUSDT",
		QuoteAsset: "USDT",
		Capital:    1000,
	}

	signal := BuildSignal(bot, domain.SignalActionBuy, SignalContext{
		CorrelationID: "corr-1",
		Exchange:      "binance",
		Price:         101.25,
		Confidence:    0.95,
		Reason:        "strategy match",
	}, now)

	if signal.SchemaVersion != signalSchemaVersion {
		t.Fatalf("expected schema version %q, got %q", signalSchemaVersion, signal.SchemaVersion)
	}
	if signal.TTLMs != signalTTL.Milliseconds() {
		t.Fatalf("expected ttl %d, got %d", signalTTL.Milliseconds(), signal.TTLMs)
	}
	if signal.DedupKey == "" {
		t.Fatal("expected dedup key")
	}
	if signal.Provenance.Source != scannerSource {
		t.Fatalf("expected provenance source %q, got %q", scannerSource, signal.Provenance.Source)
	}
	if signal.FeatureSnapshot["price"] != 101.25 {
		t.Fatalf("expected feature snapshot price")
	}
}
