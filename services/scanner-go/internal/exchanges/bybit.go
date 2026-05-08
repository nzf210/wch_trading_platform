package exchanges

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type Bybit struct {
	BaseURL string
}

func NewBybit() *Bybit {
	return &Bybit{BaseURL: "https://api.bybit.com"}
}

func (b *Bybit) GetTicker(ctx context.Context, symbol string) (*Ticker, error) {
	symbol = strings.ReplaceAll(symbol, "/", "")
	url := fmt.Sprintf("%s/v5/market/tickers?category=spot&symbol=%s", b.BaseURL, symbol)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bybit api error: status %d", resp.StatusCode)
	}

	var res struct {
		RetCode int `json:"retCode"`
		Result  struct {
			List []struct {
				Symbol string `json:"symbol"`
				Price  string `json:"lastPrice"`
			} `json:"list"`
		} `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	if res.RetCode != 0 || len(res.Result.List) == 0 {
		return nil, fmt.Errorf("bybit api error or no data")
	}

	price, err := strconv.ParseFloat(res.Result.List[0].Price, 64)
	if err != nil {
		return nil, err
	}

	return &Ticker{Symbol: res.Result.List[0].Symbol, Price: price}, nil
}
