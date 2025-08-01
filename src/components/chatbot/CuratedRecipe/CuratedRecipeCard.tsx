import { GeneratedByAIRecipe, RetrievedRecipe } from '@/types/recipe-schema';
import { useTranslations } from 'next-intl';
import CuratedImageComparisonSlider from './CuratedImageComparisonSlider';
import CuratedRecipeSettingItem from './CuratedRecipeSettingItem';
import RecipeUrlPreview from './CuratedRecipeUrlPreview';

interface CuratedRecipeCardProps {
  recipe: RetrievedRecipe | GeneratedByAIRecipe;
  type: 'retrieved' | 'generated';
}

const CuratedRecipeCard = ({ recipe, type }: CuratedRecipeCardProps) => {
  const t = useTranslations('Chatbot');
  const isGenerated = type === 'generated';

  return (
    <div className="bg-base-100 border-base-300 rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 min-w-10 items-center justify-center rounded-lg text-lg text-white ${
              isGenerated
                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}
          >
            {isGenerated ? '🤖' : '📸'}
          </div>
          <div>
            <h3 className="text-base-content text-sm font-bold">
              {recipe.title}
            </h3>
            <p className="text-base-content/70 text-sm">
              {isGenerated
                ? t('curatedRecipe.aiGeneratedRecipe')
                : t('curatedRecipe.recommendedRecipe')}
            </p>
          </div>
        </div>
      </div>

      {/* Base Film Simulation */}
      <div className="bg-base-200 mb-4 rounded-lg p-3">
        <div className="text-base-content/80 mb-1 text-sm font-medium">
          {t('curatedRecipe.baseFilmSimulation')}
        </div>
        <div className="text-primary font-bold">
          {recipe.baseFilmSimulation}
        </div>
      </div>

      {/* Tags */}
      {recipe.keywords && recipe.keywords.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {recipe.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* Recommendation Reason */}
      <div className="mb-6">
        <div className="text-base-content/80 mb-2 text-sm font-medium">
          {t('curatedRecipe.recommendationReason')}
        </div>
        <p className="text-base-content text-sm leading-relaxed">
          {recipe.recommendationReason}
        </p>
      </div>

      {/* Recipe URL Preview for Retrieved Recipe */}
      {!isGenerated && 'url' in recipe && recipe.url && (
        <RecipeUrlPreview url={recipe.url} />
      )}

      {/* Image Comparison Slider for Generated Recipe */}
      {isGenerated &&
        'sourceImage' in recipe &&
        'retouchedImage' in recipe &&
        recipe.sourceImage &&
        recipe.retouchedImage && (
          <CuratedImageComparisonSlider
            beforeImage={recipe.sourceImage}
            afterImage={recipe.retouchedImage}
          />
        )}

      {/* Camera Settings */}
      <div>
        <div className="text-base-content/80 mb-3 text-sm font-medium">
          {t('curatedRecipe.cameraSettings')}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.filmSimulation')}
              value={recipe.settings.filmSimulation}
            />
            <CuratedRecipeSettingItem label="ISO" value={recipe.settings.iso} />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.exposure')}
              value={recipe.settings.exposure}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.dynamicRange')}
              value={recipe.settings.dynamicRange}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.priority')}
              value={recipe.settings.priority}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.whiteBalance')}
              value={`${recipe.settings.whiteBalance} (R: ${recipe.settings.shiftRed}, B: ${recipe.settings.shiftBlue})`}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.highlight')}
              value={recipe.settings.highlight}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.shadow')}
              value={recipe.settings.shadow}
            />
          </div>
          <div className="space-y-2">
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.color')}
              value={recipe.settings.color}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.sharpness')}
              value={recipe.settings.sharpness}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.clarity')}
              value={recipe.settings.clarity}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.noiseReduction')}
              value={recipe.settings.noiseReduction}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.grainEffect')}
              value={recipe.settings.grainEffect}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.grainSize')}
              value={recipe.settings.grainSize}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.colourChromeFXBlue')}
              value={recipe.settings.colourChromeFXBlue}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.colourChrome')}
              value={recipe.settings.colourChrome}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedRecipeCard;
