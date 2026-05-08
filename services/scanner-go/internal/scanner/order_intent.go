package scanner

import (
	"fmt"
	"math"
	"time"
	"wch-trading-platform/packages/go/domain"
)

const (
	defaultOrderAllocationPct = 0.01
	defaultQuantityPrecision  = 6

	botConfigOrderAllocationPctKey = "order_allocation_pct"
	botConfigMaxNotionalKey        = "max_order_notional"
	botConfigQuantityPrecisionKey  = "quantity_precision"
)

func BuildOrderIntent(bot domain.Bot, signal domain.Signal, now time.Time) (domain.OrderIntent, error) {
	if signal.Price == nil || *signal.Price <= 0 {
		return domain.OrderIntent{}, fmt.Errorf("signal price is required to build order intent")
	}

	quantity, err := deriveOrderQuantity(bot, *signal.Price)
	if err != nil {
		return domain.OrderIntent{}, err
	}

	reason := "signal generated order intent"
	if signalReason, ok := signal.Payload["reason"].(string); ok && signalReason != "" {
		reason = signalReason
	}

	signalID := signal.ID
	price := *signal.Price

	return domain.OrderIntent{
		ID:        dedupKeyToIDSeed(signal.DedupKey+"-intent", now),
		BotID:     bot.ID,
		UserID:    bot.UserID,
		SignalID:  &signalID,
		Side:      domain.OrderSide(signal.Action),
		OrderType: domain.OrderTypeMarket,
		Quantity:  quantity,
		Price:     &price,
		Status:    domain.OrderIntentStatusCreated,
		Reason:    reason,
		CreatedAt: now,
	}, nil
}

func deriveOrderQuantity(bot domain.Bot, price float64) (float64, error) {
	if price <= 0 {
		return 0, fmt.Errorf("price must be greater than zero")
	}
	if bot.Capital <= 0 {
		return 0, fmt.Errorf("bot capital must be greater than zero")
	}

	allocationPct := defaultOrderAllocationPct
	if value, ok := configFloat64(bot.Config, botConfigOrderAllocationPctKey); ok && value > 0 {
		allocationPct = value
	}

	notional := bot.Capital * allocationPct
	if maxNotional, ok := configFloat64(bot.Config, botConfigMaxNotionalKey); ok && maxNotional > 0 && maxNotional < notional {
		notional = maxNotional
	}

	quantity := notional / price
	precision := defaultQuantityPrecision
	if value, ok := configInt(bot.Config, botConfigQuantityPrecisionKey); ok && value >= 0 && value <= 12 {
		precision = value
	}

	quantity = roundDown(quantity, precision)
	if quantity <= 0 {
		return 0, fmt.Errorf("derived quantity must be greater than zero")
	}

	return quantity, nil
}

func configFloat64(config domain.JSONObject, key string) (float64, bool) {
	raw, ok := config[key]
	if !ok {
		return 0, false
	}

	value, ok := raw.(float64)
	return value, ok
}

func configInt(config domain.JSONObject, key string) (int, bool) {
	raw, ok := config[key]
	if !ok {
		return 0, false
	}

	switch value := raw.(type) {
	case float64:
		return int(value), true
	case int:
		return value, true
	default:
		return 0, false
	}
}

func roundDown(value float64, precision int) float64 {
	if precision < 0 {
		precision = 0
	}

	factor := math.Pow10(precision)
	return math.Floor(value*factor) / factor
}
