package outbox

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
	platformredis "wch-trading-platform/apps/api-go/internal/platform/redis"
	"wch-trading-platform/packages/go/domain"
	"wch-trading-platform/packages/go/logger"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Processor struct {
	db          *sql.DB
	redisClient *redis.Client
}

const (
	outboxBatchSize   = 50
	outboxMaxRetries  = 5
	outboxBaseBackoff = 5 * time.Second
	outboxMaxBackoff  = 5 * time.Minute
)

func NewProcessor(db *sql.DB, redisClient *redis.Client) *Processor {
	return &Processor{db: db, redisClient: redisClient}
}

func (p *Processor) Run(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			p.processEvents(ctx)
		}
	}
}

func (p *Processor) processEvents(ctx context.Context) {
	rows, err := p.db.QueryContext(ctx, `
		SELECT id, event_type, payload, metadata, retry_count
		FROM outbox_events
		WHERE status = 'pending'
		  AND (next_retry_at IS NULL OR next_retry_at <= NOW())
		ORDER BY created_at ASC
		LIMIT $1
	`, outboxBatchSize)
	if err != nil {
		logger.Error(ctx, "failed to fetch outbox events", err, nil)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var eventType domain.EventType
		var payload, metadata []byte
		var retryCount int
		if err := rows.Scan(&id, &eventType, &payload, &metadata, &retryCount); err != nil {
			continue
		}

		normalizedMetadata, err := parseMetadata(metadata)
		if err != nil {
			logger.Error(ctx, "failed to parse outbox metadata", err, map[string]interface{}{"event_id": id})
			_ = p.markOutboxRetry(ctx, id, retryCount, err)
			continue
		}

		correlationID := normalizedMetadata.CorrelationID
		if correlationID == "" {
			correlationID = uuid.New().String()
		}
		taskCtx := context.WithValue(ctx, domain.CorrelationIDKey, correlationID)

		if err := p.publishEvent(taskCtx, id, eventType, payload, metadata); err != nil {
			logger.Error(taskCtx, "failed to publish outbox event", err, map[string]interface{}{"event_id": id})
			_ = p.markOutboxRetry(taskCtx, id, retryCount, err)
			continue
		}

		_, _ = p.db.ExecContext(ctx, `
			UPDATE outbox_events
			SET status = 'processed',
			    processed_at = NOW(),
			    last_attempt_at = NOW(),
			    last_error = NULL,
			    next_retry_at = NULL
			WHERE id = $1
		`, id)
		logger.Info(taskCtx, "outbox event processed", map[string]interface{}{"event_id": id, "type": eventType})
	}
}

func (p *Processor) publishEvent(ctx context.Context, id string, eventType domain.EventType, payload, metadata []byte) error {
	envelope, err := buildEnvelope(ctx, id, eventType, payload, metadata)
	if err != nil {
		return err
	}

	stream := platformredis.StreamForEventType(eventType)
	return platformredis.PublishJSON(ctx, p.redisClient, stream, envelope)
}

func buildEnvelope(ctx context.Context, id string, eventType domain.EventType, payload, metadata []byte) (domain.EventEnvelope, error) {
	var parsedPayload any
	if len(payload) > 0 {
		if err := json.Unmarshal(payload, &parsedPayload); err != nil {
			return domain.EventEnvelope{}, err
		}
	}

	meta, err := parseMetadata(metadata)
	if err != nil {
		return domain.EventEnvelope{}, err
	}

	normalized := normalizeMetadata(ctx, &meta)
	causationID := normalized.CausationID
	if causationID == nil {
		causationID = &id
	}

	return domain.EventEnvelope{
		EventID:        id,
		EventType:      eventType,
		EventVersion:   "v2",
		OccurredAt:     *normalized.OccurredAt,
		Producer:       normalized.Producer,
		TenantID:       normalized.TenantID,
		UserID:         normalized.UserID,
		BotID:          normalized.BotID,
		CorrelationID:  normalized.CorrelationID,
		CausationID:    causationID,
		IdempotencyKey: normalized.IdempotencyKey,
		Payload:        parsedPayload,
	}, nil
}

func parseMetadata(metadata []byte) (Metadata, error) {
	var meta Metadata
	if len(metadata) == 0 || string(metadata) == "null" {
		return meta, nil
	}
	if err := json.Unmarshal(metadata, &meta); err != nil {
		return Metadata{}, err
	}
	return meta, nil
}

func (p *Processor) markOutboxRetry(ctx context.Context, id string, retryCount int, cause error) error {
	lastError := truncateError(cause)
	nextAttempt := retryCount + 1
	if nextAttempt >= outboxMaxRetries {
		_, err := p.db.ExecContext(ctx, `
			UPDATE outbox_events
			SET status = 'failed',
			    retry_count = retry_count + 1,
			    last_error = $2,
			    last_attempt_at = NOW(),
			    next_retry_at = NULL,
			    failed_at = NOW()
			WHERE id = $1
		`, id, lastError)
		return err
	}

	nextRetryAt := time.Now().UTC().Add(outboxRetryDelay(nextAttempt))
	_, err := p.db.ExecContext(ctx, `
		UPDATE outbox_events
		SET status = 'pending',
		    retry_count = retry_count + 1,
		    last_error = $2,
		    last_attempt_at = NOW(),
		    next_retry_at = $3
		WHERE id = $1
	`, id, lastError, nextRetryAt)
	return err
}

func outboxRetryDelay(attempt int) time.Duration {
	if attempt < 1 {
		attempt = 1
	}
	delay := outboxBaseBackoff * time.Duration(1<<(attempt-1))
	if delay > outboxMaxBackoff {
		return outboxMaxBackoff
	}
	return delay
}

func truncateError(err error) string {
	const maxLength = 500
	message := err.Error()
	if len(message) <= maxLength {
		return message
	}
	return message[:maxLength]
}
