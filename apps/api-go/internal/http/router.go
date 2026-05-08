package http

import (
	"net/http"
	"wch-trading-platform/apps/api-go/internal/bus"
	"wch-trading-platform/apps/api-go/internal/identity/auth"
	"wch-trading-platform/apps/api-go/internal/identity/subscription"
	"wch-trading-platform/apps/api-go/internal/identity/wallet"
	"wch-trading-platform/apps/api-go/internal/trading/bots"
	"wch-trading-platform/apps/api-go/internal/trading/exchange"
	"wch-trading-platform/apps/api-go/internal/trading/risk"
	"wch-trading-platform/apps/api-go/internal/trading/signals"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func NewRouter(
	hub *bus.Hub,
	validator TokenValidator,
	authHandler *auth.Handler,
	botHandler *bots.Handler,
	exchangeHandler *exchange.Handler,
	walletHandler *wallet.Handler,
	signalHandler *signals.Handler,
	riskHandler *risk.Handler,
	subscriptionHandler *subscription.Handler,
) *chi.Mux {
	r := chi.NewRouter()

	r.Use(MetricsMiddleware)
	r.Use(CorrelationIDMiddleware)
	r.Use(RequestLoggerMiddleware)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://bot-trading.wancash.org", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Correlation-ID"},
		ExposedHeaders:   []string{"Link", "X-Correlation-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok","service":"api-go"}`))
	})

	r.Handle("/metrics", promhttp.Handler())

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})

		// The WebSocket endpoint is handled separately for token authentication via query param
		r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
			serveWs(hub, validator, w, r)
		})

		r.Group(func(r chi.Router) {
			r.Use(AuthMiddleware(validator))

			r.Route("/exchange-accounts", func(r chi.Router) {
				r.Post("/", exchangeHandler.AddAccount)
				r.Get("/", exchangeHandler.ListAccounts)
			})

			r.Get("/wallets", walletHandler.ListWallets)
			r.Get("/wch/transactions", walletHandler.ListTransactions)
			r.Get("/signals", signalHandler.ListSignals)

			r.Route("/bots", func(r chi.Router) {
				r.Post("/", botHandler.CreateBot)
				r.Get("/", botHandler.ListBots)
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", botHandler.GetBot)
					r.Post("/activate-paper", botHandler.ActivatePaper)
					r.Post("/request-live-activation", botHandler.RequestLiveActivation)
					r.Post("/pause", botHandler.PauseBot)
					r.Post("/stop", botHandler.StopBot)
				})
			})

			r.Route("/risk", func(r chi.Router) {
				r.Post("/emergency-stop", riskHandler.GlobalEmergencyStop)
				r.Route("/{bot_id}", func(r chi.Router) {
					r.Get("/", riskHandler.GetRisk)
					r.Put("/", riskHandler.UpdateRisk)
					r.Post("/emergency-stop", riskHandler.ToggleEmergencyStop)
				})
			})

			r.Route("/subscription", func(r chi.Router) {
				r.Get("/", subscriptionHandler.GetCurrentSubscription)
			})
		})
	})

	return r
}
