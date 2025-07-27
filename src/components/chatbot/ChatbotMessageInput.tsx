'use client';

import { useChatMessages } from '@/components/chatbot/useChatMessages';
import { SvgAirplaneOutline } from '@/components/icon/svgs';
import useCameraStore from '@/stores/camera';
import { useChatStore } from '@/stores/chat';
import { CAMERA_MODELS, CameraModel } from '@/types/camera-schema';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useState } from 'react';

const ChatbotMessageInput = memo(() => {
  const { sendMessage } = useChatMessages();
  const t = useTranslations('Chatbot');
  const [message, setMessage] = useState('');
  const isLoading = useChatStore((state) => state.isLoading);
  const { cameraModel, setCameraModel } = useCameraStore();

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !cameraModel || isLoading) return;

    sendMessage({ message, cameraModel });
    setMessage('');
  }, [message, cameraModel, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleCameraChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCameraModel(e.target.value as CameraModel);
    },
    [setCameraModel]
  );

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  return (
    <div className="border-base-300 bg-base-50 border-t p-3">
      <div className="mx-auto max-w-4xl space-y-1">
        {/* Camera Selection - 모바일에서만 상단에 표시 */}
        <select
          value={cameraModel}
          onChange={handleCameraChange}
          className="select select-xs bg-base-100 border-base-300 focus:border-primary w-full border text-xs focus:outline-none sm:hidden"
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
            onChange={handleCameraChange}
            className="join-item select bg-base-100 border-base-300 focus:border-primary hidden min-h-12 w-28 rounded-sm text-xs focus:outline-none sm:flex"
            disabled={isLoading}
          >
            {CAMERA_MODELS.toSorted().map((camera) => (
              <option key={camera} value={camera}>
                {camera}
              </option>
            ))}
          </select>

          {/* Message Input */}
          <div className="join-item relative flex-1">
            <textarea
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="textarea bg-base-100 border-base-300 focus:border-primary max-h-32 min-h-12 w-full resize-none px-4 py-3 pr-12 focus:outline-none"
              disabled={isLoading}
              rows={1}
              autoFocus
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="btn btn-primary btn-sm btn-square absolute top-1/2 right-2 -translate-y-1/2"
              title={t('send')}
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
  );
});

ChatbotMessageInput.displayName = 'MessageInput';

export default ChatbotMessageInput;
