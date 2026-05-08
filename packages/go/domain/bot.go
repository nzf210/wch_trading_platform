package domain

import (
	"time"
)

type BotStatus string

const (
	BotStatusDraft               BotStatus = "draft"
	BotStatusPaperActive         BotStatus = "paper_active"
	BotStatusLivePendingApproval BotStatus = "live_pending_approval"
	BotStatusLiveActive           BotStatus = "live_active"
	BotStatusPaused              BotStatus = "paused"
	BotStatusStopped             BotStatus = "stopped"
	BotStatusError               BotStatus = "error"
)

type BotMode string

const (
	BotModePaper BotMode = "paper"
	BotModeLive  BotMode = "live"
)

type Bot struct {
	ID                string                 `json:"id"`
	UserID            string                 `json:"user_id"`
	ExchangeAccountID *string                `json:"exchange_account_id,omitempty"`
	Name              string                 `json:"name"`
	Mode              BotMode                `json:"mode"`
	Strategy          string                 `json:"strategy"`
	Symbol            string                 `json:"symbol"`
	QuoteAsset        string                 `json:"quote_asset"`
	Capital           float64                `json:"capital"`
	Status            BotStatus              `json:"status"`
	Config            JSONObject             `json:"config"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

type RiskSettings struct {
	ID                string    `json:"id"`
	BotID             string    `json:"bot_id"`
	MaxPositionSize   *float64  `json:"max_position_size,omitempty"`
	MaxDailyLoss      *float64  `json:"max_daily_loss,omitempty"`
	StopLossPercent   *float64  `json:"stop_loss_percent,omitempty"`
	TakeProfitPercent *float64  `json:"take_profit_percent,omitempty"`
	EmergencyStop     bool      `json:"emergency_stop"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
