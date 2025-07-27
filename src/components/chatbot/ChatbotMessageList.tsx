'use client';

import { useChatStore } from '@/stores/chat';
import { CuratorResponse } from '@/types/recipe-schema';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import ChatbotCuratedRecipeResponse from './CuratedRecipe/CuratedRecipeResponse';
import { useShallow } from 'zustand/react/shallow';

const ChatbotMessageList = memo(() => {
  const messages = useChatStore(useShallow((state) => state.messages));

  return (
    <>
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${
            message.isUser ? 'justify-end' : 'justify-start'
          } animate-in slide-in-from-bottom-2 duration-300`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {message.isUser ? (
            <div
              className="message-glow bg-primary text-primary-content user-message-glow max-w-xs rounded-2xl rounded-br-md px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md md:max-w-md lg:max-w-2xl"
              style={
                {
                  '--glow-delay': `${index * 0.8}s`,
                } as React.CSSProperties
              }
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content as string}
              </p>
            </div>
          ) : message.type === 'recipe' ? (
            <div className="message-glow bg-base-200 text-base-content border-base-300 bot-message-glow max-w-xl rounded-2xl rounded-bl-md border px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md md:max-w-2xl lg:max-w-4xl">
              <ChatbotCuratedRecipeResponse
                data={message.content as CuratorResponse}
              />
            </div>
          ) : (
            <div
              className="message-glow bg-base-200 text-base-content border-base-300 bot-message-glow max-w-xs rounded-2xl rounded-bl-md border px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md md:max-w-md lg:max-w-2xl"
              style={
                {
                  '--glow-delay': `${index * 0.8}s`,
                } as React.CSSProperties
              }
            >
              <div className="text-base-content text-sm">
                <ReactMarkdown>{message.content as string}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
});

ChatbotMessageList.displayName = 'MessageList';

export default ChatbotMessageList;
