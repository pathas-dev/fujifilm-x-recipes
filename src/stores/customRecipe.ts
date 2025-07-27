import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomRecipe } from '@/components/custom/customRecipe';
import { produce } from 'immer';
import _reject from 'lodash/reject';

type CustomRecipeStore = {
  customRecipes: CustomRecipe[];
  addRecipe: (recipe: CustomRecipe) => void;
  updateRecipe: (recipe: CustomRecipe) => void;
  deleteRecipe: (recipe: CustomRecipe) => void;
  setRecipes: (recipes: CustomRecipe[]) => void;
  clearRecipes: () => void;
};

const useCustomRecipeStore = create<CustomRecipeStore>()(
  persist(
    (set) => ({
      customRecipes: [],

      addRecipe: (recipe: CustomRecipe) => {
        set((state) => ({
          customRecipes: [recipe, ...state.customRecipes],
        }));
      },

      updateRecipe: (recipe: CustomRecipe) => {
        set((state) => ({
          customRecipes: produce(state.customRecipes, (draft) => {
            const index = draft.findIndex((value) => value._id === recipe._id);
            if (index !== -1) {
              draft[index] = recipe;
            }
            return draft;
          }),
        }));
      },

      deleteRecipe: (recipe: CustomRecipe) => {
        set((state) => ({
          customRecipes: _reject(state.customRecipes, recipe),
        }));
      },

      setRecipes: (recipes: CustomRecipe[]) => {
        set({ customRecipes: recipes });
      },

      clearRecipes: () => {
        set({ customRecipes: [] });
      },
    }),
    {
      name: 'custom-recipes-storage',
    }
  )
);

export default useCustomRecipeStore;
