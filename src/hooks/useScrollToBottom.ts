import { useCallback, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chatbot/ChatbotClient";

export const useScrollToBottom = (chatMessages: ChatMessage[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const scroll = () => {
      if (messagesEndRef.current) {
        const messagesContainer =
          messagesEndRef.current.closest(".overflow-y-auto");

        if (messagesContainer) {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: "smooth",
          });
        }

        // fallback: scrollIntoView
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    };

    setTimeout(scroll, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  return { messagesEndRef, scrollToBottom };
};
