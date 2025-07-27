import { setRequestLocale } from 'next-intl/server';
import { localeIntl } from '@/i18n/navigation';
import ChatbotClient from '@/components/chatbot/ChatbotClient';
import { NextIntlClientProvider } from 'next-intl';

export default async function ChatbotPage(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;
  const { locale } = params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ChatbotClient />
    </NextIntlClientProvider>
  );
}
