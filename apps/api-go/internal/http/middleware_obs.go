package http

import (
	"context"
	"net/http"
	"wch-trading-platform/packages/go/domain"

	"github.com/google/uuid"
)

func CorrelationIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		correlationID := r.Header.Get("X-Correlation-ID")
		if correlationID == "" {
			correlationID = uuid.New().String()
		}

		ctx := context.WithValue(r.Context(), domain.CorrelationIDKey, correlationID)
		w.Header().Set("X-Correlation-ID", correlationID)
		
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
