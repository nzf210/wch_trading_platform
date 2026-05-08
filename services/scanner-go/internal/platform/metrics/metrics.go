package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	SignalsGeneratedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "wch_scanner_signals_generated_total",
			Help: "Total number of signals generated",
		},
		[]string{"strategy", "symbol", "action"},
	)

	ScannerProcessingDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "wch_scanner_processing_duration_seconds",
			Help:    "Duration of scanner processing loop",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"symbol"},
	)

	RedisPublishErrorsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "wch_scanner_redis_publish_errors_total",
			Help: "Total number of errors when publishing to Redis",
		},
	)
)
