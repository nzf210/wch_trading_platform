package exchange

import (
	"context"
	"database/sql"
	"time"
)

type ExchangeAccount struct {
	ID                 string
	UserID             string
	Exchange           string
	Label              string
	APIKeyEncrypted    string
	APISecretEncrypted string
	PassphraseEncrypted sql.NullString
	Permissions        []byte
	Status             string
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

type Repository interface {
	Create(ctx context.Context, acc *ExchangeAccount) error
	GetByID(ctx context.Context, id string) (*ExchangeAccount, error)
	ListByUserID(ctx context.Context, userID string) ([]ExchangeAccount, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, acc *ExchangeAccount) error {
	query := `
		INSERT INTO exchange_accounts (id, user_id, exchange, label, api_key_encrypted, api_secret_encrypted, passphrase_encrypted, permissions, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		acc.ID, acc.UserID, acc.Exchange, acc.Label, acc.APIKeyEncrypted, acc.APISecretEncrypted, acc.PassphraseEncrypted, acc.Permissions, acc.Status, acc.CreatedAt, acc.UpdatedAt,
	)
	return err
}

func (r *repository) GetByID(ctx context.Context, id string) (*ExchangeAccount, error) {
	acc := &ExchangeAccount{}
	query := `
		SELECT id, user_id, exchange, label, api_key_encrypted, api_secret_encrypted, passphrase_encrypted, permissions, status, created_at, updated_at
		FROM exchange_accounts WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&acc.ID, &acc.UserID, &acc.Exchange, &acc.Label, &acc.APIKeyEncrypted, &acc.APISecretEncrypted, &acc.PassphraseEncrypted, &acc.Permissions, &acc.Status, &acc.CreatedAt, &acc.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return acc, nil
}

func (r *repository) ListByUserID(ctx context.Context, userID string) ([]ExchangeAccount, error) {
	query := `
		SELECT id, user_id, exchange, label, api_key_encrypted, api_secret_encrypted, passphrase_encrypted, permissions, status, created_at, updated_at
		FROM exchange_accounts WHERE user_id = $1
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []ExchangeAccount
	for rows.Next() {
		var acc ExchangeAccount
		err := rows.Scan(
			&acc.ID, &acc.UserID, &acc.Exchange, &acc.Label, &acc.APIKeyEncrypted, &acc.APISecretEncrypted, &acc.PassphraseEncrypted, &acc.Permissions, &acc.Status, &acc.CreatedAt, &acc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, acc)
	}
	return accounts, nil
}
