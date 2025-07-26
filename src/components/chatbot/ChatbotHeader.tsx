import { SvgAiCurator } from "@/components/icon/svgs";
import { useTranslations } from "next-intl";
import { memo } from "react";

const ChatbotHeader = memo(function ChatbotHeader() {
  const t = useTranslations("Chatbot");

  return (
    <div className="flex items-center justify-center p-6 border-b border-base-300 bg-base-50/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <SvgAiCurator />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">
            {t("title")}
          </h1>
          <p className="text-xs text-base-content/70">{t("subTitle")}</p>
        </div>
      </div>
    </div>
  );
});

export default ChatbotHeader;
