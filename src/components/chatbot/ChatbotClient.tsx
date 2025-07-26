"use client";

import { AgentStep } from "@/app/api/chatbot/agent";
import { SvgAiCurator } from "@/components/icon/svgs";
import { CuratorResponse } from "@/types/recipe-schema";
import { CameraModel } from "@/types/camera-schema";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ChatbotLoadingIndicator from "./ChatbotLoadingIndicator";
import ChatbotMessageInput from "./ChatbotMessageInput";
import ChatbotMessageList from "./ChatbotMessageList";
import ChatbotExampleMessages from "./ChatbotExampleMessages";

export interface ChatMessage {
  id: string;
  content: string | CuratorResponse;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "recipe";
}

const ChatbotClient = () => {
  const t = useTranslations("Chatbot");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: t("welcome"),
      isUser: false,
      timestamp: new Date(),
      type: "text",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    t("loadings.placeholder")
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI 응답이 있는지 확인 (welcome 메시지 제외) - useMemo로 최적화
  const hasAiResponses = useMemo(
    () => chatMessages.some((msg) => !msg.isUser && msg.id !== "welcome"),
    [chatMessages]
  );

  const tAnalyzing = t("loadings.analyzing");
  const tSearching = t("loadings.searching");
  const tGenerating = t("loadings.generating");
  const tProcessing = t("loadings.processing");
  const tPlaceholder = t("loadings.placeholder");
  const tError = t("error");

  const handleSendMessage = useCallback(
    async ({
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
                      analyzing: tAnalyzing,
                      searching: tSearching,
                      generating: tGenerating,
                      processing: tProcessing,
                    };

                    const currentStateMessage =
                      stateMessages[
                        eventData.step as keyof typeof stateMessages
                      ] || tPlaceholder;

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
          content: tError,
          isUser: false,
          timestamp: new Date(),
          type: "text",
        };
        setChatMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      tAnalyzing,
      tSearching,
      tGenerating,
      tProcessing,
      tPlaceholder,
      tError,
    ]
  );

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
              {t("title")}
            </h1>
            <p className="text-xs text-base-content/70">{t("subTitle")}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        <ChatbotMessageList messages={chatMessages} />

        {isLoading && (
          <ChatbotLoadingIndicator loadingMessage={loadingMessage} />
        )}

        {/* 예제 메시지들 - AI 응답이 없을 때만 표시 */}
        <ChatbotExampleMessages
          onSendMessage={handleSendMessage}
          hasAiResponses={hasAiResponses}
          isLoading={isLoading}
        />

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatbotMessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </section>
  );
};

export default ChatbotClient;
