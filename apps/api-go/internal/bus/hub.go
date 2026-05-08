
package bus

import "log"

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients. Maps user ID to a set of clients.
	clients map[string]map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan *Message

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

// Message is a wrapper for a message to be broadcasted, targeting a specific user.
type Message struct {
	// The raw message payload
	Data []byte
	// The user ID to send the message to.
	UserID string
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]map[*Client]bool),
	}
}

// Register queues a client for hub registration.
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister queues a client for hub removal.
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if _, ok := h.clients[client.UserID]; !ok {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			log.Printf("Client registered for user %s", client.UserID)

		case client := <-h.unregister:
			if userClients, ok := h.clients[client.UserID]; ok {
				if _, ok := userClients[client]; ok {
					delete(userClients, client)
					close(client.send)
					if len(userClients) == 0 {
						delete(h.clients, client.UserID)
					}
					log.Printf("Client unregistered for user %s", client.UserID)
				}
			}

		case message := <-h.broadcast:
			if userClients, ok := h.clients[message.UserID]; ok {
				for client := range userClients {
					select {
					case client.send <- message.Data:
					default:
						close(client.send)
						delete(userClients, client)
						if len(userClients) == 0 {
							delete(h.clients, message.UserID)
						}
					}
				}
			}
		}
	}
}
