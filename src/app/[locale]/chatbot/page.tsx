import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeIntl } from "@/i18n/navigation";
import ChatbotClient from "@/components/chatbot/ChatbotClient";

export default async function ChatbotPage(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("Chatbot");

  const messages = {
    title: t("title"),
    placeholder: t("placeholder"),
    send: t("send"),
    thinking: t("thinking"),
    error: t("error"),
    welcome: t("welcome"),
  };

  return <ChatbotClient messages={messages} />;
}
