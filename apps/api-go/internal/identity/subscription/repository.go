package subscription

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

func (r *Repository) GetActiveSubscription(ctx context.Context, userID string) (*domain.Subscription, *domain.Plan, error) {
	sub := &domain.Subscription{}
	plan := &domain.Plan{}

	query := `
		SELECT s.id, s.user_id, s.plan_id, s.status, s.paid_amount_wch, s.started_at, s.expires_at, s.created_at,
		       p.id, p.name, p.code, p.price_wch, p.max_live_bots, p.max_paper_bots, p.features, p.created_at
		FROM subscriptions s
		JOIN plans p ON s.plan_id = p.id
		WHERE s.user_id = $1 AND s.status = 'active'
		AND (s.expires_at IS NULL OR s.expires_at > NOW())
		ORDER BY s.created_at DESC
		LIMIT 1
	`

	var featuresJSON []byte
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&sub.ID, &sub.UserID, &sub.PlanID, &sub.Status, &sub.PaidAmountWch, &sub.StartedAt, &sub.ExpiresAt, &sub.CreatedAt,
		&plan.ID, &plan.Name, &plan.Code, &plan.PriceWch, &plan.MaxLiveBots, &plan.MaxPaperBots, &featuresJSON, &plan.CreatedAt,
	)
	if err != nil {
		return nil, nil, err
	}

	if len(featuresJSON) > 0 {
		if err := json.Unmarshal(featuresJSON, &plan.Features); err != nil {
			return nil, nil, err
		}
	}
	if plan.Features == nil {
		plan.Features = domain.JSONObject{}
	}

	return sub, plan, nil
}
