package exchanges

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type Okx struct {
	BaseURL string
}

func NewOkx() *Okx {
	return &Okx{BaseURL: "https://www.okx.com"}
}

func (o *Okx) GetTicker(ctx context.Context, symbol string) (*Ticker, error) {
	url := fmt.Sprintf("%s/api/v5/market/ticker?instId=%s", o.BaseURL, symbol)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("okx api error: status %d", resp.StatusCode)
	}

	var res struct {
		Code string `json:"code"`
		Data []struct {
			InstId string `json:"instId"`
			Last   string `json:"last"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	if res.Code != "0" || len(res.Data) == 0 {
		return nil, fmt.Errorf("okx api error or no data")
	}

	price, err := strconv.ParseFloat(res.Data[0].Last, 64)
	if err != nil {
		return nil, err
	}

	return &Ticker{Symbol: res.Data[0].InstId, Price: price}, nil
}
