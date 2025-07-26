import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Trash2, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  conversationId: number | null;
  isTyping: boolean;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onClearChat: () => void;
}

export function MessageInput({ 
  conversationId, 
  isTyping, 
  onStartTyping, 
  onStopTyping, 
  onClearChat 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("No conversation selected");
      return apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
      });
    },
    onMutate: () => {
      onStartTyping();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", conversationId, "messages"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      onStopTyping();
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error("No conversation selected");
      return apiRequest("DELETE", `/api/conversations/${conversationId}/messages`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", conversationId, "messages"],
      });
      onClearChat();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear chat",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || !conversationId || sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = () => {
    if (!conversationId || clearChatMutation.isPending) return;
    clearChatMutation.mutate();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-[hsl(var(--dark-primary))] p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="min-h-[44px] max-h-[200px] resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ai-green))] focus:border-transparent dark:bg-[hsl(var(--dark-secondary))] dark:text-[hsl(var(--dark-text))] placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                disabled={sendMessageMutation.isPending || !conversationId}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sendMessageMutation.isPending || !conversationId}
                className="absolute right-2 bottom-2 w-8 h-8 bg-[hsl(var(--ai-green))] hover:bg-[hsl(var(--ai-green-hover))] disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg p-0"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Input Actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={!conversationId || clearChatMutation.isPending}
                className="text-sm text-gray-500 dark:text-[hsl(var(--dark-muted))] hover:text-gray-700 dark:hover:text-[hsl(var(--dark-text))] h-auto p-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear chat
              </Button>
              {isTyping && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onStopTyping}
                  className="text-sm text-gray-500 dark:text-[hsl(var(--dark-muted))] hover:text-gray-700 dark:hover:text-[hsl(var(--dark-text))] h-auto p-1"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop generating
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
