import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Settings } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { MobileSidebar } from "@/components/chat/mobile-sidebar";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { useTheme, useSettings } from "@/components/chat/settings-provider";
import { SettingsDialog } from "@/components/chat/settings-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/conversations", {
      title: "New Conversation",
    }),
    onSuccess: (conversation: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(conversation.id);
    },
  });

  const handleNewChat = () => {
    createConversationMutation.mutate();
  };

  const handleConversationSelect = (id: number) => {
    setCurrentConversationId(id);
  };

  const handleStartTyping = () => {
    setIsTyping(true);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
  };

  const handleClearChat = () => {
    // Chat clearing is handled in MessageInput component
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[hsl(var(--dark-primary))] text-gray-900 dark:text-[hsl(var(--dark-text))] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-[hsl(var(--dark-primary))]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[hsl(var(--dark-tertiary))]"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
          </Button>
          <h1 className="text-lg font-semibold">{settings.aiName}</h1>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[hsl(var(--dark-tertiary))]"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              )}
            </Button>
            <SettingsDialog>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[hsl(var(--dark-tertiary))]"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              </Button>
            </SettingsDialog>
          </div>
        </div>

        {/* Messages */}
        <MessageList 
          conversationId={currentConversationId}
          isTyping={isTyping}
        />

        {/* Message Input */}
        <MessageInput
          conversationId={currentConversationId}
          isTyping={isTyping}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          onClearChat={handleClearChat}
        />
      </div>
    </div>
  );
}
