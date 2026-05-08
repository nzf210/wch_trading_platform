package bots

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

func (h *Handler) CreateBot(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateBotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	bot, risk, err := h.service.CreateBot(r.Context(), userID, req)
	if err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, r, http.StatusCreated, BotResponse{
		Bot:          *bot,
		RiskSettings: *risk,
	})
}

func (h *Handler) GetBot(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "id")
	bot, risk, err := h.service.GetBot(r.Context(), botID)
	if err != nil {
		response.Error(w, r, http.StatusNotFound, "bot not found")
		return
	}

	response.JSON(w, r, http.StatusOK, BotResponse{
		Bot:          *bot,
		RiskSettings: *risk,
	})
}

func (h *Handler) ListBots(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	bots, err := h.service.ListUserBots(r.Context(), userID)
	if err != nil {
		response.Error(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, r, http.StatusOK, bots)
}

func (h *Handler) ActivatePaper(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "id")
	if err := h.service.ActivatePaper(r.Context(), botID); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, r, http.StatusOK, LifecycleMessageResponse{Message: "bot activated in paper mode"})
}

func (h *Handler) RequestLiveActivation(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(domain.UserIDKey).(string)
	if !ok {
		response.Error(w, r, http.StatusUnauthorized, "unauthorized")
		return
	}

	botID := chi.URLParam(r, "id")
	if err := h.service.RequestLiveActivation(r.Context(), userID, botID); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, r, http.StatusOK, LifecycleMessageResponse{Message: "live activation requested"})
}

func (h *Handler) PauseBot(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "id")
	if err := h.service.PauseBot(r.Context(), botID); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, r, http.StatusOK, LifecycleMessageResponse{Message: "bot paused"})
}

func (h *Handler) StopBot(w http.ResponseWriter, r *http.Request) {
	botID := chi.URLParam(r, "id")
	if err := h.service.StopBot(r.Context(), botID); err != nil {
		response.Error(w, r, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, r, http.StatusOK, LifecycleMessageResponse{Message: "bot stopped"})
}
