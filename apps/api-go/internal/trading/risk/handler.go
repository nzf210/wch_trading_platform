package risk

import (
	"encoding/json"
	"net/http"
	"wch-trading-platform/apps/api-go/internal/http/response"
	"wch-trading-platform/packages/go/domain"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetRisk(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "bot_id")
	risk, err := h.service.GetRiskSettings(r.Context(), botID)
	if err != nil {
		response.Error(w, r, http.StatusNotFound, "risk settings not found")
		return
	}

	response.JSON(w, r, http.StatusOK, risk)
}

func (h *Handler) UpdateRisk(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "bot_id")

	var req UpdateRiskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.service.UpdateRiskSettings(r.Context(), botID, req)
	if err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, r, http.StatusOK, updated)
}

func (h *Handler) ToggleEmergencyStop(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "bot_id")

	var req EmergencyStopRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.ToggleEmergencyStop(r.Context(), botID, req.Stop); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}

	message := "emergency stop deactivated"
	if req.Stop {
		message = "emergency stop activated"
	}
	response.JSON(w, r, http.StatusOK, map[string]string{"message": message})
}

func (h *Handler) GlobalEmergencyStop(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req EmergencyStopRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.service.GlobalEmergencyStop(r.Context(), userID, req.Stop); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}

	message := "global emergency stop deactivated"
	if req.Stop {
		message = "global emergency stop activated"
	}
	response.JSON(w, r, http.StatusOK, map[string]string{"message": message})
}
