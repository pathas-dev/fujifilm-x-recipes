import CuratedImageComparisonSlider from './CuratedImageComparisonSlider';
import RecipeUrlPreview from './CuratedRecipeUrlPreview';
import CuratedRecipeSettingItem from './CuratedRecipeSettingItem';
import { GeneratedByAIRecipe, RetrievedRecipe } from '@/types/recipe-schema';
import { useTranslations } from 'next-intl';

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
            <h3 className="text-base-content text-sm font-bold">{recipe.title}</h3>
            <p className="text-base-content/70 text-sm">
              {isGenerated
                ? t('curatedRecipe.aiCustomRecipe')
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
            <CuratedRecipeSettingItem 
              label="ISO" 
              value={typeof recipe.settings.iso === 'string' ? recipe.settings.iso : `${recipe.settings.iso.value}`} 
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.exposure')}
              value={typeof recipe.settings.exposure === 'string' ? recipe.settings.exposure : `${recipe.settings.exposure}`}
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
              value={`${recipe.settings.whiteBalance.type} (R: ${recipe.settings.whiteBalance.shift.red}, B: ${recipe.settings.whiteBalance.shift.blue})`}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.highlight')}
              value={recipe.settings.tone.highlight}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.shadow')}
              value={recipe.settings.tone.shadow}
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
              value={recipe.settings.grain.effect}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.grainSize')}
              value={recipe.settings.grain.size}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.colourChromeFXBlue')}
              value={recipe.settings.colorChrome.fxBlue}
            />
            <CuratedRecipeSettingItem
              label={t('curatedRecipe.colourChrome')}
              value={recipe.settings.colorChrome.effect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedRecipeCard;
