package domain

import (
	"time"
)

type SignalStatus string

const (
	SignalStatusPending   SignalStatus = "pending"
	SignalStatusProcessed SignalStatus = "processed"
	SignalStatusExpired   SignalStatus = "expired"
	SignalStatusRejected  SignalStatus = "rejected"
)

type SignalAction string

const (
	SignalActionBuy  SignalAction = "buy"
	SignalActionSell SignalAction = "sell"
)

type Provenance struct {
	Source   string  `json:"source"`
	Version  string  `json:"version"`
	Hostname *string `json:"hostname,omitempty"`
}

type Signal struct {
	ID              string                 `json:"id"`
	BotID           string                 `json:"bot_id"`
	UserID          string                 `json:"user_id"`
	Exchange        string                 `json:"exchange"`
	Symbol          string                 `json:"symbol"`
	Strategy        string                 `json:"strategy"`
	Action          SignalAction           `json:"action"`
	Price           *float64               `json:"price,omitempty"`
	Confidence      float64                `json:"confidence"`
	Status          SignalStatus           `json:"status"`
	SchemaVersion   string                 `json:"schema_version"`
	FeatureSnapshot JSONObject             `json:"feature_snapshot"`
	TTLMs           int64                  `json:"ttl_ms"`
	DedupKey        string                 `json:"dedup_key"`
	Provenance      Provenance             `json:"provenance"`
	Payload         JSONObject             `json:"payload"`
	CreatedAt       time.Time              `json:"created_at"`
}
