"use client";

import ChatbotHeader from "@/components/chatbot/ChatbotHeader";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useChatStore } from "@/stores/chat";
import { CuratorResponse } from "@/types/recipe-schema";
import { useShallow } from "zustand/react/shallow";
import ChatbotExampleMessages from "./ChatbotExampleMessages";
import ChatbotLoadingIndicator from "./ChatbotLoadingIndicator";
import ChatbotMessageInput from "./ChatbotMessageInput";
import ChatbotMessageList from "./ChatbotMessageList";

export interface ChatMessage {
  id: string;
  content: string | CuratorResponse;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "recipe";
}

const ScrollPlaceholder = () => {
  const { messages } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
    }))
  );
  const { messagesEndRef } = useScrollToBottom(messages);

  return <div ref={messagesEndRef} />;
};

const ChatbotClient = () => {
  return (
    <section className="w-full h-full flex flex-col bg-base-100 select-text">
      {/* Header */}
      <ChatbotHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        <ChatbotMessageList />

        <ChatbotLoadingIndicator />

        <ChatbotExampleMessages />

        <ScrollPlaceholder />
      </div>

      {/* Input */}
      <ChatbotMessageInput />
    </section>
  );
};

export default ChatbotClient;
