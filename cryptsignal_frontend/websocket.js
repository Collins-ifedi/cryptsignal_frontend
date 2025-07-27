export class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    // Base URL for your production backend
    this.baseURL = "cryptsignal-backend.onrender.com";
  }

  init() {
    this.connect();
  }

  connect() {
    // Use wss:// for secure WebSocket connections, required for a site served over https
    const socketURL = `wss://${this.baseURL}/ws`;
    console.log(`Attempting to connect to WebSocket at: ${socketURL}`);

    try {
      this.ws = new WebSocket(socketURL);

      this.ws.onopen = () => {
        console.log("WebSocket connection established.");
        this.reconnectAttempts = 0;

        // The server expects an 'init' message immediately after connection.
        // This is a critical step for your backend to register the session.
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (!user.id) {
            console.error("User ID not found in localStorage. Cannot initialize WebSocket session.");
            this.ws.close(1008, "User ID not found");
            return;
          }

          const initMessage = {
            type: "init",
            userId: user.id,
          };
          this.ws.send(JSON.stringify(initMessage));
          console.log("Sent init message:", initMessage);
        } catch (error) {
          console.error("Failed to send init message:", error);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing incoming WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        // Log the error event itself for more details
        console.error("WebSocket error occurred:", error);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Handles incoming messages from the server.
   * @param {object} data The parsed JSON data from the server.
   */
  handleMessage(data) {
    // The server sends 'new_message', so we listen for that type.
    switch (data.type) {
      case "new_message":
        if (window.chatManager) {
          // Use the 'text' property from the server's message
          window.chatManager.addTypingMessage("assistant", data.text, 20);
        }
        break;

      case "typing":
        this.showTypingIndicator(data.isTyping);
        break;

      case "error":
        console.error("Received error from server:", data.message);
        break;

      default:
        console.log("Received unknown message type:", data.type);
    }
  }

  /**
   * Sends a chat message to the server.
   * This function wraps the text in the format expected by the backend.
   * @param {string} text The user's message text.
   */
  sendMessage(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messagePayload = {
        type: "send_message", // This type is required by your server's logic
        text: text,
      };
      this.ws.send(JSON.stringify(messagePayload));
    } else {
      console.warn("Cannot send message, WebSocket is not connected.");
      // Optionally, queue the message to be sent upon reconnection.
    }
  }

  showTypingIndicator(isTyping) {
    const indicator = document.getElementById("loadingIndicator");
    if (!indicator) return;
    indicator.classList.toggle("hidden", !isTyping);
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("Maximum reconnection attempts reached. Please refresh the page.");
    }
  }

  disconnect() {
    if (this.ws) {
      // Prevent automatic reconnection attempts when manually disconnecting.
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.ws.close();
      this.ws = null;
    }
  }
}