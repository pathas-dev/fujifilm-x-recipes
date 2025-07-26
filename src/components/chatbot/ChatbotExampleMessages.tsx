"use client";

import { useChatMessages } from "@/components/chatbot/useChatMessages";
import useCameraStore from "@/stores/camera";
import { useChatStore } from "@/stores/chat";
import { useTranslations } from "next-intl";
import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

const ChatbotExampleMessages = memo(() => {
  const t = useTranslations("Chatbot");
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
      key: "winter",
      message: t("examples.winter"),
      icon: "❄️",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      key: "cinematic",
      message: t("examples.cinematic"),
      icon: "🎬",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      key: "summer",
      message: t("examples.summer"),
      icon: "☀️",
      gradient: "from-green-400 to-teal-500",
    },
    {
      key: "blackWhite",
      message: t("examples.blackWhite"),
      icon: "🎞️",
      gradient: "from-black to-white",
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
    <div className="flex-1 flex flex-col items-center justify-center space-y-3 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col space-y-2 max-w-md w-full">
        {examples.map((example) => (
          <button
            key={example.key}
            onClick={() => handleExampleClick(example)}
            className="text-left p-4 bg-base-200/50 hover:bg-base-200 border border-base-300 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 bg-gradient-to-br ${example.gradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}
              >
                {example.icon}
              </div>
              <span className="text-sm text-base-content group-hover:text-primary transition-colors">
                {example.message}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

ChatbotExampleMessages.displayName = "ExampleMessages";

export default ChatbotExampleMessages;
