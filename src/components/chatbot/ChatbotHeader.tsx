import { useTranslations } from 'next-intl';
import { memo } from 'react';
import ChatbotHistory from './ChatbotHistory';

const ChatbotHeader = memo(function ChatbotHeader() {
  const t = useTranslations('Chatbot');

  return (
    <div className="border-base-300 bg-base-50/50 relative flex items-center justify-center border-b p-6 backdrop-blur-sm select-none">
      <div className="flex items-center space-x-3">
        <div className="from-primary to-secondary group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-md">
          <div className="from-primary/20 to-secondary/20 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h1 className="from-primary to-secondary inline-block bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
            {t('title')}
          </h1>
          <p className="text-base-content/70 text-xs">{t('subTitle')}</p>
        </div>
      </div>

      <div className="absolute right-5">
        <ChatbotHistory />
      </div>
    </div>
  );
});

export default ChatbotHeader;
