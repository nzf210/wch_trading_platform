package auth

import (
	"context"
	"errors"
)

type Service interface {
	Register(ctx context.Context, email, password, name string) (string, error)
	Login(ctx context.Context, email, password string) (string, error)
	ValidateToken(token string) (string, error)
}

type authService struct {
	repo      Repository
	jwtSecret string
}

func NewService(repo Repository, jwtSecret string) Service {
	return &authService{repo: repo, jwtSecret: jwtSecret}
}

func (s *authService) Register(ctx context.Context, email, password, name string) (string, error) {
	hash, err := HashPassword(password)
	if err != nil {
		return "", err
	}

	user := &User{
		Email:        email,
		PasswordHash: hash,
		Name:         name,
		Role:         "user",
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return "", err
	}

	return GenerateToken(user.ID, user.Email, user.Role, s.jwtSecret)
}

func (s *authService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if !CheckPasswordHash(password, user.PasswordHash) {
		return "", errors.New("invalid credentials")
	}

	return GenerateToken(user.ID, user.Email, user.Role, s.jwtSecret)
}

func (s *authService) ValidateToken(token string) (string, error) {
	claims, err := ValidateToken(token, s.jwtSecret)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}
