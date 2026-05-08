package subscription

import (
	"net/http"
	"wch-trading-platform/apps/api-go/internal/http/response"
	"wch-trading-platform/packages/go/domain"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetCurrentSubscription(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	sub, plan, err := h.service.GetActiveSubscription(r.Context(), userID)
	if err != nil {
		response.Error(w, r, http.StatusNotFound, "no active subscription found")
		return
	}

	response.JSON(w, r, http.StatusOK, SummaryResponse{
		Subscription: *sub,
		Plan:         *plan,
	})
}
