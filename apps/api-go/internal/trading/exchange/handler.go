package exchange

import (
	"encoding/json"
	"net/http"
	"wch-trading-platform/apps/api-go/internal/http/response"
	"wch-trading-platform/packages/go/domain"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) AddAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req AddAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	acc, err := h.service.AddAccount(r.Context(), userID, req)
	if err != nil {
		response.Error(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, r, http.StatusCreated, h.service.PublicAccount(acc))
}

func (h *Handler) ListAccounts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	accounts, err := h.service.ListAccounts(r.Context(), userID)
	if err != nil {
		response.Error(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, r, http.StatusOK, h.service.PublicAccounts(accounts))
}
