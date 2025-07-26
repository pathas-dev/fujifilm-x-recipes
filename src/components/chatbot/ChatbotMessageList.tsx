"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "./ChatbotClient";
import { CuratorResponse } from "@/types/recipe-schema";
import ChatbotCuratedRecipeResponse from "./CuratedRecipe/CuratedRecipeResponse";

interface ChatbotMessageListProps {
  messages: ChatMessage[];
}

const ChatbotMessageList = memo<ChatbotMessageListProps>(({ messages }) => {
  return (
    <>
      {messages.map((message, index) => (
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
    </>
  );
});

ChatbotMessageList.displayName = "MessageList";

export default ChatbotMessageList;
