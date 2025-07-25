import { CuratorResponse } from "@/types/recipe-schema";
import CuratedRecipeCard from "./CuratedRecipeCard";

interface RecipeResponseProps {
  data: CuratorResponse;
  messages: {
    aiCustomRecipe: string;
    recommendedRecipe: string;
    baseFilmSimulation: string;
    recommendationReason: string;
    cameraSettings: string;
    filmSimulation: string;
    dynamicRange: string;
    whiteBalance: string;
    highlight: string;
    shadow: string;
    color: string;
    clarity: string;
    noiseReduction: string;
    grainEffect: string;
    grainSize: string;
    colourChrome: string;
    colourChromeFXBlue: string;
    priority: string;
  };
  imageComparisonSliderMessages: {
    title: string;
    source: string;
    retouched: string;
  };
  curatedRecipeUrlPreviewMessages: {
    title: string;
    loading: string;
    link: string;
  };
}

const ChatbotCuratedRecipeResponse = ({
  data,
  messages,
  imageComparisonSliderMessages,
  curatedRecipeUrlPreviewMessages,
}: RecipeResponseProps) => {
  if (typeof data !== "object" || !data.recipes) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.recipes.retrieved && (
        <CuratedRecipeCard
          recipe={data.recipes.retrieved}
          type="retrieved"
          messages={messages}
          curatedRecipeUrlPreviewMessages={curatedRecipeUrlPreviewMessages}
        />
      )}
      {data.recipes.generated && (
        <CuratedRecipeCard
          recipe={data.recipes.generated}
          type="generated"
          messages={messages}
          imageComparisonSliderMessages={imageComparisonSliderMessages}
        />
      )}
    </div>
  );
};

export default ChatbotCuratedRecipeResponse;
