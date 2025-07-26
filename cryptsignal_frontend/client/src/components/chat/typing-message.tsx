import { useState, useEffect } from "react";
import { useSettings } from "./settings-provider";

interface TypingMessageProps {
  content: string;
  onComplete?: () => void;
}

export function TypingMessage({ content, onComplete }: TypingMessageProps) {
  const { settings } = useSettings();
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (settings.typingStyle === "instant") {
      setDisplayedContent(content);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (settings.typingStyle === "typewriter") {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, 30); // Character every 30ms

      return () => clearInterval(interval);
    }

    if (settings.typingStyle === "natural") {
      let currentIndex = 0;
      const typeNextChunk = () => {
        if (currentIndex >= content.length) {
          setIsComplete(true);
          onComplete?.();
          return;
        }

        // Simulate natural typing with variable speed
        const chunkSize = Math.random() > 0.7 ? 2 : 1; // Sometimes type 2 characters
        const nextIndex = Math.min(currentIndex + chunkSize, content.length);
        
        setDisplayedContent(content.slice(0, nextIndex));
        currentIndex = nextIndex;

        // Variable delay for natural feel
        let delay = 50 + Math.random() * 100; // Base 50-150ms
        
        // Pause longer at punctuation
        const lastChar = content[nextIndex - 1];
        if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
          delay += 300 + Math.random() * 200; // 300-500ms pause
        } else if (lastChar === ',' || lastChar === ';') {
          delay += 150 + Math.random() * 100; // 150-250ms pause
        } else if (lastChar === ' ') {
          delay += 20 + Math.random() * 30; // 20-50ms pause
        }

        setTimeout(typeNextChunk, delay);
      };

      typeNextChunk();
    }
  }, [content, settings.typingStyle, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedContent}
      {!isComplete && settings.typingStyle !== "instant" && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}