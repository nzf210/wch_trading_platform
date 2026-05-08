package strategies

import "wch-trading-platform/packages/go/domain"

type Strategy interface {
	Name() string
	Check(bot domain.Bot) (bool, domain.SignalAction)
}

type RandomStrategy struct{}

func (s *RandomStrategy) Name() string { return "random" }
func (s *RandomStrategy) Check(bot domain.Bot) (bool, domain.SignalAction) {
	// Simple simulation logic
	return false, domain.SignalActionBuy
}
