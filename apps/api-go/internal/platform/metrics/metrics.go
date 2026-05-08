package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	HttpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "wch_api_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	HttpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "wch_api_http_request_duration_seconds",
			Help:    "Duration of HTTP requests",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	BotLifecycleEventsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "wch_api_bot_lifecycle_events_total",
			Help: "Total number of bot lifecycle events",
		},
		[]string{"action", "status"},
	)

	RiskChecksTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "wch_api_risk_checks_total",
			Help: "Total number of risk checks performed by API",
		},
		[]string{"result"},
	)
)
