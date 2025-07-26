import { VerificationManager } from "./verification.js"

class AuthManager {
  constructor() {
    this.verificationManager = new VerificationManager()
    this.currentUser = null
    this.init()
  }

  init() {
    // Check if already logged in
    if (localStorage.getItem("user")) {
      window.location.href = "index.html"
      return
    }

    this.setupEventListeners()
    this.loadTheme()
  }

  setupEventListeners() {
    // Form toggles
    document.getElementById("showSignup")?.addEventListener("click", () => {
      this.showSignupForm()
    })

    document.getElementById("showLogin")?.addEventListener("click", () => {
      this.showLoginForm()
    })

    // Login form
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleLogin()
    })

    // Signup form
    document.getElementById("signupForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSignup()
    })

    // Email verification
    document.getElementById("emailVerifyForm")?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleEmailVerification()
    })

    // Phone verification
    document.getElementById("phoneVerifyForm")?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handlePhoneVerification()
    })

    // Resend codes
    document.getElementById("resendEmailCode")?.addEventListener("click", () => {
      this.resendEmailCode()
    })

    document.getElementById("resendPhoneCode")?.addEventListener("click", () => {
      this.resendPhoneCode()
    })

    // Skip phone verification
    document.getElementById("skipPhoneVerification")?.addEventListener("click", () => {
      this.completeRegistration()
    })

    // Guest login
    document.getElementById("guestLogin")?.addEventListener("click", () => {
      this.handleGuestLogin()
    })

    // Theme toggle
    document.getElementById("themeToggleLogin")?.addEventListener("click", () => {
      this.toggleTheme()
    })

    // Auto-format phone number
    document.getElementById("signupPhone")?.addEventListener("input", (e) => {
      e.target.value = this.formatPhoneInput(e.target.value)
    })
  }

  showSignupForm() {
    document.getElementById("loginForm").classList.add("hidden")
    document.getElementById("signupForm").classList.remove("hidden")
    document.getElementById("emailVerificationForm").classList.add("hidden")
    document.getElementById("phoneVerificationForm").classList.add("hidden")
  }

  showLoginForm() {
    document.getElementById("loginForm").classList.remove("hidden")
    document.getElementById("signupForm").classList.add("hidden")
    document.getElementById("emailVerificationForm").classList.add("hidden")
    document.getElementById("phoneVerificationForm").classList.add("hidden")
    this.verificationManager.stopTimers()
  }

  async handleLogin() {
    const username = document.getElementById("loginUsername").value.trim()
    const password = document.getElementById("loginPassword").value

    if (!username || !password) {
      this.showError("Please fill in all fields")
      return
    }

    try {
      // For demo purposes, we'll accept any username/password
      // In a real app, you'd validate against your backend
      const user = {
        id: Date.now().toString(),
        username: username,
        email: null,
        phone: null,
        emailVerified: false,
        phoneVerified: false,
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(user))
      window.location.href = "index.html"
    } catch (error) {
      this.showError("Login failed. Please try again.")
    }
  }

  async handleSignup() {
    const username = document.getElementById("signupUsername").value.trim()
    const email = document.getElementById("signupEmail").value.trim()
    const phone = document.getElementById("signupPhone").value.trim()
    const password = document.getElementById("signupPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      this.showError("Please fill in all required fields")
      return
    }

    if (!this.verificationManager.validateEmail(email)) {
      this.showError("Please enter a valid email address")
      return
    }

    if (phone && !this.verificationManager.validatePhone(phone)) {
      this.showError("Please enter a valid phone number")
      return
    }

    if (password.length < 6) {
      this.showError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      this.showError("Passwords do not match")
      return
    }

    try {
      // Store user data temporarily
      this.currentUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        phone: phone,
        emailVerified: false,
        phoneVerified: false,
        signupTime: new Date().toISOString(),
      }

      // Start email verification process
      await this.startEmailVerification()
    } catch (error) {
      this.showError("Signup failed. Please try again.")
    }
  }

  async startEmailVerification() {
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)

      // Show email verification form
      document.getElementById("signupForm").classList.add("hidden")
      document.getElementById("emailVerificationForm").classList.remove("hidden")
      document.getElementById("verificationEmail").textContent = this.currentUser.email

      this.verificationManager.startEmailTimer()
      this.showSuccess("Verification code sent to your email!")
    } catch (error) {
      this.showError("Failed to send verification email. Please try again.")
    }
  }

  async handleEmailVerification() {
    const code = document.getElementById("emailCode").value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code")
      return
    }

    try {
      await this.verificationManager.verifyEmailCode(code)
      this.currentUser.emailVerified = true

      // If phone number provided, start phone verification
      if (this.currentUser.phone) {
        await this.startPhoneVerification()
      } else {
        this.completeRegistration()
      }
    } catch (error) {
      this.showError(error.message)
    }
  }

  async startPhoneVerification() {
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)

      // Show phone verification form
      document.getElementById("emailVerificationForm").classList.add("hidden")
      document.getElementById("phoneVerificationForm").classList.remove("hidden")
      document.getElementById("verificationPhone").textContent = this.verificationManager.formatPhoneNumber(
        this.currentUser.phone,
      )

      this.verificationManager.startPhoneTimer()
      this.showSuccess("Verification code sent to your phone!")
    } catch (error) {
      this.showError("Failed to send verification SMS. Please try again.")
    }
  }

  async handlePhoneVerification() {
    const code = document.getElementById("phoneCode").value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code")
      return
    }

    try {
      await this.verificationManager.verifyPhoneCode(code)
      this.currentUser.phoneVerified = true
      this.completeRegistration()
    } catch (error) {
      this.showError(error.message)
    }
  }

  completeRegistration() {
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(this.currentUser))

    // Clean up
    this.verificationManager.stopTimers()

    // Show success and redirect
    this.showSuccess("Account created successfully!")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  }

  async resendEmailCode() {
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)
      this.verificationManager.startEmailTimer()

      const resendBtn = document.getElementById("resendEmailCode")
      resendBtn.textContent = "Resend Code"
      resendBtn.classList.remove("text-red-500")

      this.showSuccess("New verification code sent!")
    } catch (error) {
      this.showError("Failed to resend code. Please try again.")
    }
  }

  async resendPhoneCode() {
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)
      this.verificationManager.startPhoneTimer()

      const resendBtn = document.getElementById("resendPhoneCode")
      resendBtn.textContent = "Resend Code"
      resendBtn.classList.remove("text-red-500")

      this.showSuccess("New verification code sent!")
    } catch (error) {
      this.showError("Failed to resend code. Please try again.")
    }
  }

  handleGuestLogin() {
    const user = {
      id: "guest_" + Date.now(),
      username: "Guest",
      email: null,
      phone: null,
      emailVerified: false,
      phoneVerified: false,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem("user", JSON.stringify(user))
    window.location.href = "index.html"
  }

  formatPhoneInput(value) {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "")

    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else {
      return cleaned
    }
  }

  showError(message) {
    this.showMessage(message, "error")
  }

  showSuccess(message) {
    this.showMessage(message, "success")
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector(".auth-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    // Create new message
    const messageDiv = document.createElement("div")
    messageDiv.className = `auth-message fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white z-50 ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    }`
    messageDiv.textContent = message

    document.body.appendChild(messageDiv)

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove()
    }, 5000)
  }

  toggleTheme() {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")

    if (isDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
  }

  loadTheme() {
    const theme = localStorage.getItem("theme") || "light"
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AuthManager()
})
