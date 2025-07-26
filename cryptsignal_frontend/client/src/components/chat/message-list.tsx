import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Copy, RotateCcw, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "./settings-provider";
import { TypingMessage } from "./typing-message";
import type { Message } from "@shared/schema";
import { useEffect, useRef } from "react";

interface MessageListProps {
  conversationId: number | null;
  isTyping: boolean;
}

export function MessageList({ conversationId, isTyping }: MessageListProps) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[hsl(var(--ai-green))] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))] mb-2">
            How can I help you today?
          </h2>
          <p className="text-gray-600 dark:text-[hsl(var(--dark-muted))]">
            Start a conversation with {settings.aiName}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-[hsl(var(--dark-muted))]">
            Loading messages...
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[hsl(var(--ai-green))] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[hsl(var(--dark-text))] mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-600 dark:text-[hsl(var(--dark-muted))]">
              Send a message to begin chatting with {settings.aiName}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-slide-up ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-3xl">
                {message.role === "user" ? (
                  <div>
                    <div className="bg-[hsl(var(--ai-green))] text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center justify-end mt-1 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                        {formatTimeAgo(message.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))] hover:text-gray-700 dark:hover:text-[hsl(var(--dark-text))] h-auto p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-[hsl(var(--dark-tertiary))] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-[hsl(var(--ai-green))]" />
                      </div>
                      <div className="bg-gray-100 dark:bg-[hsl(var(--dark-secondary))] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="text-gray-900 dark:text-[hsl(var(--dark-text))]">
                          <TypingMessage content={message.content} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-1 ml-11 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))]">
                        {formatTimeAgo(message.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))] hover:text-gray-700 dark:hover:text-[hsl(var(--dark-text))] h-auto p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 dark:text-[hsl(var(--dark-muted))] hover:text-gray-700 dark:hover:text-[hsl(var(--dark-text))] h-auto p-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-[hsl(var(--dark-tertiary))] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-[hsl(var(--ai-green))]" />
              </div>
              <div className="bg-gray-100 dark:bg-[hsl(var(--dark-secondary))] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
