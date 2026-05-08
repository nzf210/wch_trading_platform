package signals

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

func (h *Handler) ListSignals(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	signals, err := h.service.ListSignals(r.Context(), userID)
	if err != nil {
		response.Error(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, r, http.StatusOK, signals)
}
