package auth

import (
	"encoding/json"
	"net/http"
	"wch-trading-platform/apps/api-go/internal/http/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request")
		return
	}

	token, err := h.service.Register(r.Context(), req.Email, req.Password, req.Name)
	if err != nil {
		response.Error(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, r, http.StatusCreated, "user registered", map[string]string{"token": token})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, r, http.StatusBadRequest, "invalid request")
		return
	}

	token, err := h.service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		response.Error(w, r, http.StatusUnauthorized, err.Error())
		return
	}

	response.Success(w, r, http.StatusOK, "login successful", map[string]string{"token": token})
}
