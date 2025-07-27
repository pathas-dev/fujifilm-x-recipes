'use client';

import ChatbotHeader from '@/components/chatbot/ChatbotHeader';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useChatStore } from '@/stores/chat';
import { CuratorResponse } from '@/types/recipe-schema';
import { useShallow } from 'zustand/react/shallow';
import ChatbotExampleMessages from './ChatbotExampleMessages';
import ChatbotLoadingIndicator from './ChatbotLoadingIndicator';
import ChatbotMessageInput from './ChatbotMessageInput';
import ChatbotMessageList from './ChatbotMessageList';

export interface ChatMessage {
  id: string;
  content: string | CuratorResponse;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'recipe';
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
    <section className="bg-base-100 flex h-full w-full flex-col select-text">
      {/* Header */}
      <ChatbotHeader />

      {/* Messages */}
      <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-6">
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
