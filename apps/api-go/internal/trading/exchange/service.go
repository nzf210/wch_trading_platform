package exchange

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	AddAccount(ctx context.Context, userID string, req AddAccountRequest) (*ExchangeAccount, error)
	ListAccounts(ctx context.Context, userID string) ([]ExchangeAccount, error)
	PublicAccount(acc *ExchangeAccount) ExchangeAccountResponse
	PublicAccounts(accounts []ExchangeAccount) []ExchangeAccountResponse
}

type service struct {
	repo          Repository
	encryptionKey string
}

type AddAccountRequest struct {
	Exchange   string `json:"exchange"`
	Label      string `json:"label"`
	APIKey     string `json:"api_key"`
	APISecret  string `json:"api_secret"`
	Passphrase string `json:"passphrase"`
}

func NewService(repo Repository, encryptionKey string) Service {
	return &service{repo: repo, encryptionKey: encryptionKey}
}

func (s *service) AddAccount(ctx context.Context, userID string, req AddAccountRequest) (*ExchangeAccount, error) {
	apiKeyEnc, err := Encrypt(req.APIKey, s.encryptionKey)
	if err != nil {
		return nil, err
	}

	apiSecretEnc, err := Encrypt(req.APISecret, s.encryptionKey)
	if err != nil {
		return nil, err
	}

	var passphraseEnc sql.NullString
	if req.Passphrase != "" {
		p, err := Encrypt(req.Passphrase, s.encryptionKey)
		if err != nil {
			return nil, err
		}
		passphraseEnc = sql.NullString{String: p, Valid: true}
	}

	acc := &ExchangeAccount{
		ID:                  uuid.New().String(),
		UserID:              userID,
		Exchange:            req.Exchange,
		Label:               req.Label,
		APIKeyEncrypted:     apiKeyEnc,
		APISecretEncrypted:  apiSecretEnc,
		PassphraseEncrypted: passphraseEnc,
		Permissions:         []byte("{}"),
		Status:              "active",
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := s.repo.Create(ctx, acc); err != nil {
		return nil, err
	}

	return acc, nil
}

func (s *service) ListAccounts(ctx context.Context, userID string) ([]ExchangeAccount, error) {
	return s.repo.ListByUserID(ctx, userID)
}

func (s *service) PublicAccount(acc *ExchangeAccount) ExchangeAccountResponse {
	return ExchangeAccountResponse{
		ID:          acc.ID,
		UserID:      acc.UserID,
		Exchange:    acc.Exchange,
		Label:       acc.Label,
		Permissions: string(acc.Permissions),
		Status:      acc.Status,
		CreatedAt:   acc.CreatedAt,
		UpdatedAt:   acc.UpdatedAt,
	}
}

func (s *service) PublicAccounts(accounts []ExchangeAccount) []ExchangeAccountResponse {
	result := make([]ExchangeAccountResponse, 0, len(accounts))
	for i := range accounts {
		result = append(result, s.PublicAccount(&accounts[i]))
	}
	return result
}
