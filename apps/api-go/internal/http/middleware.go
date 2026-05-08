package http

import (
	"context"
	"net/http"
	"strings"
	"wch-trading-platform/apps/api-go/internal/http/response"
	"wch-trading-platform/packages/go/domain"
)

type TokenValidator interface {
	ValidateToken(token string) (string, error)
}

func AuthMiddleware(validator TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, r, http.StatusUnauthorized, "missing authorization header")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.Error(w, r, http.StatusUnauthorized, "invalid authorization header format")
				return
			}

			tokenString := parts[1]
			userID, err := validator.ValidateToken(tokenString)
			if err != nil {
				response.Error(w, r, http.StatusUnauthorized, "invalid token")
				return
			}

			ctx := context.WithValue(r.Context(), domain.UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
