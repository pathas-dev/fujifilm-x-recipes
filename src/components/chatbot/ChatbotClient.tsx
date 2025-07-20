"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotClientProps {
  messages: {
    title: string;
    placeholder: string;
    send: string;
    thinking: string;
    error: string;
    welcome: string;
  };
}

const ChatbotClient = ({ messages }: ChatbotClientProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: messages.welcome,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let botMessageContent = "";
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        botMessageContent += chunk;

        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, content: botMessageContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: messages.error,
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="w-full h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-base-300">
        <h1 className="text-xl font-bold text-base-content">
          {messages.title}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                message.isUser
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content"
              }`}
            >
              {message.isUser ? (
                <p className="text-sm">{message.content}</p>
              ) : (
                <div className="text-sm text-base-content">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <div className="text-lg font-bold mb-3 mt-4 text-base-content first:mt-0">
                          {children}
                        </div>
                      ),
                      h2: ({ children }) => (
                        <div className="text-base font-bold mb-2 mt-3 text-base-content first:mt-0">
                          {children}
                        </div>
                      ),
                      h3: ({ children }) => (
                        <div className="text-sm font-bold mb-2 mt-3 text-base-content first:mt-0">
                          {children}
                        </div>
                      ),
                      strong: ({ children }) => (
                        <span className="font-bold text-base-content block mb-2 mt-2 first:mt-0">
                          {children}
                        </span>
                      ),
                      p: ({ children }) => (
                        <div className="mb-2 text-base-content leading-relaxed">
                          {children}
                        </div>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1 text-base-content ml-2">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-base-content">{children}</li>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-focus underline break-all"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-base-200 text-base-content px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="loading loading-dots loading-sm"></span>
                <span className="text-sm">{messages.thinking}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base-300">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={messages.placeholder}
            className="textarea textarea-bordered flex-1 resize-none min-h-12"
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn btn-primary h-12"
          >
            {messages.send}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatbotClient;
