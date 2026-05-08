package redis

import "wch-trading-platform/packages/go/domain"

const (
	StreamControlEvents = "stream.control-events"
	StreamMarketEvents  = "stream.market-events"
	StreamTradeEvents   = "stream.trade-events"
	StreamNotifications = "stream.notifications"
	OrderIntentQueue    = "order_intents"
)

func StreamForEventType(eventType domain.EventType) string {
	switch eventType {
	case domain.EventTypeSignalGenerated:
		return StreamMarketEvents
	case domain.EventTypeOrderSubmitted, domain.EventTypeExecutionFilled:
		return StreamTradeEvents
	default:
		return StreamControlEvents
	}
}
