package risk

import (
	"testing"
	"wch-trading-platform/packages/go/domain"
)

func TestValidateRiskUpdateRequestRejectsTakeProfitBelowStopLoss(t *testing.T) {
	stopLoss := 5.0
	takeProfit := 4.0

	err := ValidateRiskUpdateRequest(UpdateRiskRequest{
		StopLossPercent:   &stopLoss,
		TakeProfitPercent: &takeProfit,
	})
	if err == nil {
		t.Fatal("expected validation error when take profit is not above stop loss")
	}
}

func TestMergeRiskSettingsAppliesPartialUpdates(t *testing.T) {
	current := &domain.RiskSettings{
		BotID:             "bot-1",
		EmergencyStop:     false,
		MaxPositionSize:   floatPtr(0.1),
		MaxDailyLoss:      floatPtr(100),
		StopLossPercent:   floatPtr(3),
		TakeProfitPercent: floatPtr(6),
	}
	newStop := true
	newDailyLoss := 150.0

	updated := MergeRiskSettings(current, UpdateRiskRequest{
		MaxDailyLoss:  &newDailyLoss,
		EmergencyStop: &newStop,
	})

	if updated.MaxDailyLoss == nil || *updated.MaxDailyLoss != 150 {
		t.Fatalf("expected daily loss to be updated, got %#v", updated.MaxDailyLoss)
	}
	if !updated.EmergencyStop {
		t.Fatal("expected emergency stop to be updated")
	}
	if updated.MaxPositionSize == nil || *updated.MaxPositionSize != 0.1 {
		t.Fatalf("expected untouched field to remain, got %#v", updated.MaxPositionSize)
	}
}

func floatPtr(v float64) *float64 {
	return &v
}
