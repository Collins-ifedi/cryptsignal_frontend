import { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "medium" | "large";
export type TypingStyle = "instant" | "typewriter" | "natural";
export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  typingStyle: TypingStyle;
  aiName: string;
}

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
};

const defaultSettings: Settings = {
  theme: "light",
  fontSize: "medium",
  typingStyle: "natural",
  aiName: "CryptSignal",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("app-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage and apply theme
  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    
    // Apply font size
    root.classList.remove("text-sm", "text-base", "text-lg");
    switch (settings.fontSize) {
      case "small":
        root.classList.add("text-sm");
        break;
      case "medium":
        root.classList.add("text-base");
        break;
      case "large":
        root.classList.add("text-lg");
        break;
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(current => ({ ...current, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Backward compatibility for theme hook
export function useTheme() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useTheme must be used within a SettingsProvider");
  }
  
  const { settings, updateSettings } = context;
  
  return {
    theme: settings.theme,
    setTheme: (theme: Theme) => updateSettings({ theme }),
    toggleTheme: () => updateSettings({ 
      theme: settings.theme === "light" ? "dark" : "light" 
    }),
  };
}