import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme, useSettings } from "./settings-provider";
import { SettingsDialog } from "./settings-dialog";
import { Plus, Moon, Sun, User, Trash2, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@shared/schema";

interface SidebarProps {
  currentConversationId: number | null;
  onConversationSelect: (id: number) => void;
  onNewChat: () => void;
}

export function Sidebar({ currentConversationId, onConversationSelect, onNewChat }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleDeleteConversation = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversationMutation.mutate(id);
  };

  const formatTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-50 dark:bg-[hsl(var(--dark-secondary))] border-r border-gray-200 dark:border-gray-600 transition-colors duration-300">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))]">
          {settings.aiName}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[hsl(var(--dark-tertiary))]"
        >
          <Plus className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2">
          <div className="space-y-2">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors duration-200 relative ${
                    currentConversationId === conversation.id
                      ? "bg-gray-200 dark:bg-[hsl(var(--dark-tertiary))]"
                      : "hover:bg-gray-200 dark:hover:bg-[hsl(var(--dark-tertiary))]"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-[hsl(var(--dark-text))] truncate pr-6">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))] mt-1">
                    {formatTimeAgo(conversation.createdAt)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  >
                    <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[hsl(var(--ai-green))] rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-[hsl(var(--dark-text))]">
              User
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[hsl(var(--dark-tertiary))]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              )}
            </Button>
            <SettingsDialog>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[hsl(var(--dark-tertiary))]"
              >
                <Settings className="h-4 w-4 text-gray-600 dark:text-[hsl(var(--dark-muted))]" />
              </Button>
            </SettingsDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
