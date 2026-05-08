package domain

import (
	"time"
)

type ExecutionStatus string

const (
	ExecutionStatusPending   ExecutionStatus = "pending"
	ExecutionStatusCompleted ExecutionStatus = "completed"
	ExecutionStatusFailed    ExecutionStatus = "failed"
)

type Execution struct {
	ID             string          `json:"id"`
	OrderID        string          `json:"order_id"`
	BotID          string          `json:"bot_id"`
	UserID         string          `json:"user_id"`
	FilledQuantity float64         `json:"filled_quantity"`
	AveragePrice   float64         `json:"average_price"`
	Fee            float64         `json:"fee"`
	PnL            *float64        `json:"pnl,omitempty"`
	Status         ExecutionStatus `json:"status"`
	ExecutedAt     time.Time       `json:"executed_at"`
	CreatedAt      time.Time       `json:"created_at"`
}
