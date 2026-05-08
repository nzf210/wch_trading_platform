package auth

import (
	"context"
	"database/sql"
)

type User struct {
	ID           string
	Email        string
	PasswordHash string
	Name         string
	Role         string
	Status       string
}

type Repository interface {
	CreateUser(ctx context.Context, user *User) error
	GetUserByEmail(ctx context.Context, email string) (*User, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) CreateUser(ctx context.Context, user *User) error {
	query := `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id`
	return r.db.QueryRowContext(ctx, query, user.Email, user.PasswordHash, user.Name, user.Role).Scan(&user.ID)
}

func (r *postgresRepository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, email, password_hash, name, role, status FROM users WHERE email = $1`
	user := &User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role, &user.Status)
	if err != nil {
		return nil, err
	}
	return user, nil
}
