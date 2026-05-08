package signals

import (
	"context"
	"wch-trading-platform/packages/go/domain"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListSignals(ctx context.Context, userID string) ([]domain.Signal, error) {
	return s.repo.ListByUserID(ctx, userID)
}
