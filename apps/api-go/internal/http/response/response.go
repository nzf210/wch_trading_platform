package response

import (
	"encoding/json"
	"net/http"
	"wch-trading-platform/packages/go/domain"
	"wch-trading-platform/packages/go/logger"
)

type Response struct {
	Success       bool        `json:"success"`
	Message       string      `json:"message,omitempty"`
	Data          interface{} `json:"data,omitempty"`
	CorrelationID string      `json:"correlation_id,omitempty"`
}

func JSON(w http.ResponseWriter, r *http.Request, status int, data interface{}) {
	correlationID, _ := r.Context().Value(domain.CorrelationIDKey).(string)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)

	if status >= 400 {
		logger.Error(r.Context(), "request failed", nil, map[string]interface{}{
			"status":         status,
			"path":           r.URL.Path,
			"correlation_id": correlationID,
		})
	}
}

func Success(w http.ResponseWriter, r *http.Request, status int, message string, data interface{}) {
	correlationID, _ := r.Context().Value(domain.CorrelationIDKey).(string)
	JSON(w, r, status, Response{
		Success:       true,
		Message:       message,
		Data:          data,
		CorrelationID: correlationID,
	})
}

func Error(w http.ResponseWriter, r *http.Request, status int, message string) {
	correlationID, _ := r.Context().Value(domain.CorrelationIDKey).(string)
	JSON(w, r, status, Response{
		Success:       false,
		Message:       message,
		CorrelationID: correlationID,
	})
}
