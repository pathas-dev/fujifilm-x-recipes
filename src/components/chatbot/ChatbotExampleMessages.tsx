'use client';

import { useChatMessages } from '@/components/chatbot/useChatMessages';
import useCameraStore from '@/stores/camera';
import { useChatStore } from '@/stores/chat';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

const ChatbotExampleMessages = memo(() => {
  const t = useTranslations('Chatbot');
  const { sendMessage } = useChatMessages();
  const { isLoading, hasAIResponses } = useChatStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      hasAIResponses: state.hasAIResponses,
    }))
  );
  const cameraModel = useCameraStore(useShallow((state) => state.cameraModel));

  const examples = [
    {
      key: 'winter',
      message: t('examples.winter'),
      icon: '❄️',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      key: 'cinematic',
      message: t('examples.cinematic'),
      icon: '🎬',
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      key: 'summer',
      message: t('examples.summer'),
      icon: '☀️',
      gradient: 'from-green-400 to-teal-500',
    },
    {
      key: 'blackWhite',
      message: t('examples.blackWhite'),
      icon: '🎞️',
      gradient: 'from-black to-white',
    },
  ];

  const handleExampleClick = useCallback(
    (example: (typeof examples)[0]) => {
      sendMessage({
        message: example.message,
        cameraModel,
      });
    },
    [sendMessage, cameraModel]
  );

  if (hasAIResponses || isLoading) return null;

  return (
    <div className="animate-in slide-in-from-bottom-2 flex flex-1 flex-col items-center justify-center space-y-3 duration-500">
      <div className="flex w-full max-w-md flex-col space-y-2">
        {examples.map((example) => (
          <button
            key={example.key}
            onClick={() => handleExampleClick(example)}
            className="bg-base-200/50 hover:bg-base-200 border-base-300 group cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`h-8 w-8 bg-gradient-to-br ${example.gradient} flex items-center justify-center rounded-lg text-sm font-bold text-white`}
              >
                {example.icon}
              </div>
              <span className="text-base-content group-hover:text-primary text-sm transition-colors">
                {example.message}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

ChatbotExampleMessages.displayName = 'ExampleMessages';

export default ChatbotExampleMessages;
