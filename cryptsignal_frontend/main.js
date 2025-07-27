import { ChatManager } from "./chat.js"
import { SettingsManager } from "./settings.js"
import { WebSocketManager } from "./websocket.js"

class App {
  constructor() {
    this.chatManager = new ChatManager()
    this.settingsManager = new SettingsManager()
    this.wsManager = new WebSocketManager()

    this.init()
  }

  init() {
    // Check authentication
    if (!this.checkAuth()) {
      window.location.href = "login.html"
      return
    }

    this.setupEventListeners()
    this.loadUserData()
    this.settingsManager.init()
    this.chatManager.init()
    this.wsManager.init()
  }

  checkAuth() {
    const user = localStorage.getItem("user")
    return user !== null
  }

  loadUserData() {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const usernameElement = document.getElementById("username")

    if (usernameElement) {
      usernameElement.textContent = user.username || "Guest"

      // Add verification badges
      const verificationBadges = document.createElement("div")
      verificationBadges.className = "flex space-x-1 mt-1"

      if (user.emailVerified) {
        const emailBadge = document.createElement("span")
        emailBadge.className = "text-xs bg-green-500 text-white px-1 rounded"
        emailBadge.innerHTML = '<i class="fas fa-envelope"></i>'
        emailBadge.title = "Email Verified"
        verificationBadges.appendChild(emailBadge)
      }

      if (user.phoneVerified) {
        const phoneBadge = document.createElement("span")
        phoneBadge.className = "text-xs bg-blue-500 text-white px-1 rounded"
        phoneBadge.innerHTML = '<i class="fas fa-mobile-alt"></i>'
        phoneBadge.title = "Phone Verified"
        verificationBadges.appendChild(phoneBadge)
      }

      // Clear existing badges and add new ones
      const existingBadges = usernameElement.parentNode.querySelector(".verification-badges")
      if (existingBadges) {
        existingBadges.remove()
      }

      verificationBadges.className += " verification-badges"
      usernameElement.parentNode.appendChild(verificationBadges)
    }
  }

  setupEventListeners() {
    // Sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar")
      sidebar.classList.toggle("-translate-x-full")
    })

    // New chat button
    document.getElementById("newChatBtn").addEventListener("click", () => {
      this.chatManager.startNewChat()
    })

    // Settings button
    document.getElementById("settingsBtn").addEventListener("click", () => {
      document.getElementById("settingsModal").classList.remove("hidden")
    })

    // Close settings
    document.getElementById("closeSettings").addEventListener("click", () => {
      document.getElementById("settingsModal").classList.add("hidden")
    })

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user")
      localStorage.removeItem("chats")
      window.location.href = "login.html"
    })

    // Send message
    document.getElementById("sendBtn").addEventListener("click", () => {
      this.sendMessage()
    })

    // Enter key to send
    document.getElementById("messageInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // Auto-resize textarea
    document.getElementById("messageInput").addEventListener("input", (e) => {
      e.target.style.height = "auto"
      e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar")
      const sidebarToggle = document.getElementById("sidebarToggle")

      if (
        window.innerWidth < 768 &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target) &&
        !sidebar.classList.contains("-translate-x-full")
      ) {
        sidebar.classList.add("-translate-x-full")
      }
    })
  }

  async sendMessage() {
    const input = document.getElementById("messageInput")
    const message = input.value.trim()

    if (!message) return

    const sendBtn = document.getElementById("sendBtn")
    sendBtn.disabled = true
    input.value = ""
    input.style.height = "auto"

    // Add user message to chat immediately
    this.chatManager.addMessage("user", message)

    // Show loading indicator
    document.getElementById("loadingIndicator").classList.remove("hidden")

    try {
      const response = await fetch("https://cryptsignal-backend.onrender.com/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          userId: JSON.parse(localStorage.getItem("user") || "{}").id,
          sessionId: this.chatManager.currentChatId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Hide loading indicator before starting typing animation
      document.getElementById("loadingIndicator").classList.add("hidden")

      // Use typing animation for AI response
      await this.chatManager.addTypingMessage("assistant", data.response, 25) // 25ms per character
    } catch (error) {
      console.error("Error sending message:", error)

      // Hide loading indicator
      document.getElementById("loadingIndicator").classList.add("hidden")

      // Use typing animation even for error messages
      await this.chatManager.addTypingMessage("assistant", "Sorry, I encountered an error. Please try again.", 30)
    } finally {
      sendBtn.disabled = false
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App()
})
