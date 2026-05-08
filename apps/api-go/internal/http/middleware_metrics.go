package http

import (
	"net/http"
	"strconv"
	"time"
	"wch-trading-platform/apps/api-go/internal/platform/metrics"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		
		next.ServeHTTP(ww, r)
		
		duration := time.Since(start).Seconds()
		
		path := chi.RouteContext(r.Context()).RoutePattern()
		if path == "" {
			path = "unknown"
		}
		
		method := r.Method
		status := strconv.Itoa(ww.Status())
		
		metrics.HttpRequestsTotal.WithLabelValues(method, path, status).Inc()
		metrics.HttpRequestDuration.WithLabelValues(method, path).Observe(duration)
	})
}
