package exchanges

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type Binance struct {
	BaseURL string
}

func NewBinance() *Binance {
	return &Binance{BaseURL: "https://api.binance.com"}
}

func (b *Binance) GetTicker(ctx context.Context, symbol string) (*Ticker, error) {
	url := fmt.Sprintf("%s/api/v3/ticker/price?symbol=%s", b.BaseURL, symbol)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("binance api error: status %d", resp.StatusCode)
	}

	var res struct {
		Symbol string `json:"symbol"`
		Price  string `json:"price"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	price, err := strconv.ParseFloat(res.Price, 64)
	if err != nil {
		return nil, err
	}

	return &Ticker{Symbol: res.Symbol, Price: price}, nil
}
