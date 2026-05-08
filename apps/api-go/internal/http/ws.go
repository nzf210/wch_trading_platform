
package http

import (
	"log"
	"net/http"

	"wch-trading-platform/apps/api-go/internal/bus"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Adjust this to your needs
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" || origin == "https://bot-trading.wancash.org"
	},
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *bus.Hub, validator TokenValidator, w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	claims, err := validator.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := bus.NewClient(hub, conn, claims)
	hub.Register(client)

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.WritePump()
	go client.ReadPump()

	log.Printf("WebSocket client connected for user %s", client.UserID)
}
