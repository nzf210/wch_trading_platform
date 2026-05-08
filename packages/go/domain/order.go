package domain

import (
	"time"
)

type OrderIntentStatus string

const (
	OrderIntentStatusCreated    OrderIntentStatus = "created"
	OrderIntentStatusValidated  OrderIntentStatus = "validated"
	OrderIntentStatusRejected   OrderIntentStatus = "rejected"
	OrderIntentStatusSuperseded OrderIntentStatus = "superseded"
)

type OrderStatus string

const (
	OrderStatusPending         OrderStatus = "pending"
	OrderStatusSubmitted       OrderStatus = "submitted"
	OrderStatusAccepted        OrderStatus = "accepted"
	OrderStatusRejected        OrderStatus = "rejected"
	OrderStatusCancelled       OrderStatus = "cancelled"
	OrderStatusFilled          OrderStatus = "filled"
	OrderStatusPartiallyFilled OrderStatus = "partially_filled"
	OrderStatusFailed          OrderStatus = "failed"
)

type OrderSide string

const (
	OrderSideBuy  OrderSide = "buy"
	OrderSideSell OrderSide = "sell"
)

type OrderType string

const (
	OrderTypeMarket OrderType = "market"
	OrderTypeLimit  OrderType = "limit"
)

type OrderIntent struct {
	ID        string            `json:"id"`
	BotID     string            `json:"bot_id"`
	UserID    string            `json:"user_id"`
	SignalID  *string           `json:"signal_id,omitempty"`
	Side      OrderSide         `json:"side"`
	OrderType OrderType         `json:"order_type"`
	Quantity  float64           `json:"quantity"`
	Price     *float64          `json:"price,omitempty"`
	Status    OrderIntentStatus `json:"status"`
	Reason    string            `json:"reason,omitempty"`
	CreatedAt time.Time         `json:"created_at"`
}

type Order struct {
	ID              string      `json:"id"`
	BotID           string      `json:"bot_id"`
	UserID          string      `json:"user_id"`
	SignalID        *string     `json:"signal_id,omitempty"`
	OrderIntentID   string      `json:"order_intent_id"`
	Exchange        string      `json:"exchange"`
	Symbol          string      `json:"symbol"`
	Side            OrderSide   `json:"side"`
	OrderType       OrderType   `json:"order_type"`
	Quantity        float64     `json:"quantity"`
	Price           *float64    `json:"price,omitempty"`
	Status          OrderStatus `json:"status"`
	ExchangeOrderID string      `json:"exchange_order_id,omitempty"`
	IdempotencyKey  string      `json:"idempotency_key"`
	RawResponse     JSONObject  `json:"raw_response,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}
