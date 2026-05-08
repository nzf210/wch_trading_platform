package redis

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Publisher struct {
	client *redis.Client
}

func NewPublisher(url string) (*redis.Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opts)
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return client, nil
}

func PublishSignal(ctx context.Context, client *redis.Client, channel string, signal interface{}) error {
	data, err := json.Marshal(signal)
	if err != nil {
		return err
	}

	fmt.Printf("Publishing signal to %s: %s\n", channel, string(data))
	return client.Publish(ctx, channel, data).Err()
}

func PushOrderIntent(ctx context.Context, client *redis.Client, key string, intent interface{}) error {
	data, err := json.Marshal(intent)
	if err != nil {
		return err
	}

	fmt.Printf("Pushing order intent to %s: %s\n", key, string(data))
	return client.RPush(ctx, key, data).Err()
}
