package logger

import (
	"context"
	"encoding/json"
	"os"
	"time"
	"wch-trading-platform/packages/go/domain"
)

type Level string

const (
	InfoLevel  Level = "INFO"
	ErrorLevel Level = "ERROR"
	DebugLevel Level = "DEBUG"
)

type LogEntry struct {
	Timestamp     string                 `json:"timestamp"`
	Level         Level                  `json:"level"`
	CorrelationID string                 `json:"correlation_id,omitempty"`
	Message       string                 `json:"message"`
	Fields        map[string]interface{} `json:"fields,omitempty"`
}

func log(ctx context.Context, level Level, msg string, fields map[string]interface{}) {
	correlationID, _ := ctx.Value(domain.CorrelationIDKey).(string)

	entry := LogEntry{
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		Level:         level,
		CorrelationID: correlationID,
		Message:       msg,
		Fields:        fields,
	}

	data, _ := json.Marshal(entry)
	_, _ = os.Stdout.Write(append(data, '\n'))
}

func Info(ctx context.Context, msg string, fields map[string]interface{}) {
	log(ctx, InfoLevel, msg, fields)
}

func Error(ctx context.Context, msg string, err error, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	if err != nil {
		fields["error"] = err.Error()
	}
	log(ctx, ErrorLevel, msg, fields)
}

func Debug(ctx context.Context, msg string, fields map[string]interface{}) {
	log(ctx, DebugLevel, msg, fields)
}
