package risk

import (
	"fmt"
	"wch-trading-platform/packages/go/domain"
)

const (
	maxAllowedPositionSize   = 1.0
	maxAllowedDailyLoss      = 5000.0
	maxAllowedDrawdown       = 50.0
	maxAllowedStopLoss       = 20.0
	maxAllowedTakeProfit     = 50.0
	maxAllowedTrailingStop   = 10.0
)

type UpdateRiskRequest struct {
	MaxPositionSize     *float64 `json:"max_position_size,omitempty"`
	MaxDailyLoss        *float64 `json:"max_daily_loss,omitempty"`
	MaxDrawdownPercent  *float64 `json:"max_drawdown_percent,omitempty"`
	StopLossPercent     *float64 `json:"stop_loss_percent,omitempty"`
	TakeProfitPercent   *float64 `json:"take_profit_percent,omitempty"`
	TrailingStopPercent *float64 `json:"trailing_stop_percent,omitempty"`
	EmergencyStop       *bool    `json:"emergency_stop,omitempty"`
}

type EmergencyStopRequest struct {
	Stop bool `json:"stop"`
}

func ValidateRiskUpdateRequest(req UpdateRiskRequest) error {
	if req.MaxPositionSize != nil {
		if *req.MaxPositionSize <= 0 {
			return fmt.Errorf("max_position_size must be greater than zero")
		}
		if *req.MaxPositionSize > maxAllowedPositionSize {
			return fmt.Errorf("max_position_size must be at most %.2f", maxAllowedPositionSize)
		}
	}

	if req.MaxDailyLoss != nil {
		if *req.MaxDailyLoss <= 0 {
			return fmt.Errorf("max_daily_loss must be greater than zero")
		}
		if *req.MaxDailyLoss > maxAllowedDailyLoss {
			return fmt.Errorf("max_daily_loss must be at most %.2f", maxAllowedDailyLoss)
		}
	}

	if req.MaxDrawdownPercent != nil {
		if *req.MaxDrawdownPercent <= 0 {
			return fmt.Errorf("max_drawdown_percent must be greater than zero")
		}
		if *req.MaxDrawdownPercent > maxAllowedDrawdown {
			return fmt.Errorf("max_drawdown_percent must be at most %.2f", maxAllowedDrawdown)
		}
	}

	if req.StopLossPercent != nil {
		if *req.StopLossPercent <= 0 {
			return fmt.Errorf("stop_loss_percent must be greater than zero")
		}
		if *req.StopLossPercent > maxAllowedStopLoss {
			return fmt.Errorf("stop_loss_percent must be at most %.2f", maxAllowedStopLoss)
		}
	}

	if req.TakeProfitPercent != nil {
		if *req.TakeProfitPercent <= 0 {
			return fmt.Errorf("take_profit_percent must be greater than zero")
		}
		if *req.TakeProfitPercent > maxAllowedTakeProfit {
			return fmt.Errorf("take_profit_percent must be at most %.2f", maxAllowedTakeProfit)
		}
	}

	if req.TrailingStopPercent != nil {
		if *req.TrailingStopPercent <= 0 {
			return fmt.Errorf("trailing_stop_percent must be greater than zero")
		}
		if *req.TrailingStopPercent > maxAllowedTrailingStop {
			return fmt.Errorf("trailing_stop_percent must be at most %.2f", maxAllowedTrailingStop)
		}
	}

	if req.StopLossPercent != nil && req.TakeProfitPercent != nil && *req.TakeProfitPercent <= *req.StopLossPercent {
		return fmt.Errorf("take_profit_percent must be greater than stop_loss_percent")
	}

	return nil
}

func MergeRiskSettings(current *domain.RiskSettings, req UpdateRiskRequest) *domain.RiskSettings {
	updated := *current

	if req.MaxPositionSize != nil {
		updated.MaxPositionSize = req.MaxPositionSize
	}
	if req.MaxDailyLoss != nil {
		updated.MaxDailyLoss = req.MaxDailyLoss
	}
	if req.MaxDrawdownPercent != nil {
		updated.MaxDrawdownPercent = req.MaxDrawdownPercent
	}
	if req.StopLossPercent != nil {
		updated.StopLossPercent = req.StopLossPercent
	}
	if req.TakeProfitPercent != nil {
		updated.TakeProfitPercent = req.TakeProfitPercent
	}
	if req.TrailingStopPercent != nil {
		updated.TrailingStopPercent = req.TrailingStopPercent
	}
	if req.EmergencyStop != nil {
		updated.EmergencyStop = *req.EmergencyStop
	}

	return &updated
}

func ValidateEmergencyStopChange(current *domain.RiskSettings, stop bool) error {
	if current.EmergencyStop == stop {
		if stop {
			return fmt.Errorf("emergency stop is already active")
		}
		return fmt.Errorf("emergency stop is already inactive")
	}
	return nil
}
