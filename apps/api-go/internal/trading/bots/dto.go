package bots

import (
	"wch-trading-platform/packages/go/domain"
)

type CreateBotRequest struct {
	Name              string              `json:"name" validate:"required"`
	Strategy          string              `json:"strategy" validate:"required"`
	Symbol            string              `json:"symbol" validate:"required"`
	QuoteAsset        string              `json:"quote_asset" validate:"required"`
	Capital           float64             `json:"capital" validate:"required,gt=0"`
	ExchangeAccountID *string             `json:"exchange_account_id,omitempty"`
	Config            domain.JSONObject   `json:"config"`
	RiskSettings      RiskSettingsRequest `json:"risk_settings"`
}

type RiskSettingsRequest struct {
	MaxPositionSize   *float64 `json:"max_position_size,omitempty"`
	MaxDailyLoss      *float64 `json:"max_daily_loss,omitempty"`
	StopLossPercent   *float64 `json:"stop_loss_percent,omitempty"`
	TakeProfitPercent *float64 `json:"take_profit_percent,omitempty"`
}

type BotResponse struct {
	Bot          domain.Bot          `json:"bot"`
	RiskSettings domain.RiskSettings `json:"risk_settings"`
}

type LifecycleMessageResponse struct {
	Message string `json:"message"`
}

type BotStatusChangedEvent struct {
	BotID     string           `json:"bot_id"`
	OldStatus domain.BotStatus `json:"old_status"`
	NewStatus domain.BotStatus `json:"new_status"`
	Reason    string           `json:"reason,omitempty"`
}

type UpdateBotStatusRequest struct {
	Status domain.BotStatus `json:"status" validate:"required"`
}
