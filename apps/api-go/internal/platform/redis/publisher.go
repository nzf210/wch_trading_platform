package redis

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func PublishJSON(ctx context.Context, client *redis.Client, stream string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal redis payload: %w", err)
	}

	return client.Publish(ctx, stream, data).Err()
}
