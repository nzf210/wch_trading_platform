package domain

type ContextKey string

const (
	UserIDKey        ContextKey = "user_id"
	CorrelationIDKey ContextKey = "correlation_id"
)
