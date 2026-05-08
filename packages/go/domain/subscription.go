package domain

import (
	"time"
)

type SubscriptionStatus string

const (
	SubscriptionStatusActive         SubscriptionStatus = "active"
	SubscriptionStatusExpired        SubscriptionStatus = "expired"
	SubscriptionStatusCancelled      SubscriptionStatus = "cancelled"
	SubscriptionStatusPendingPayment SubscriptionStatus = "pending_payment"
)

type Plan struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Code         string                 `json:"code"`
	PriceWch     float64                `json:"price_wch"`
	MaxLiveBots  int                    `json:"max_live_bots"`
	MaxPaperBots int                    `json:"max_paper_bots"`
	Features     JSONObject             `json:"features"`
	CreatedAt    time.Time              `json:"created_at"`
}

type Subscription struct {
	ID            string             `json:"id"`
	UserID        string             `json:"user_id"`
	PlanID        string             `json:"plan_id"`
	Status        SubscriptionStatus `json:"status"`
	PaidAmountWch float64            `json:"paid_amount_wch"`
	StartedAt     time.Time          `json:"started_at"`
	ExpiresAt     *time.Time         `json:"expires_at,omitempty"`
	CreatedAt     time.Time          `json:"created_at"`
}
