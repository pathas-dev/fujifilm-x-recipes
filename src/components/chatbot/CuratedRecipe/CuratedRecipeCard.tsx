import CuratedImageComparisonSlider from "./CuratedImageComparisonSlider";
import RecipeUrlPreview from "./CuratedRecipeUrlPreview";
import CuratedRecipeSettingItem from "./CuratedRecipeSettingItem";
import { GeneratedByAIRecipe, RetrievedRecipe } from "@/types/recipe-schema";
import { useTranslations } from "next-intl";

interface CuratedRecipeCardProps {
  recipe: RetrievedRecipe | GeneratedByAIRecipe;
  type: "retrieved" | "generated";
}

const CuratedRecipeCard = ({ recipe, type }: CuratedRecipeCardProps) => {
  const t = useTranslations("Chatbot");
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
                ? t("curatedRecipe.aiCustomRecipe")
                : t("curatedRecipe.recommendedRecipe")}
            </p>
          </div>
        </div>
      </div>

      {/* Base Film Simulation */}
      <div className="mb-4 p-3 bg-base-200 rounded-lg">
        <div className="text-sm font-medium text-base-content/80 mb-1">
          {t("curatedRecipe.baseFilmSimulation")}
        </div>
        <div className="font-bold text-primary">
          {recipe.baseFilmSimulation}
        </div>
      </div>

      {/* Recommendation Reason */}
      <div className="mb-6">
        <div className="text-sm font-medium text-base-content/80 mb-2">
          {t("curatedRecipe.recommendationReason")}
        </div>
        <p className="text-sm text-base-content leading-relaxed">
          {recipe.recommendationReason}
        </p>
      </div>

      {/* Recipe URL Preview for Retrieved Recipe */}
      {!isGenerated && "url" in recipe && recipe.url && (
        <RecipeUrlPreview url={recipe.url} />
      )}

      {/* Image Comparison Slider for Generated Recipe */}
      {isGenerated &&
        "sourceImage" in recipe &&
        "retouchedImage" in recipe &&
        recipe.sourceImage &&
        recipe.retouchedImage && (
          <CuratedImageComparisonSlider
            beforeImage={recipe.sourceImage}
            afterImage={recipe.retouchedImage}
          />
        )}

      {/* Camera Settings */}
      <div>
        <div className="text-sm font-medium text-base-content/80 mb-3">
          {t("curatedRecipe.cameraSettings")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.filmSimulation")}
              value={recipe.settings.filmSimulation}
            />
            <CuratedRecipeSettingItem label="ISO" value={recipe.settings.iso} />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.exposure")}
              value={recipe.settings.exposure}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.dynamicRange")}
              value={recipe.settings.dynamicRange}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.priority")}
              value={recipe.settings.priority}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.whiteBalance")}
              value={`${recipe.settings.whiteBalance} (R: ${recipe.settings.shiftRed}, B: ${recipe.settings.shiftBlue})`}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.highlight")}
              value={recipe.settings.highlight}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.shadow")}
              value={recipe.settings.shadow}
            />
          </div>
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.color")}
              value={recipe.settings.color}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.sharpness")}
              value={recipe.settings.sharpness}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.clarity")}
              value={recipe.settings.clarity}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.noiseReduction")}
              value={recipe.settings.noiseReduction}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.grainEffect")}
              value={recipe.settings.grainEffect}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.grainSize")}
              value={recipe.settings.grainSize}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.colourChromeFXBlue")}
              value={recipe.settings.colourChromeFXBlue}
            />
            <CuratedRecipeSettingItem
              label={t("curatedRecipe.colourChrome")}
              value={recipe.settings.colourChrome}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedRecipeCard;
