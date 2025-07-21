"use client";

import { SvgAiCurator, SvgAirplaneOutline } from "@/components/icon/svgs";
import {
  getInitialOpenGraph,
  getOpenGraph,
  OpenGraph,
} from "@/utils/getOpenGraph";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import z from "zod";

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
  const [isStreaming, setIsStreaming] = useState(false);
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

      let isFirstChunk = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        botMessageContent += chunk;

        // 첫 번째 청크가 도착하면 스트리밍 시작으로 간주
        if (isFirstChunk) {
          setIsStreaming(true);
          isFirstChunk = false;
        }

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
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <p className="text-xs text-base-content/70">
              인공지능 필름 레시피 어시스턴트
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            } animate-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-2xl px-5 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md message-glow ${
                message.isUser
                  ? "bg-primary text-primary-content rounded-br-md user-message-glow"
                  : "bg-base-200 text-base-content rounded-bl-md border border-base-300 bot-message-glow"
              }`}
              style={
                {
                  "--glow-delay": `${index * 0.8}s`,
                } as React.CSSProperties
              }
            >
              {message.isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <div className="text-sm text-base-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
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
                      a: ({ href, children }) => {
                        const [openGraph, setOpenGraph] =
                          useState<null | OpenGraph>(null);
                        useEffect(() => {
                          const fetchOpenGraphImage = async () => {
                            if (openGraph) return;

                            const isValidURL = z.url().safeParse(href).success;
                            if (!isValidURL) return;
                            try {
                              const response = (await Promise.race([
                                fetch("/api/recipes/url", {
                                  method: "POST",
                                  body: JSON.stringify({ url: href }),
                                }),
                                new Promise((_, reject) =>
                                  setTimeout(
                                    () => reject(new Error("timeout")),
                                    5000
                                  )
                                ),
                              ])) as Response;

                              const data = await response.json();

                              if (!data?.urlHtml) return;

                              const parsedOpenGraph = getOpenGraph(
                                data.urlHtml
                              );

                              if (!parsedOpenGraph.image.url) return;

                              setOpenGraph(parsedOpenGraph);
                            } catch (error) {
                              console.log(error);
                              setOpenGraph(null);
                            }
                          };

                          fetchOpenGraphImage();
                        }, [href]);

                        return openGraph?.image?.url ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-3 mb-2 max-w-[300px] rounded-lg overflow-hidden border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                          >
                            <div className="relative">
                              <Image
                                src={openGraph?.image?.url ?? ""}
                                alt={openGraph?.image?.alt ?? ""}
                                quality={30}
                                width={300}
                                height={160}
                                className="w-full h-40 object-cover"
                                style={{
                                  aspectRatio: "15/8",
                                }}
                              />
                            </div>
                            {(openGraph?.title || openGraph?.description) && (
                              <div className="p-4">
                                {openGraph?.title && (
                                  <h4 className="text-sm font-semibold text-base-content line-clamp-2 mb-2 leading-tight">
                                    {openGraph.title}
                                  </h4>
                                )}
                                {openGraph?.description && (
                                  <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
                                    {openGraph.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </a>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-focus underline break-all transition-colors duration-200"
                          >
                            {children}
                          </a>
                        );
                      },
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-base-300 text-base-content px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-base-300 text-base-content p-3 rounded-lg overflow-x-auto text-xs font-mono my-2">
                            <code>{children}</code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && !isStreaming && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-base-200 text-base-content px-5 py-4 rounded-2xl rounded-bl-md border border-base-300 shadow-sm message-glow bot-message-glow">
              <div className="flex items-center space-x-3">
                <span className="loading loading-dots loading-sm text-primary"></span>
                <span className="text-sm text-base-content/70">
                  {messages.thinking}
                </span>
              </div>
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
              {inputValue.trim() && (
                <div className="absolute right-3 bottom-3 text-xs text-base-content/40">
                  Enter to send
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
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
