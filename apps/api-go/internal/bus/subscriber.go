
package bus

import (
	"context"
	"encoding/json"
	"log"
	"github.com/redis/go-redis/v9"
)

const tradeEventStream = "stream.trade-events"

// Subscriber listens to a Redis Pub/Sub channel and forwards messages to the Hub.
type Subscriber struct {
	redisClient *redis.Client
	hub         *Hub
}

// NewSubscriber creates a new Subscriber.
func NewSubscriber(redisClient *redis.Client, hub *Hub) *Subscriber {
	return &Subscriber{
		redisClient: redisClient,
		hub:         hub,
	}
}

// Run starts the subscriber. It blocks, so it should be run in a goroutine.
func (s *Subscriber) Run(ctx context.Context) {
	pubsub := s.redisClient.Subscribe(ctx, tradeEventStream)
	defer pubsub.Close()

	// Wait for confirmation that subscription is created before publishing anything.
	_, err := pubsub.Receive(ctx)
	if err != nil {
		log.Fatalf("Error receiving from redis pubsub: %v", err)
	}

	ch := pubsub.Channel()
	log.Printf("Subscribed to Redis channel: %s", tradeEventStream)

	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			var envelope EventEnvelope
			if err := json.Unmarshal([]byte(msg.Payload), &envelope); err != nil {
				log.Printf("Error unmarshalling event from redis: %v", err)
				continue
			}

			if envelope.UserID == nil {
				log.Printf("Received event with no UserID, cannot route. EventType: %s", envelope.EventType)
				continue
			}

			// Re-marshal the envelope to send the full event to the client
			data, err := json.Marshal(envelope)
			if err != nil {
				log.Printf("Error marshalling event for client: %v", err)
				continue
			}

			message := &Message{
				Data:   data,
				UserID: *envelope.UserID,
			}
			s.hub.broadcast <- message
		}
	}
}
