package bots

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

func ValidateCreateBotRequest(req *CreateBotRequest) error {
	req.Name = strings.TrimSpace(req.Name)
	req.Strategy = strings.TrimSpace(req.Strategy)
	req.Symbol = strings.ToUpper(strings.TrimSpace(req.Symbol))
	req.QuoteAsset = strings.ToUpper(strings.TrimSpace(req.QuoteAsset))

	switch {
	case req.Name == "":
		return fmt.Errorf("name is required")
	case len(req.Name) > 150:
		return fmt.Errorf("name must be at most 150 characters")
	case req.Strategy == "":
		return fmt.Errorf("strategy is required")
	case len(req.Strategy) > 50:
		return fmt.Errorf("strategy must be at most 50 characters")
	case req.Symbol == "":
		return fmt.Errorf("symbol is required")
	case len(req.Symbol) > 50:
		return fmt.Errorf("symbol must be at most 50 characters")
	case req.QuoteAsset == "":
		return fmt.Errorf("quote_asset is required")
	case len(req.QuoteAsset) > 20:
		return fmt.Errorf("quote_asset must be at most 20 characters")
	case req.Capital <= 0:
		return fmt.Errorf("capital must be greater than zero")
	}

	if req.ExchangeAccountID != nil {
		id := strings.TrimSpace(*req.ExchangeAccountID)
		if id == "" {
			req.ExchangeAccountID = nil
		} else {
			if _, err := uuid.Parse(id); err != nil {
				return fmt.Errorf("exchange_account_id must be a valid UUID")
			}
			req.ExchangeAccountID = &id
		}
	}

	if req.Config == nil {
		req.Config = map[string]any{}
	}

	return nil
}
