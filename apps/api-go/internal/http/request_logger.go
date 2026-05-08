package http

import (
	"net/http"
	"time"
	"wch-trading-platform/packages/go/domain"
	"wch-trading-platform/packages/go/logger"
)

type responseRecorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (r *responseRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func (r *responseRecorder) Write(data []byte) (int, error) {
	if r.status == 0 {
		r.status = http.StatusOK
	}
	n, err := r.ResponseWriter.Write(data)
	r.bytes += n
	return n, err
}

func RequestLoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startedAt := time.Now()
		recorder := &responseRecorder{ResponseWriter: w}

		next.ServeHTTP(recorder, r)

		correlationID, _ := r.Context().Value(domain.CorrelationIDKey).(string)
		logger.Info(r.Context(), "http request completed", map[string]interface{}{
			"method":         r.Method,
			"path":           r.URL.Path,
			"query":          r.URL.RawQuery,
			"status":         recorder.status,
			"duration_ms":    time.Since(startedAt).Milliseconds(),
			"response_bytes": recorder.bytes,
			"remote_addr":    r.RemoteAddr,
			"user_agent":     r.UserAgent(),
			"correlation_id": correlationID,
		})
	})
}
