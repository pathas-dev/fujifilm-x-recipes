import { CuratorResponse } from "@/types/recipe-schema";
import CuratedRecipeCard from "./CuratedRecipeCard";

interface RecipeResponseProps {
  data: CuratorResponse;
}

const ChatbotCuratedRecipeResponse = ({ data }: RecipeResponseProps) => {
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
