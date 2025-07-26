export class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  init() {
    this.connect()
  }

  connect() {
    try {
      // Replace with your WebSocket endpoint
      this.ws.onopen = () => {
  console.log("WebSocket connected");
  this.reconnectAttempts = 0;

  // Send initialization message that the new server expects
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  this.ws.send(
    JSON.stringify({
      type: "init", // Corrected message type
      userId: user.id,
    })
  );
};

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
      this.attemptReconnect()
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "message":
        // Handle real-time messages with typing animation
        if (window.chatManager) {
          window.chatManager.addTypingMessage("assistant", data.content, 20) // Faster for real-time
        }
        break

      case "typing":
        // Handle typing indicators
        this.showTypingIndicator(data.isTyping)
        break

      case "error":
        console.error("WebSocket error:", data.message)
        break

      default:
        console.log("Unknown message type:", data.type)
    }
  }

  showTypingIndicator(isTyping) {
    const indicator = document.getElementById("loadingIndicator")
    if (isTyping) {
      indicator.classList.remove("hidden")
    } else {
      indicator.classList.add("hidden")
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn("WebSocket not connected")
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
