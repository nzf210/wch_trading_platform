package subscription

import "wch-trading-platform/packages/go/domain"

type SummaryResponse struct {
	Subscription domain.Subscription `json:"subscription"`
	Plan         domain.Plan         `json:"plan"`
}
