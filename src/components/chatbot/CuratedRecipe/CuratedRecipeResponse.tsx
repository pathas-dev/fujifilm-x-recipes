import { CuratorResponse } from "@/types/recipe-schema";
import { useTranslations } from "next-intl";
import CuratedRecipeCard from "./CuratedRecipeCard";

interface RecipeResponseProps {
  data: CuratorResponse;
}

const ChatbotCuratedRecipeResponse = ({ data }: RecipeResponseProps) => {
  if (typeof data !== "object" || !data.recipes) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.recipes.retrieved && (
        <CuratedRecipeCard recipe={data.recipes.retrieved} type="retrieved" />
      )}
      {data.recipes.generated && (
        <CuratedRecipeCard recipe={data.recipes.generated} type="generated" />
      )}
    </div>
  );
};

export default ChatbotCuratedRecipeResponse;
