import React, { useEffect } from 'react';
import { LayoutGrid, RotateCcw, Star } from 'lucide-react';
import { Recipe, RoundPerformance } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';
import { DishImage } from './DishImage';

interface ResultScreenProps {
  recipe: Recipe;
  performance: RoundPerformance;
  onPlayAgain: () => void;
  onChooseAnother: () => void;
}

const CONFETTI_PIECES = [
  { left: '8%', delay: '0s', color: '#FB7185' },
  { left: '18%', delay: '0.15s', color: '#FBBF24' },
  { left: '29%', delay: '0.08s', color: '#34D399' },
  { left: '42%', delay: '0.22s', color: '#60A5FA' },
  { left: '56%', delay: '0.05s', color: '#F472B6' },
  { left: '68%', delay: '0.18s', color: '#F59E0B' },
  { left: '81%', delay: '0.1s', color: '#10B981' },
  { left: '91%', delay: '0.24s', color: '#E11D48' },
];

export const ResultScreen: React.FC<ResultScreenProps> = ({
  recipe,
  performance,
  onPlayAgain,
  onChooseAnother,
}) => {
  useEffect(() => {
    soundFX.playVictory();
  }, []);

  const praiseLine =
    performance.stars === 3
      ? recipe.resultPraise.threeStars
      : performance.stars === 2
        ? recipe.resultPraise.twoStars
        : recipe.resultPraise.oneStar;

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 overflow-hidden animate-pop-in">
      {/* Subtle Celebration Confetti */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden" aria-hidden="true">
        {CONFETTI_PIECES.map((c, idx) => (
          <span
            key={idx}
            className="animate-confetti absolute top-0 w-3 h-3 rounded-sm"
            style={{
              left: c.left,
              animationDelay: c.delay,
              backgroundColor: c.color,
            }}
          />
        ))}
      </div>

      <div className="relative kitchen-panel rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Finished Dish Artwork */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              className="w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden border border-stone-200 shadow-sm"
              style={{ backgroundColor: recipe.themeBg }}
            >
              <DishImage
                src={recipe.imageUrl}
                alt={`Completed ${recipe.title}`}
                fallbackTitle={recipe.title}
                fallbackBg={recipe.themeBg}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Score, Stars & Coco Reaction */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold tracking-wide text-rose-600 mb-1">
                Order Up · Dish Complete
              </p>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2D221E]">
                {recipe.title}
              </h1>
            </div>

            {/* Star Rating & Score Row */}
            <div className="flex flex-wrap items-center gap-6 py-3 border-y border-stone-200/70">
              <div className="flex items-center gap-1.5" aria-label={`Earned ${performance.stars} out of 3 stars`}>
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 transition-transform ${
                      n <= performance.stars
                        ? 'fill-amber-400 text-amber-500 scale-105'
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-5 text-sm">
                <div>
                  <span className="block text-xs text-stone-500 font-medium">Kitchen Score</span>
                  <span className="font-display font-extrabold text-2xl text-[#2D221E] tabular-nums">
                    {performance.score}
                  </span>
                </div>
                <div className="h-8 w-px bg-stone-200" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-stone-500 font-medium">Prep &amp; Pan Accuracy</span>
                  <span className="font-display font-bold text-lg text-stone-800 tabular-nums">
                    {performance.ingredientMistakes + performance.toolMistakes === 0
                      ? '100%'
                      : `${performance.ingredientMistakes + performance.toolMistakes} error${performance.ingredientMistakes + performance.toolMistakes > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Coco Review */}
            <ChefCoco mood="proud" dialogue={praiseLine} size="sm" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(580);
                  onPlayAgain();
                }}
                className="btn-kitchen-primary flex-1 min-h-[50px] px-5 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-bold text-base flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(500);
                  onChooseAnother();
                }}
                className="flex-1 min-h-[50px] px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-[#2D221E] font-display font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Choose Another Recipe</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
