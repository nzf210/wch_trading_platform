package risk

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

func (s *Service) GetRiskSettings(ctx context.Context, botID string) (*domain.RiskSettings, error) {
	return s.repo.GetByBotID(ctx, botID)
}

func (s *Service) UpdateRiskSettings(ctx context.Context, botID string, req UpdateRiskRequest) (*domain.RiskSettings, error) {
	if err := ValidateRiskUpdateRequest(req); err != nil {
		return nil, err
	}

	current, err := s.repo.GetByBotID(ctx, botID)
	if err != nil {
		return nil, err
	}

	updated := MergeRiskSettings(current, req)
	if err := s.repo.Update(ctx, updated); err != nil {
		return nil, err
	}

	return updated, nil
}

func (s *Service) ToggleEmergencyStop(ctx context.Context, botID string, stop bool) error {
	current, err := s.repo.GetByBotID(ctx, botID)
	if err != nil {
		return err
	}
	if err := ValidateEmergencyStopChange(current, stop); err != nil {
		return err
	}
	return s.repo.SetEmergencyStop(ctx, botID, stop)
}

func (s *Service) GlobalEmergencyStop(ctx context.Context, userID string, stop bool) error {
	if userID == "" {
		return fmt.Errorf("user_id is required")
	}
	return s.repo.SetGlobalEmergencyStop(ctx, userID, stop)
}
