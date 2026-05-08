package scanner

import (
	"context"
	"fmt"
	"time"
	"wch-trading-platform/packages/go/domain"
	"wch-trading-platform/services/scanner-go/internal/exchanges"
	"wch-trading-platform/services/scanner-go/internal/redis"
	"wch-trading-platform/services/scanner-go/internal/repository"
	"wch-trading-platform/services/scanner-go/internal/strategies"

	"github.com/google/uuid"
	redis_lib "github.com/redis/go-redis/v9"
)

type Scanner struct {
	repo        *repository.Repository
	redisClient *redis_lib.Client
	strategies  map[string]strategies.Strategy
	exchanges   map[string]exchanges.Exchange
}

func NewScanner(repo *repository.Repository, redisClient *redis_lib.Client) *Scanner {
	return &Scanner{
		repo:        repo,
		redisClient: redisClient,
		strategies: map[string]strategies.Strategy{
			"random": &strategies.RandomStrategy{},
		},
		exchanges: map[string]exchanges.Exchange{
			"binance": exchanges.NewBinance(),
			"bybit":   exchanges.NewBybit(),
			"okx":     exchanges.NewOkx(),
		},
	}
}

func (s *Scanner) Run(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	fmt.Println("Scanner loop started...")

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.scan(ctx)
		}
	}
}

func (s *Scanner) scan(ctx context.Context) {
	bots, err := s.repo.GetActiveBots(ctx)
	if err != nil {
		fmt.Printf("Error fetching active bots: %v\n", err)
		return
	}

	for _, b := range bots {
		// Use real exchange name from bot if available, default to binance for now
		exchangeName := "binance"
		if b.ExchangeAccountID != nil && *b.ExchangeAccountID != "" {
			// In a real scenario, we'd fetch the exchange name from the account
			// For now, we'll try to infer it or use a default
			// TODO: Update domain.Bot to include Exchange name
		}

		fmt.Printf("Scanning bot: %s (%s) on %s using strategy %s\n", b.Name, b.Symbol, exchangeName, b.Strategy)

		exch, ok := s.exchanges[exchangeName]
		if !ok {
			fmt.Printf("Unsupported exchange: %s\n", exchangeName)
			continue
		}

		ticker, err := exch.GetTicker(ctx, b.Symbol)
		var price float64
		if err != nil {
			fmt.Printf("Error fetching ticker for %s: %v. Using placeholder.\n", b.Symbol, err)
			price = 50000.0 // Fallback
		} else {
			price = ticker.Price
		}

		strat, ok := s.strategies[b.Strategy]
		if !ok {
			strat = s.strategies["random"]
		}

		shouldTrade, action := strat.Check(b)
		if shouldTrade {
			s.generateSignal(ctx, b, action, exchangeName, price)
		}
	}
}

func (s *Scanner) generateSignal(ctx context.Context, b domain.Bot, action domain.SignalAction, exchange string, price float64) {
	correlationID := uuid.New().String()
	now := time.Now().UTC()

	signal := BuildSignal(b, action, SignalContext{
		CorrelationID: correlationID,
		Exchange:      exchange,
		Price:         price,
		Confidence:    0.95,
		Reason:        "strategy match",
	}, now)

	// 1. Save to DB
	if err := s.repo.SaveSignal(ctx, &signal); err != nil {
		fmt.Printf("[%s] Error saving signal: %v\n", correlationID, err)
		return
	}

	event := domain.EventEnvelope{
		EventID:        uuid.New().String(),
		EventType:      domain.EventTypeSignalGenerated,
		EventVersion:   signalSchemaVersion,
		OccurredAt:     now,
		Producer:       scannerSource,
		UserID:         stringPtr(b.UserID),
		BotID:          stringPtr(b.ID),
		CorrelationID:  correlationID,
		CausationID:    stringPtr(signal.ID),
		IdempotencyKey: signal.DedupKey,
		Payload:        signal,
	}

	if err := redis.PublishSignal(ctx, s.redisClient, "stream.market-events", event); err != nil {
		fmt.Printf("[%s] Error publishing signal event: %v\n", correlationID, err)
		return
	}

	intent, err := BuildOrderIntent(b, signal, now)
	if err != nil {
		fmt.Printf("[%s] Error building order intent: %v\n", correlationID, err)
		return
	}

	// 3. Push to Redis queue "order_intents"
	if err := redis.PushOrderIntent(ctx, s.redisClient, "order_intents", intent); err != nil {
		fmt.Printf("[%s] Error pushing order intent: %v\n", correlationID, err)
		return
	}

	fmt.Printf("[%s] Signal v2 generated and intent pushed for bot %s: %s at %f quantity=%f\n", correlationID, b.ID, action, price, intent.Quantity)
}

func stringPtr(value string) *string {
	return &value
}
