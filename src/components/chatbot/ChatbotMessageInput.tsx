"use client";

import { SvgAirplaneOutline } from "@/components/icon/svgs";
import { CAMERA_MODELS, CameraModel } from "@/types/camera-schema";
import { memo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import useCameraStore from "@/stores/camera";

interface ChatbotMessageInputProps {
  onSendMessage: (params: {
    message: string;
    cameraModel: CameraModel;
  }) => void;
  isLoading: boolean;
}

const ChatbotMessageInput = memo<ChatbotMessageInputProps>(
  ({ onSendMessage, isLoading }) => {
    const t = useTranslations("Chatbot");
    const [message, setMessage] = useState("");
    const { cameraModel, setCameraModel } = useCameraStore();

    const handleSendMessage = useCallback(() => {
      if (!message.trim() || !cameraModel || isLoading) return;

      onSendMessage({ message, cameraModel });
      setMessage("");
    }, [message, cameraModel, isLoading, onSendMessage]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
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
      <div className="p-3 border-t border-base-300 bg-base-50">
        <div className="max-w-4xl mx-auto space-y-1">
          {/* Camera Selection - 모바일에서만 상단에 표시 */}
          <select
            value={cameraModel}
            onChange={handleCameraChange}
            className="select select-xs w-full sm:hidden bg-base-100 border border-base-300 focus:border-primary text-xs focus:outline-none"
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
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder={t("placeholder")}
                className="textarea w-full resize-none min-h-12 max-h-32 bg-base-100 border-base-300 focus:border-primary focus:outline-none px-4 py-3 pr-12"
                disabled={isLoading}
                rows={1}
                autoFocus
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm btn-square"
                title={t("send")}
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
  }
);

ChatbotMessageInput.displayName = "MessageInput";

export default ChatbotMessageInput;
