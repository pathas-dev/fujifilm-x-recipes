"use client";

import { useEffect, useState } from "react";

interface LoadingIndicatorProps {
  messages: {
    thinking: string;
    thinkingDeeply: string;
    preparing: string;
    waiting: string;
    seconds: string;
  };
}

export default function LoadingIndicator({ messages }: LoadingIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const startTime = Date.now();

    // 시간 업데이트 (0.1초 단위)
    const timeInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }, 100);

    // 점 애니메이션 (0.5초 단위)
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const getThinkingMessage = () => {
    if (elapsedTime < 3) return messages.thinking;
    if (elapsedTime < 6) return messages.thinkingDeeply;
    if (elapsedTime < 10) return messages.preparing;
    return messages.waiting;
  };

  return (
    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-base-200 text-base-content px-5 py-4 rounded-2xl rounded-bl-md border border-base-300 shadow-sm message-glow bot-message-glow">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="loading loading-dots loading-sm text-primary"></span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-base-content/70">
              {getThinkingMessage()}
              {dots}
            </span>
            <span className="text-xs text-base-content/50 mt-1">
              {elapsedTime.toFixed(1)}
              {messages.seconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
