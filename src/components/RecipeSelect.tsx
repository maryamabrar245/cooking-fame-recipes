import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { RECIPES } from '../data/recipes';
import { Recipe, RecipeId } from '../types/game';
import { ChefCoco } from './ChefCoco';
import { DishImage } from './DishImage';

interface RecipeSelectProps {
  onSelectRecipe: (recipe: Recipe) => void;
  bestStars: Partial<Record<RecipeId, number>>;
}

export const RecipeSelect: React.FC<RecipeSelectProps> = ({
  onSelectRecipe,
  bestStars,
}) => {
  const completedCount = Object.values(bestStars).filter((s) => (s ?? 0) > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-pop-in">
      {/* Header + Coco Prompt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-sm font-semibold text-rose-600 mb-1">
            Menu Board · {completedCount} of {RECIPES.length} dishes mastered
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2D221E] tracking-tight [text-wrap:balance]">
            What are we making today?
          </h1>
          <p className="text-stone-600 mt-1.5 text-sm sm:text-base max-w-xl">
            Choose a recipe card below to gather ingredients and cook together step-by-step.
          </p>
        </div>

        <div className="shrink-0">
          <ChefCoco
            mood="happy"
            size="sm"
            dialogue="Every dish has 4 fun kitchen steps. Pick whichever craving wins!"
          />
        </div>
      </div>

      {/* 4 Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {RECIPES.map((recipe) => {
          const stars = bestStars[recipe.id] ?? 0;

          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelectRecipe(recipe)}
              className="group text-left kitchen-panel rounded-3xl hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden flex flex-col focus-visible:outline-2 focus-visible:outline-rose-600 cursor-pointer"
            >
              {/* Dish Illustration */}
              <div
                className="relative aspect-square w-full overflow-hidden"
                style={{ backgroundColor: recipe.themeBg }}
              >
                <DishImage
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fallbackTitle={recipe.title}
                  fallbackBg={recipe.themeBg}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-medium mb-1.5">
                    <span>
                      {recipe.category} · {recipe.prepTime}
                    </span>
                    {stars > 0 && (
                      <span
                        className="flex items-center gap-0.5 text-amber-500 font-bold tabular-nums"
                        aria-label={`${stars} out of 3 stars earned`}
                      >
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= stars ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display font-bold text-xl text-[#2D221E] leading-snug">
                    {recipe.title}
                  </h2>

                  <p className="mt-1.5 text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {recipe.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-rose-600">
                  <span>Cook Recipe</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
