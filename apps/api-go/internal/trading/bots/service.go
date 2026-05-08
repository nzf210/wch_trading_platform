package bots

import (
	"context"
	"fmt"
	"time"
	"wch-trading-platform/apps/api-go/internal/identity/subscription"
	"wch-trading-platform/apps/api-go/internal/platform/metrics"
	"wch-trading-platform/apps/api-go/internal/trading/risk"
	"wch-trading-platform/packages/go/domain"

	"github.com/google/uuid"
)

type Service struct {
	repo            *Repository
	subscriptionSvc *subscription.Service
}

func NewService(repo *Repository, subscriptionSvc *subscription.Service) *Service {
	return &Service{
		repo:            repo,
		subscriptionSvc: subscriptionSvc,
	}
}

func (s *Service) CreateBot(ctx context.Context, userID string, req CreateBotRequest) (*domain.Bot, *domain.RiskSettings, error) {
	if err := ValidateCreateBotRequest(&req); err != nil {
		return nil, nil, err
	}
	if err := risk.ValidateRiskUpdateRequest(risk.UpdateRiskRequest{
		MaxPositionSize:   req.RiskSettings.MaxPositionSize,
		MaxDailyLoss:      req.RiskSettings.MaxDailyLoss,
		StopLossPercent:   req.RiskSettings.StopLossPercent,
		TakeProfitPercent: req.RiskSettings.TakeProfitPercent,
	}); err != nil {
		return nil, nil, err
	}

	// Check entitlement
	existingBots, err := s.repo.ListBotsByUserID(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	paperCount := 0
	for _, b := range existingBots {
		if b.Mode == domain.BotModePaper {
			paperCount++
		}
	}

	if err := s.subscriptionSvc.CheckEntitlement(ctx, userID, domain.BotModePaper, paperCount); err != nil {
		return nil, nil, err
	}

	botID := uuid.New().String()
	now := time.Now()

	bot := &domain.Bot{
		ID:                botID,
		UserID:            userID,
		ExchangeAccountID: req.ExchangeAccountID,
		Name:              req.Name,
		Mode:              domain.BotModePaper, // Default to paper
		Strategy:          req.Strategy,
		Symbol:            req.Symbol,
		QuoteAsset:        req.QuoteAsset,
		Capital:           req.Capital,
		Status:            domain.BotStatusDraft,
		Config:            req.Config,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	risk := &domain.RiskSettings{
		ID:                uuid.New().String(),
		BotID:             botID,
		MaxPositionSize:   req.RiskSettings.MaxPositionSize,
		MaxDailyLoss:      req.RiskSettings.MaxDailyLoss,
		StopLossPercent:   req.RiskSettings.StopLossPercent,
		TakeProfitPercent: req.RiskSettings.TakeProfitPercent,
		EmergencyStop:     false,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	if err := s.repo.CreateBot(ctx, bot, risk); err != nil {
		metrics.BotLifecycleEventsTotal.WithLabelValues("create", "failed").Inc()
		return nil, nil, err
	}

	metrics.BotLifecycleEventsTotal.WithLabelValues("create", "success").Inc()
	return bot, risk, nil
}

func (s *Service) ActivatePaper(ctx context.Context, botID string) error {
	bot, _, err := s.repo.GetBotByID(ctx, botID)
	if err != nil {
		return err
	}
	if bot.Status != domain.BotStatusDraft && bot.Status != domain.BotStatusPaused {
		return fmt.Errorf("bot can only activate paper mode from draft or paused state")
	}
	err = s.repo.UpdateBotStatus(ctx, botID, domain.BotStatusPaperActive, "user activated paper mode")
	if err != nil {
		metrics.BotLifecycleEventsTotal.WithLabelValues("activate_paper", "failed").Inc()
		return err
	}
	metrics.BotLifecycleEventsTotal.WithLabelValues("activate_paper", "success").Inc()
	return nil
}

func (s *Service) RequestLiveActivation(ctx context.Context, userID, botID string) error {
	bot, _, err := s.repo.GetBotByID(ctx, botID)
	if err != nil {
		return err
	}
	if bot.UserID != userID {
		return fmt.Errorf("bot does not belong to authenticated user")
	}
	if bot.ExchangeAccountID == nil || *bot.ExchangeAccountID == "" {
		return fmt.Errorf("exchange_account_id is required before requesting live activation")
	}
	if bot.Status != domain.BotStatusPaperActive && bot.Status != domain.BotStatusPaused {
		return fmt.Errorf("bot can only request live activation from paper_active or paused state")
	}

	existingBots, err := s.repo.ListBotsByUserID(ctx, userID)
	if err != nil {
		return err
	}

	liveCount := 0
	for _, existingBot := range existingBots {
		if existingBot.Status == domain.BotStatusLivePendingApproval || existingBot.Status == domain.BotStatusLiveActive {
			liveCount++
		}
	}

	if err := s.subscriptionSvc.CheckEntitlement(ctx, userID, domain.BotModeLive, liveCount); err != nil {
		return err
	}

	return s.repo.UpdateBotStatus(ctx, botID, domain.BotStatusLivePendingApproval, "user requested live activation")
}

func (s *Service) PauseBot(ctx context.Context, botID string) error {
	bot, _, err := s.repo.GetBotByID(ctx, botID)
	if err != nil {
		return err
	}
	if bot.Status != domain.BotStatusPaperActive && bot.Status != domain.BotStatusLiveActive {
		return fmt.Errorf("bot can only be paused from an active state")
	}
	err = s.repo.UpdateBotStatus(ctx, botID, domain.BotStatusPaused, "user paused bot")
	if err != nil {
		metrics.BotLifecycleEventsTotal.WithLabelValues("pause", "failed").Inc()
		return err
	}
	metrics.BotLifecycleEventsTotal.WithLabelValues("pause", "success").Inc()
	return nil
}

func (s *Service) StopBot(ctx context.Context, botID string) error {
	bot, _, err := s.repo.GetBotByID(ctx, botID)
	if err != nil {
		return err
	}
	if bot.Status == domain.BotStatusStopped {
		return fmt.Errorf("bot is already stopped")
	}
	err = s.repo.UpdateBotStatus(ctx, botID, domain.BotStatusStopped, "user stopped bot")
	if err != nil {
		metrics.BotLifecycleEventsTotal.WithLabelValues("stop", "failed").Inc()
		return err
	}
	metrics.BotLifecycleEventsTotal.WithLabelValues("stop", "success").Inc()
	return nil
}

func (s *Service) ListUserBots(ctx context.Context, userID string) ([]domain.Bot, error) {
	return s.repo.ListBotsByUserID(ctx, userID)
}

func (s *Service) GetBot(ctx context.Context, botID string) (*domain.Bot, *domain.RiskSettings, error) {
	return s.repo.GetBotByID(ctx, botID)
}
