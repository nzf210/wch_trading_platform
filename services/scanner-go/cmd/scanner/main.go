package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"wch-trading-platform/services/scanner-go/internal/config"
	"wch-trading-platform/services/scanner-go/internal/redis"
	"wch-trading-platform/services/scanner-go/internal/repository"
	"wch-trading-platform/services/scanner-go/internal/scanner"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	repo, err := repository.NewRepository(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	redisClient, err := redis.NewPublisher(cfg.RedisURL)
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}
	defer redisClient.Close()

	s := scanner.NewScanner(repo, redisClient)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		fmt.Printf("Received signal: %v. Shutting down...\n", sig)
		cancel()
	}()

	fmt.Println("Scanner service starting...")
	s.Run(ctx)
	fmt.Println("Scanner service stopped.")
}
