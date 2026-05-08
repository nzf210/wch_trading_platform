package subscription

import (
	"context"
	"fmt"
	"wch-trading-platform/packages/go/domain"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetActiveSubscription(ctx context.Context, userID string) (*domain.Subscription, *domain.Plan, error) {
	return s.repo.GetActiveSubscription(ctx, userID)
}

func (s *Service) CheckEntitlement(ctx context.Context, userID string, mode domain.BotMode, currentCount int) error {
	_, plan, err := s.repo.GetActiveSubscription(ctx, userID)
	if err != nil {
		// Default to free plan limits if no subscription found? 
		// For now, let's assume no subscription = no live bots, 1 paper bot.
		if mode == domain.BotModeLive {
			return fmt.Errorf("active subscription required for live trading")
		}
		if currentCount >= 1 {
			return fmt.Errorf("free plan limit reached: 1 paper bot max")
		}
		return nil
	}

	if mode == domain.BotModeLive {
		if currentCount >= plan.MaxLiveBots {
			return fmt.Errorf("plan limit reached: max %d live bots", plan.MaxLiveBots)
		}
	} else {
		if currentCount >= plan.MaxPaperBots {
			return fmt.Errorf("plan limit reached: max %d paper bots", plan.MaxPaperBots)
		}
	}

	return nil
}
