"use client";

import { SvgAiCurator, SvgAirplaneOutline } from "@/components/icon/svgs";
import { CuratorResponse } from "@/types/recipe-schema";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ChatbotCuratedRecipeResponse from "./CuratedRecipeResponse";
import LoadingIndicator from "./LoadingIndicator";

export interface ChatMessage {
  id: string;
  content: string | CuratorResponse;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "recipe";
}

export interface ChatbotClientProps {
  messages: {
    title: string;
    subTitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    error: string;
    welcome: string;
    examples: {
      winter: string;
      cinematic: string;
      summer: string;
    };
    loadings: {
      thinking: string;
      thinkingDeeply: string;
      preparing: string;
      waiting: string;
      seconds: string;
    };
    curatedRecipe: {
      aiCustomRecipe: string;
      recommendedRecipe: string;
      baseFilmSimulation: string;
      recommendationReason: string;
      cameraSettings: string;
      filmSimulation: string;
      dynamicRange: string;
      whiteBalance: string;
      highlight: string;
      shadow: string;
      color: string;
      clarity: string;
      noiseReduction: string;
    };
    imageComparisonSlider: {
      title: string;
      source: string;
      retouched: string;
    };
    curatedRecipeUrlPreview: {
      title: string;
      loading: string;
      link: string;
    };
  };
}

const ChatbotClient = ({ messages }: ChatbotClientProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: messages.welcome,
      isUser: false,
      timestamp: new Date(),
      type: "text",
    },
  ]);

  // AI 응답이 있는지 확인 (welcome 메시지 제외)
  const hasAiResponses = chatMessages.some(
    (msg) => !msg.isUser && msg.id !== "welcome"
  );
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const examples = [
    {
      key: "winter",
      text: messages.examples.winter,
      icon: "❄️",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      key: "cinematic",
      text: messages.examples.cinematic,
      icon: "🎬",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      key: "summer",
      text: messages.examples.summer,
      icon: "☀️",
      gradient: "from-green-400 to-teal-500",
    },
  ];

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageToSend,
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
        body: JSON.stringify({ question: messageToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = (await response.json()) as CuratorResponse;
      console.log("🚀 ~ handleSendMessage ~ data:", data);

      // Check if it's a simple string response (like "필름 레시피에 대한 질문을 해주세요.")
      if (typeof data === "string") {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data,
          isUser: false,
          timestamp: new Date(),
          type: "text",
        };
        setChatMessages((prev) => [...prev, botMessage]);
        return;
      }

      // Create structured recipe response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data,
        isUser: false,
        timestamp: new Date(),
        type: "recipe",
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: messages.error,
        isUser: false,
        timestamp: new Date(),
        type: "text",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <section className="w-full h-full flex flex-col bg-base-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-center p-6 border-b border-base-300 bg-base-50/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <SvgAiCurator />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">
              {messages.title}
            </h1>
            <p className="text-xs text-base-content/70">{messages.subTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {chatMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            } animate-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {message.isUser ? (
              <div
                className="max-w-xs md:max-w-md lg:max-w-2xl px-5 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md message-glow bg-primary text-primary-content rounded-br-md user-message-glow"
                style={
                  {
                    "--glow-delay": `${index * 0.8}s`,
                  } as React.CSSProperties
                }
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content as string}
                </p>
              </div>
            ) : message.type === "recipe" ? (
              <div className="max-w-xl md:max-w-2xl lg:max-w-4xl px-5 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md message-glow bg-base-200 text-base-content rounded-bl-md border border-base-300 bot-message-glow">
                <ChatbotCuratedRecipeResponse
                  data={message.content as CuratorResponse}
                  messages={messages.curatedRecipe}
                  imageComparisonSliderMessages={messages.imageComparisonSlider}
                  curatedRecipeUrlPreviewMessages={
                    messages.curatedRecipeUrlPreview
                  }
                />
              </div>
            ) : (
              <div
                className="max-w-xs md:max-w-md lg:max-w-2xl px-5 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md message-glow bg-base-200 text-base-content rounded-bl-md border border-base-300 bot-message-glow"
                style={
                  {
                    "--glow-delay": `${index * 0.8}s`,
                  } as React.CSSProperties
                }
              >
                <div className="text-sm text-base-content">
                  <ReactMarkdown>{message.content as string}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && !isStreaming && (
          <LoadingIndicator messages={messages.loadings} />
        )}

        {/* 예제 메시지들 - AI 응답이 없을 때만 표시 */}
        {!hasAiResponses && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col space-y-2 max-w-md w-full">
              {examples.map((example) => (
                <button
                  key={example.key}
                  onClick={() => handleSendMessage(example.text)}
                  className="text-left p-4 bg-base-200/50 hover:bg-base-200 border border-base-300 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${example.gradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {example.icon}
                    </div>
                    <span className="text-sm text-base-content group-hover:text-primary transition-colors">
                      {example.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-base-300 bg-base-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.placeholder}
                className="textarea textarea-bordered w-full resize-none min-h-12 max-h-32 rounded-2xl border-2 border-base-300 focus:border-primary focus:outline-none transition-all duration-200 bg-base-100 text-base-content placeholder:text-base-content/50 px-4 py-3 pr-12"
                disabled={isLoading}
                rows={1}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgb(156 163 175) transparent",
                }}
                autoFocus
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="btn btn-primary btn-circle h-12 w-12 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={messages.send}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <SvgAirplaneOutline />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotClient;
