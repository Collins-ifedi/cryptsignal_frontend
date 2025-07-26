import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Moon, Sun, Type, Zap, Info, RotateCcw } from "lucide-react";
import { useSettings, type FontSize, type TypingStyle, type Theme } from "./settings-provider";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateSettings({ fontSize });
  };

  const handleTypingStyleChange = (typingStyle: TypingStyle) => {
    updateSettings({ typingStyle });
  };

  const handleReset = () => {
    resetSettings();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[hsl(var(--dark-secondary))] border border-gray-200 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-[hsl(var(--dark-text))]">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-[hsl(var(--dark-muted))]">
            Customize your {settings.aiName} experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))]">
                Appearance
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm text-gray-700 dark:text-[hsl(var(--dark-text))]">
                  Theme
                </Label>
                <Select value={settings.theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                    <SelectItem value="light" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize" className="text-sm text-gray-700 dark:text-[hsl(var(--dark-text))]">
                  Font Size
                </Label>
                <Select value={settings.fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                    <SelectItem value="small" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                      <div className="flex items-center gap-2">
                        <Type className="h-3 w-3" />
                        Small
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="large" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                      <div className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Large
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-600" />

          {/* Behavior Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))]">
                Behavior
              </h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="typingStyle" className="text-sm text-gray-700 dark:text-[hsl(var(--dark-text))]">
                Response Style
              </Label>
              <Select value={settings.typingStyle} onValueChange={handleTypingStyleChange}>
                <SelectTrigger className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[hsl(var(--dark-tertiary))] border-gray-300 dark:border-gray-600">
                  <SelectItem value="instant" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                    <div className="space-y-1">
                      <div className="font-medium">Instant</div>
                      <div className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                        Responses appear immediately
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="typewriter" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                    <div className="space-y-1">
                      <div className="font-medium">Typewriter</div>
                      <div className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                        Text appears character by character
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="natural" className="focus:bg-gray-100 dark:focus:bg-[hsl(var(--dark-secondary))]">
                    <div className="space-y-1">
                      <div className="font-medium">Natural</div>
                      <div className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                        Realistic typing speed with pauses
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-600" />

          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))]">
                About
              </h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-[hsl(var(--dark-muted))]">
              <div className="flex justify-between items-center">
                <span>AI Assistant:</span>
                <span className="font-medium text-[hsl(var(--ai-green))]">{settings.aiName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Build:</span>
                <span className="font-medium">2025.01.22</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs leading-relaxed">
                  {settings.aiName} is an advanced AI assistant designed to help you with various tasks. 
                  Built with modern web technologies for a seamless chat experience.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Section */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-600 dark:text-[hsl(var(--dark-muted))] border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[hsl(var(--dark-tertiary))]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-[hsl(var(--ai-green))] hover:bg-[hsl(var(--ai-green-hover))] text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}