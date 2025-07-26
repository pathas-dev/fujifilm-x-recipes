"use client";

import { SvgAiCurator, SvgAirplaneOutline } from "@/components/icon/svgs";
import { CuratorResponse } from "@/types/recipe-schema";
import { CAMERA_MODELS, CameraModel } from "@/types/camera-schema";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ChatbotCuratedRecipeResponse from "./CuratedRecipeResponse";
import LoadingIndicator from "./LoadingIndicator";
import { AgentStep } from "@/app/api/chatbot/agent";
import useCameraStore from "@/stores/camera";

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
    error: string;
    welcome: string;
    examples: {
      winter: string;
      cinematic: string;
      summer: string;
      blackWhite: string;
    };
    loadings: {
      placeholder: string;
      analyzing: string;
      searching: string;
      generating: string;
      processing: string;
      completed: string;
      seconds: string;
    };
    curatedRecipe: {
      aiCustomRecipe: string;
      recommendedRecipe: string;
      baseFilmSimulation: string;
      recommendationReason: string;
      cameraSettings: string;
      filmSimulation: string;
      exposure: string;
      dynamicRange: string;
      whiteBalance: string;
      highlight: string;
      shadow: string;
      color: string;
      sharpness: string;
      clarity: string;
      noiseReduction: string;
      grainEffect: string;
      grainSize: string;
      colourChrome: string;
      colourChromeFXBlue: string;
      priority: string;
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
  const [message, setMessage] = useState("");
  const { cameraModel, setCameraModel } = useCameraStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    messages.loadings.placeholder
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const examples: {
    key: keyof ChatbotClientProps["messages"]["examples"];
    message: string;
    cameraModel: CameraModel;
    icon: string;
    gradient: string;
  }[] = [
    {
      key: "winter",
      message: messages.examples.winter,
      cameraModel: "X-T30",
      icon: "❄️",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      key: "cinematic",
      message: messages.examples.cinematic,
      cameraModel: "X-PRO3",
      icon: "🎬",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      key: "summer",
      message: messages.examples.summer,
      cameraModel: "X100VI",
      icon: "☀️",
      gradient: "from-green-400 to-teal-500",
    },
    {
      key: "blackWhite",
      message: messages.examples.blackWhite,
      cameraModel: "X-T5",
      icon: "🎞️",
      gradient: "from-black to-white",
    },
  ];

  const handleSendMessage = async ({
    cameraModel,
    message,
  }: {
    message: string;
    cameraModel: CameraModel;
  }) => {
    if (!message.trim() || !cameraModel || isLoading) return;

    const question = `${cameraModel} ${message}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: question,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";
      let currentEvent: "state" | "" | AgentStep = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.substring(7).trim() as AgentStep | "state";

            // 상태별 로딩 메시지 업데이트
          } else if (line.startsWith("data: ")) {
            const dataContent = line.substring(6);

            try {
              const eventData = JSON.parse(dataContent);

              switch (currentEvent) {
                case "completed":
                  if (typeof eventData === "string") {
                    const botMessage: ChatMessage = {
                      id: (Date.now() + 2).toString(),
                      content: eventData,
                      isUser: false,
                      timestamp: new Date(),
                      type: "text",
                    };
                    return setChatMessages((prev) => [...prev, botMessage]);
                  }
                  const botMessage: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    content: eventData,
                    isUser: false,
                    timestamp: new Date(),
                    type: "recipe",
                  };
                  return setChatMessages((prev) => [...prev, botMessage]);
                case "error":
                  throw new Error(eventData.error || "Unknown error");
                default:
                  const stateMessages = {
                    analyzing: messages.loadings.analyzing,
                    searching: messages.loadings.searching,
                    generating: messages.loadings.generating,
                    processing: messages.loadings.processing,
                  };

                  const currentStateMessage =
                    stateMessages[
                      eventData.step as keyof typeof stateMessages
                    ] || messages.loadings.placeholder;

                  setLoadingMessage(currentStateMessage);
                  break;
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage({ message, cameraModel });
    }
  };

  const scrollToBottom = () => {
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
        {isLoading && (
          <LoadingIndicator
            loadingMessage={loadingMessage}
            messages={{ seconds: messages.loadings.seconds }}
          />
        )}

        {/* 예제 메시지들 - AI 응답이 없을 때만 표시 */}
        {!hasAiResponses && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col space-y-2 max-w-md w-full">
              {examples.map((example) => (
                <button
                  key={example.key}
                  onClick={() =>
                    handleSendMessage({
                      message: example.message,
                      cameraModel,
                    })
                  }
                  className="text-left p-4 bg-base-200/50 hover:bg-base-200 border border-base-300 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${example.gradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {example.icon}
                    </div>
                    <span className="text-sm text-base-content group-hover:text-primary transition-colors">
                      {example.message}
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
      <div className="p-3 border-t border-base-300 bg-base-50">
        <div className="max-w-4xl mx-auto space-y-1">
          {/* Camera Selection - 모바일에서만 상단에 표시 */}
          <select
            value={cameraModel}
            onChange={(e) => setCameraModel(e.target.value as CameraModel)}
            className="select select-xs w-full sm:hidden bg-base-100 border border-base-300 focus:border-primary  text-xs focus:outline-none"
            disabled={isLoading}
          >
            {CAMERA_MODELS.toSorted().map((camera) => (
              <option key={camera} value={camera}>
                {camera}
              </option>
            ))}
          </select>

          {/* Input Container */}
          <div className="join w-full sm:gap-2">
            {/* Camera Selection - sm 이상에서만 표시 */}
            <select
              value={cameraModel}
              onChange={(e) => setCameraModel(e.target.value as CameraModel)}
              className="join-item select hidden sm:flex bg-base-100 border-base-300 focus:border-primary rounded-sm focus:outline-none w-28 text-xs min-h-12"
              disabled={isLoading}
            >
              {CAMERA_MODELS.toSorted().map((camera) => (
                <option key={camera} value={camera}>
                  {camera}
                </option>
              ))}
            </select>

            {/* Message Input */}
            <div className="join-item flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.placeholder}
                className="textarea w-full resize-none min-h-12 max-h-32 bg-base-100 border-base-300 focus:border-primary focus:outline-none px-4 py-3 pr-12"
                disabled={isLoading}
                rows={1}
                autoFocus
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage({ message, cameraModel })}
                disabled={!message.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm btn-square"
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
      </div>
    </section>
  );
};

export default ChatbotClient;
