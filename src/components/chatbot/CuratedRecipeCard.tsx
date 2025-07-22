import ImageComparisonSlider from "./ImageComparisonSlider";
import RecipeUrlPreview from "./CuratedRecipeUrlPreview";
import CuratedRecipeSettingItem from "./CuratedRecipeSettingItem";

interface CuratedRecipeCardProps {
  recipe: any;
  type: "retrieved" | "generated";
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
  };
  imageComparisonSliderMessages?: {
    title: string;
    source: string;
    retouched: string;
  };
  curatedRecipeUrlPreviewMessages?: {
    title: string;
    loading: string;
    link: string;
  };
}

const CuratedRecipeCard = ({
  recipe,
  type,
  messages,
  imageComparisonSliderMessages,
  curatedRecipeUrlPreviewMessages,
}: CuratedRecipeCardProps) => {
  const isGenerated = type === "generated";

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${
              isGenerated
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "bg-gradient-to-br from-blue-500 to-cyan-500"
            }`}
          >
            {isGenerated ? "🤖" : "📸"}
          </div>
          <div>
            <h3 className="font-bold text-base-content">{recipe.title}</h3>
            <p className="text-sm text-base-content/70">
              {isGenerated
                ? messages.aiCustomRecipe
                : messages.recommendedRecipe}
            </p>
          </div>
        </div>
      </div>

      {/* Base Film Simulation */}
      <div className="mb-4 p-3 bg-base-200 rounded-lg">
        <div className="text-sm font-medium text-base-content/80 mb-1">
          {messages.baseFilmSimulation}
        </div>
        <div className="font-bold text-primary">
          {recipe.baseFilmSimulation}
        </div>
      </div>

      {/* Recommendation Reason */}
      <div className="mb-6">
        <div className="text-sm font-medium text-base-content/80 mb-2">
          {messages.recommendationReason}
        </div>
        <p className="text-sm text-base-content leading-relaxed">
          {recipe.recommendationReason}
        </p>
      </div>

      {/* Recipe URL Preview for Retrieved Recipe */}
      {!isGenerated && recipe.url && (
        <RecipeUrlPreview
          url={recipe.url}
          messages={curatedRecipeUrlPreviewMessages}
        />
      )}

      {/* Image Comparison Slider for Generated Recipe */}
      {isGenerated && recipe.sourceImage && recipe.retouchedImage && (
        <ImageComparisonSlider
          beforeImage={recipe.sourceImage}
          afterImage={recipe.retouchedImage}
          messages={imageComparisonSliderMessages}
        />
      )}

      {/* Camera Settings */}
      <div>
        <div className="text-sm font-medium text-base-content/80 mb-3">
          {messages.cameraSettings}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={messages.filmSimulation}
              value={recipe.settings.filmSimulation}
            />
            <CuratedRecipeSettingItem
              label={messages.dynamicRange}
              value={recipe.settings.dynamicRange}
            />
            <CuratedRecipeSettingItem
              label={messages.whiteBalance}
              value={`${recipe.settings.whiteBalance} (R: ${recipe.settings.shiftRed}, B: ${recipe.settings.shiftBlue})`}
            />
            <CuratedRecipeSettingItem
              label={messages.highlight}
              value={recipe.settings.highlight}
            />
            <CuratedRecipeSettingItem
              label={messages.shadow}
              value={recipe.settings.shadow}
            />
          </div>
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={messages.color}
              value={recipe.settings.color}
            />
            <CuratedRecipeSettingItem
              label={messages.clarity}
              value={recipe.settings.clarity}
            />
            <CuratedRecipeSettingItem
              label={messages.noiseReduction}
              value={recipe.settings.noiseReduction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedRecipeCard;
