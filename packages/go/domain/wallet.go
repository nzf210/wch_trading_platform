package domain

import "time"

type WalletChain string

const (
	WalletChainEthereum WalletChain = "ethereum"
	WalletChainBSC      WalletChain = "bsc"
	WalletChainPolygon  WalletChain = "polygon"
	WalletChainArbitrum WalletChain = "arbitrum"
	WalletChainBase     WalletChain = "base"
	WalletChainSolana   WalletChain = "solana"
	WalletChainTON      WalletChain = "ton"
	WalletChainTron     WalletChain = "tron"
)

type Wallet struct {
	ID         string      `json:"id"`
	UserID     string      `json:"user_id"`
	Chain      WalletChain `json:"chain"`
	Address    string      `json:"address"`
	IsPrimary  bool        `json:"is_primary"`
	VerifiedAt *time.Time  `json:"verified_at,omitempty"`
	CreatedAt  time.Time   `json:"created_at"`
}

type WchTransactionType string

const (
	WchTransactionTypeDeposit             WchTransactionType = "deposit"
	WchTransactionTypeWithdrawal          WchTransactionType = "withdrawal"
	WchTransactionTypeSubscriptionPayment WchTransactionType = "subscription_payment"
	WchTransactionTypeCredit              WchTransactionType = "credit"
	WchTransactionTypeReward              WchTransactionType = "reward"
	WchTransactionTypeAdjustment          WchTransactionType = "adjustment"
)

type WchTransactionStatus string

const (
	WchTransactionStatusPending   WchTransactionStatus = "pending"
	WchTransactionStatusConfirmed WchTransactionStatus = "confirmed"
	WchTransactionStatusFailed    WchTransactionStatus = "failed"
	WchTransactionStatusCancelled WchTransactionStatus = "cancelled"
)

type WchTransaction struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	WalletID  *string                `json:"wallet_id,omitempty"`
	TxHash    *string                `json:"tx_hash,omitempty"`
	Type      WchTransactionType     `json:"type"`
	Amount    float64                `json:"amount"`
	Status    WchTransactionStatus   `json:"status"`
	Metadata  JSONObject             `json:"metadata"`
	CreatedAt time.Time              `json:"created_at"`
}
