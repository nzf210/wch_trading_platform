package wallet

import (
	"context"
	"database/sql"
	"encoding/json"
	"wch-trading-platform/packages/go/domain"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListWalletsByUserID(ctx context.Context, userID string) ([]domain.Wallet, error) {
	query := `
		SELECT id, user_id, chain, address, is_primary, verified_at, created_at
		FROM wallets
		WHERE user_id = $1
		ORDER BY is_primary DESC, created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []domain.Wallet
	for rows.Next() {
		var wallet domain.Wallet
		var verifiedAt sql.NullTime
		if err := rows.Scan(&wallet.ID, &wallet.UserID, &wallet.Chain, &wallet.Address, &wallet.IsPrimary, &verifiedAt, &wallet.CreatedAt); err != nil {
			return nil, err
		}
		if verifiedAt.Valid {
			t := verifiedAt.Time
			wallet.VerifiedAt = &t
		}
		wallets = append(wallets, wallet)
	}
	return wallets, nil
}

func (r *Repository) ListTransactionsByUserID(ctx context.Context, userID string) ([]domain.WchTransaction, error) {
	query := `
		SELECT id, user_id, wallet_id, tx_hash, type, amount, status, metadata, created_at
		FROM wch_transactions
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []domain.WchTransaction
	for rows.Next() {
		var tx domain.WchTransaction
		var walletID sql.NullString
		var txHash sql.NullString
		var metadataJSON []byte
		if err := rows.Scan(&tx.ID, &tx.UserID, &walletID, &txHash, &tx.Type, &tx.Amount, &tx.Status, &metadataJSON, &tx.CreatedAt); err != nil {
			return nil, err
		}
		if walletID.Valid {
			tx.WalletID = &walletID.String
		}
		if txHash.Valid {
			tx.TxHash = &txHash.String
		}
		if len(metadataJSON) > 0 {
			if err := json.Unmarshal(metadataJSON, &tx.Metadata); err != nil {
				return nil, err
			}
		}
		if tx.Metadata == nil {
			tx.Metadata = map[string]interface{}{}
		}
		transactions = append(transactions, tx)
	}
	return transactions, nil
}
