import { CameraModel } from '@/types/camera-schema';
import { CuratorResponse } from '@/types/recipe-schema';
import CuratedRecipeCard from './CuratedRecipeCard';

interface RecipeResponseProps {
  data: CuratorResponse;
  cameraModel?: CameraModel;
}

const ChatbotCuratedRecipeResponse = ({
  data,
  cameraModel,
}: RecipeResponseProps) => {
  if (typeof data !== 'object' || !data.recipes) {
    return null;
  }

  return (
    <div className="space-y-4">
      {cameraModel && (
        <div className="mb-2 flex justify-end">
          <div className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-xs font-medium">
            {cameraModel}
          </div>
        </div>
      )}

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
