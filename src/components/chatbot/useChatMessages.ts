import { AgentStep } from '@/app/api/chatbot/agent';
import { ChatMessage } from '@/components/chatbot/ChatbotClient';
import { useChatStore } from '@/stores/chat';
import { CameraModel } from '@/types/camera-schema';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useChatMessages = (): {
  sendMessage: (params: {
    cameraModel: CameraModel;
    message: string;
  }) => Promise<void>;
} => {
  const t = useTranslations('Chatbot');

  const {
    isLoading,
    addMessage,
    setLoading,
    setLoadingMessage,
    initializeWelcomeMessage,
  } = useChatStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      addMessage: state.addMessage,
      setLoading: state.setLoading,
      setLoadingMessage: state.setLoadingMessage,
      initializeWelcomeMessage: state.initializeWelcomeMessage,
    }))
  );

  // 컴포넌트 마운트 시 웰컴 메시지 초기화
  useEffect(() => {
    initializeWelcomeMessage(t('welcome'));
    setLoadingMessage(t('loadings.placeholder'));
  }, [t, initializeWelcomeMessage, setLoadingMessage]);

  const sendMessage = useCallback(
    async ({
      cameraModel,
      message,
    }: {
      message: string;
      cameraModel: CameraModel;
    }) => {
      if (!message.trim() || !cameraModel || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setLoading(true);

      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: message,
            cameraModel,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';
        let currentEvent: 'state' | '' | AgentStep = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.substring(7).trim() as AgentStep | 'state';

              // 상태별 로딩 메시지 업데이트
            } else if (line.startsWith('data: ')) {
              const dataContent = line.substring(6);

              try {
                const eventData = JSON.parse(dataContent);

                switch (currentEvent) {
                  case 'completed':
                    if (typeof eventData === 'string') {
                      const botMessage: ChatMessage = {
                        id: (Date.now() + 2).toString(),
                        content: eventData,
                        isUser: false,
                        timestamp: new Date(),
                        type: 'text',
                      };
                      return addMessage(botMessage);
                    }
                    const botMessage: ChatMessage = {
                      id: (Date.now() + 2).toString(),
                      content: eventData,
                      isUser: false,
                      timestamp: new Date(),
                      type: 'recipe',
                      cameraModel,
                    };
                    return addMessage(botMessage);
                  case 'error':
                    // 서버에서 보낸 에러 메시지를 사용자에게 표시
                    const serverErrorMessage = eventData.error || t('error');
                    const errorBotMessage: ChatMessage = {
                      id: (Date.now() + 2).toString(),
                      content: serverErrorMessage,
                      isUser: false,
                      timestamp: new Date(),
                      type: 'text',
                    };
                    addMessage(errorBotMessage);
                    setLoading(false);
                    return;
                  default:
                    const stateMessages = {
                      analyzing: t('loadings.analyzing'),
                      searching: t('loadings.searching'),
                      generating: t('loadings.generating'),
                      processing: t('loadings.processing'),
                    };

                    const currentStateMessage =
                      stateMessages[
                        eventData.step as keyof typeof stateMessages
                      ] || t('loadings.placeholder');

                    setLoadingMessage(currentStateMessage);
                    break;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Chatbot error:', error);

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: t('error'),
          isUser: false,
          timestamp: new Date(),
          type: 'text',
        };
        addMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isLoading, t, addMessage, setLoading, setLoadingMessage]
  );

  return {
    sendMessage,
  };
};
