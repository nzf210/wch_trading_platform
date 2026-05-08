package wallet

import "context"
import "wch-trading-platform/packages/go/domain"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListWallets(ctx context.Context, userID string) ([]domain.Wallet, error) {
	return s.repo.ListWalletsByUserID(ctx, userID)
}

func (s *Service) ListTransactions(ctx context.Context, userID string) ([]domain.WchTransaction, error) {
	return s.repo.ListTransactionsByUserID(ctx, userID)
}
