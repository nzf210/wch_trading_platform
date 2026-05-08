package bots

import "testing"

func TestValidateCreateBotRequestNormalizesFields(t *testing.T) {
	exchangeAccountID := "550e8400-e29b-41d4-a716-446655440000"
	req := CreateBotRequest{
		Name:              "  Momentum Bot  ",
		Strategy:          "  trend  ",
		Symbol:            " btcusdt ",
		QuoteAsset:        " usdt ",
		Capital:           100,
		ExchangeAccountID: &exchangeAccountID,
	}

	if err := ValidateCreateBotRequest(&req); err != nil {
		t.Fatalf("expected valid request, got error: %v", err)
	}

	if req.Name != "Momentum Bot" {
		t.Fatalf("expected trimmed name, got %q", req.Name)
	}
	if req.Strategy != "trend" {
		t.Fatalf("expected trimmed strategy, got %q", req.Strategy)
	}
	if req.Symbol != "BTCUSDT" {
		t.Fatalf("expected uppercased symbol, got %q", req.Symbol)
	}
	if req.QuoteAsset != "USDT" {
		t.Fatalf("expected uppercased quote asset, got %q", req.QuoteAsset)
	}
	if req.Config == nil {
		t.Fatal("expected config to be initialized")
	}
}

func TestValidateCreateBotRequestRejectsInvalidExchangeAccountID(t *testing.T) {
	exchangeAccountID := "not-a-uuid"
	req := CreateBotRequest{
		Name:              "Bot",
		Strategy:          "grid",
		Symbol:            "BTCUSDT",
		QuoteAsset:        "USDT",
		Capital:           100,
		ExchangeAccountID: &exchangeAccountID,
	}

	if err := ValidateCreateBotRequest(&req); err == nil {
		t.Fatal("expected invalid exchange_account_id to fail validation")
	}
}
