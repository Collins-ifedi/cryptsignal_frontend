export class SettingsManager {
  constructor() {
    this.settings = JSON.parse(localStorage.getItem("settings") || "{}")
    this.defaultSettings = {
      theme: "light",
      fontStyle: "font-sans",
      fontColor: "#000000",
    }

    // Merge with defaults
    this.settings = { ...this.defaultSettings, ...this.settings }
  }

  init() {
    this.applySettings()
    this.setupEventListeners()
    this.updateUI()
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Font style
    document.getElementById("fontStyle").addEventListener("change", (e) => {
      this.updateSetting("fontStyle", e.target.value)
    })

    // Font color
    document.getElementById("fontColor").addEventListener("change", (e) => {
      this.updateSetting("fontColor", e.target.value)
    })
  }

  toggleTheme() {
    const newTheme = this.settings.theme === "light" ? "dark" : "light"
    this.updateSetting("theme", newTheme)
  }

  updateSetting(key, value) {
    this.settings[key] = value
    this.saveSettings()
    this.applySettings()
    this.updateUI()
  }

  applySettings() {
    const html = document.documentElement

    // Apply theme
    if (this.settings.theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }

    // Apply font style
    document.body.className = document.body.className.replace(/font-\w+/g, "")
    document.body.classList.add(this.settings.fontStyle)

    // Apply font color (only in light mode)
    if (this.settings.theme === "light") {
      document.body.style.color = this.settings.fontColor
    } else {
      document.body.style.color = ""
    }
  }

  updateUI() {
    // Update theme toggle
    const themeToggle = document.getElementById("themeToggle")
    const toggleSpan = themeToggle.querySelector("span")

    if (this.settings.theme === "dark") {
      toggleSpan.classList.add("translate-x-6")
      themeToggle.classList.add("bg-blue-500")
      themeToggle.classList.remove("bg-gray-200")
    } else {
      toggleSpan.classList.remove("translate-x-6")
      themeToggle.classList.remove("bg-blue-500")
      themeToggle.classList.add("bg-gray-200")
    }

    // Update font style select
    document.getElementById("fontStyle").value = this.settings.fontStyle

    // Update font color
    document.getElementById("fontColor").value = this.settings.fontColor

    // About section content should be updated in the HTML, but if it's dynamically generated:
    const aboutContent = `
    CryptSignal AI Chat v1.0<br>
    Advanced AI-powered communication platform<br>
    Built with HTML, TailwindCSS, and Vanilla JavaScript
`
  }

  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings))
  }
}
