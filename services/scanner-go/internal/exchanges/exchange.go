package exchanges

import (
	"context"
)

type Ticker struct {
	Symbol string
	Price  float64
}

type Exchange interface {
	GetTicker(ctx context.Context, symbol string) (*Ticker, error)
}
