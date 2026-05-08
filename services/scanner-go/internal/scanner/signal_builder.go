package scanner

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"os"
	"time"
	"wch-trading-platform/packages/go/domain"
)

const (
	signalSchemaVersion = "v2"
	signalTTL           = 30 * time.Second
	scannerSource       = "scanner-go"
	scannerVersion      = "2026-05-08"
)

type SignalContext struct {
	CorrelationID string
	Exchange      string
	Price         float64
	Confidence    float64
	Reason        string
}

func BuildSignal(bot domain.Bot, action domain.SignalAction, ctx SignalContext, now time.Time) domain.Signal {
	hostname, _ := os.Hostname()
	dedupKey := buildDedupKey(bot, action, ctx, now)

	return domain.Signal{
		ID:            dedupKeyToIDSeed(dedupKey, now),
		BotID:         bot.ID,
		UserID:        bot.UserID,
		Exchange:      ctx.Exchange,
		Symbol:        bot.Symbol,
		Strategy:      bot.Strategy,
		Action:        action,
		Price:         &ctx.Price,
		Confidence:    ctx.Confidence,
		Status:        domain.SignalStatusPending,
		SchemaVersion: signalSchemaVersion,
		FeatureSnapshot: domain.JSONObject{
			"price":       ctx.Price,
			"capital":     bot.Capital,
			"quote_asset": bot.QuoteAsset,
		},
		TTLMs:    signalTTL.Milliseconds(),
		DedupKey: dedupKey,
		Provenance: domain.Provenance{
			Source:   scannerSource,
			Version:  scannerVersion,
			Hostname: hostnameOrNil(hostname),
		},
		Payload: domain.JSONObject{
			"reason":         ctx.Reason,
			"correlation_id": ctx.CorrelationID,
			"generated_at":   now.Format(time.RFC3339),
		},
		CreatedAt: now,
	}
}

func buildDedupKey(bot domain.Bot, action domain.SignalAction, ctx SignalContext, now time.Time) string {
	window := now.UTC().Truncate(signalTTL).Format(time.RFC3339)
	raw := fmt.Sprintf("%s:%s:%s:%s:%s:%s", bot.ID, ctx.Exchange, bot.Symbol, bot.Strategy, action, window)
	hash := sha1.Sum([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func dedupKeyToIDSeed(dedupKey string, now time.Time) string {
	raw := fmt.Sprintf("%s:%d", dedupKey, now.UnixNano())
	hash := sha1.Sum([]byte(raw))
	return hex.EncodeToString(hash[:16])
}

func hostnameOrNil(hostname string) *string {
	if hostname == "" {
		return nil
	}
	return &hostname
}
