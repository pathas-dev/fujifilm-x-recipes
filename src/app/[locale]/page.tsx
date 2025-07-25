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
    subTitle: t("subTitle"),
    placeholder: t("placeholder"),
    send: t("send"),
    error: t("error"),
    welcome: t("welcome"),
    examples: {
      winter: t("examples.winter"),
      cinematic: t("examples.cinematic"),
      summer: t("examples.summer"),
      blackWhite: t("examples.blackWhite"),
    },
    loadings: {
      placeholder: t("loadings.placeholder"),
      analyzing: t("loadings.analyzing"),
      searching: t("loadings.searching"),
      generating: t("loadings.generating"),
      processing: t("loadings.processing"),
      completed: t("loadings.completed"),
      seconds: t("loadings.seconds"),
    },
    curatedRecipe: {
      aiCustomRecipe: t("curatedRecipe.aiCustomRecipe"),
      recommendedRecipe: t("curatedRecipe.recommendedRecipe"),
      baseFilmSimulation: t("curatedRecipe.baseFilmSimulation"),
      recommendationReason: t("curatedRecipe.recommendationReason"),
      cameraSettings: t("curatedRecipe.cameraSettings"),
      filmSimulation: t("curatedRecipe.filmSimulation"),
      dynamicRange: t("curatedRecipe.dynamicRange"),
      whiteBalance: t("curatedRecipe.whiteBalance"),
      highlight: t("curatedRecipe.highlight"),
      shadow: t("curatedRecipe.shadow"),
      color: t("curatedRecipe.color"),
      clarity: t("curatedRecipe.clarity"),
      noiseReduction: t("curatedRecipe.noiseReduction"),
      grainEffect: t("curatedRecipe.grainEffect"),
      grainSize: t("curatedRecipe.grainSize"),
      colourChrome: t("curatedRecipe.colourChrome"),
      colourChromeFXBlue: t("curatedRecipe.colourChromeFXBlue"),
      priority: t("curatedRecipe.priority"),
    },
    imageComparisonSlider: {
      title: t("imageComparisonSlider.title"),
      source: t("imageComparisonSlider.source"),
      retouched: t("imageComparisonSlider.retouched"),
    },
    curatedRecipeUrlPreview: {
      title: t("curatedRecipeUrlPreview.title"),
      loading: t("curatedRecipeUrlPreview.loading"),
      link: t("curatedRecipeUrlPreview.link"),
    },
  };

  return <ChatbotClient messages={messages} />;
}
