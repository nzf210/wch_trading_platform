package exchange

import "time"

type ExchangeAccountResponse struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Exchange    string    `json:"exchange"`
	Label       string    `json:"label"`
	Permissions string    `json:"permissions"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
