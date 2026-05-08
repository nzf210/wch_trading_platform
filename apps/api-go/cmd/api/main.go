package main

import (
	"context"
	"net/http"
	"wch-trading-platform/apps/api-go/internal/bus"
	internalHTTP "wch-trading-platform/apps/api-go/internal/http"
	"wch-trading-platform/apps/api-go/internal/identity/auth"
	"wch-trading-platform/apps/api-go/internal/identity/subscription"
	"wch-trading-platform/apps/api-go/internal/identity/wallet"
	"wch-trading-platform/apps/api-go/internal/platform/config"
	"wch-trading-platform/apps/api-go/internal/platform/db"
	"wch-trading-platform/apps/api-go/internal/platform/outbox"
	"wch-trading-platform/apps/api-go/internal/platform/redis"
	"wch-trading-platform/apps/api-go/internal/trading/bots"
	"wch-trading-platform/apps/api-go/internal/trading/exchange"
	"wch-trading-platform/apps/api-go/internal/trading/risk"
	"wch-trading-platform/apps/api-go/internal/trading/signals"
	"wch-trading-platform/packages/go/logger"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error(context.Background(), "failed to load config", err, nil)
		return
	}

	database, err := db.ConnectPostgres(cfg.DatabaseURL)
	if err != nil {
		logger.Error(context.Background(), "failed to connect to postgres", err, nil)
		return
	}
	defer database.Close()

	redisClient, err := redis.ConnectRedis(cfg.RedisURL)
	if err != nil {
		logger.Error(context.Background(), "failed to connect to redis", err, nil)
		return
	}
	defer redisClient.Close()

	hub := bus.NewHub()
	go hub.Run()

	subscriber := bus.NewSubscriber(redisClient, hub)
	go subscriber.Run(context.Background())

	// Initialize components
	authRepo := auth.NewRepository(database)
	authService := auth.NewService(authRepo, cfg.JWTSecret)
	authHandler := auth.NewHandler(authService)

	exchangeRepo := exchange.NewRepository(database)
	exchangeService := exchange.NewService(exchangeRepo, cfg.JWTSecret)
	exchangeHandler := exchange.NewHandler(exchangeService)
	
	walletRepo := wallet.NewRepository(database)
	walletService := wallet.NewService(walletRepo)
	walletHandler := wallet.NewHandler(walletService)

	signalRepo := signals.NewRepository(database)
	signalService := signals.NewService(signalRepo)
	signalHandler := signals.NewHandler(signalService)

	subscriptionRepo := subscription.NewRepository(database)
	subscriptionService := subscription.NewService(subscriptionRepo)
	subscriptionHandler := subscription.NewHandler(subscriptionService)

	riskRepo := risk.NewRepository(database)
	riskService := risk.NewService(riskRepo)
	riskHandler := risk.NewHandler(riskService)

	botRepo := bots.NewRepository(database)
	botService := bots.NewService(botRepo, subscriptionService)
	botHandler := bots.NewHandler(botService)

	outboxProcessor := outbox.NewProcessor(database, redisClient)
	go outboxProcessor.Run(context.Background())

	router := internalHTTP.NewRouter(hub, authService, authHandler, botHandler, exchangeHandler, walletHandler, signalHandler, riskHandler, subscriptionHandler)

	logger.Info(context.Background(), "api-go listening", map[string]interface{}{"port": cfg.Port})
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		logger.Error(context.Background(), "failed to start server", err, map[string]interface{}{"port": cfg.Port})
	}
}
