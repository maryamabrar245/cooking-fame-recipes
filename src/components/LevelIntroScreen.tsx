import React from 'react';
import { ChevronLeft, Clock, Coins, Play, Star, Target, Users } from 'lucide-react';
import {
  CUSTOMER_ARCHETYPES,
  RECIPES_CATALOG,
  TOPPINGS_CATALOG,
} from '../data/gameData';
import { LevelConfig, LevelProgressRecord } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';
import { CustomerAvatar } from './FoodGraphics';

interface LevelIntroScreenProps {
  level: LevelConfig;
  record?: LevelProgressRecord;
  onStartLevel: () => void;
  onBackToMap: () => void;
}

export const LevelIntroScreen: React.FC<LevelIntroScreenProps> = ({
  level,
  record,
  onStartLevel,
  onBackToMap,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-pop-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#E11D48] to-[#F97316] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-100">
              Level {level.level} · {level.locationName}
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">
              {level.title}
            </h1>
            <p className="text-sm text-rose-50 mt-1 max-w-xl">{level.description}</p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/15 px-3.5 py-2 rounded-2xl shrink-0 self-start sm:self-center">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= (record?.stars ?? 0)
                    ? 'fill-amber-300 text-amber-300'
                    : 'text-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Goals & Timer Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
              <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Orders Goal
              </p>
              <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
                {level.targetOrders} Orders
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                Coin Goal
              </p>
              <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
                {level.targetCoins} Coins
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5">
              <p className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Time Limit
              </p>
              <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
                {level.timeLimitSec}s
              </p>
            </div>

            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5">
              <p className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                3-Star Target
              </p>
              <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
                {level.starThresholds[2]} Coins
              </p>
            </div>
          </div>

          {/* Available Recipes & Toppings */}
          <div className="space-y-2.5">
            <h2 className="font-display font-bold text-lg text-[#2D221E]">
              Today&apos;s Menu &amp; Order Rules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {level.availableRecipes.map((recipeId) => {
                const recipe = RECIPES_CATALOG[recipeId];
                const activeToppings = recipe.requiredToppingsOrder.filter((t) =>
                  level.availableToppings.includes(t)
                );

                return (
                  <div
                    key={recipeId}
                    className="rounded-2xl border border-stone-200 bg-[#FFFDF9] p-3 flex items-center gap-3"
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-[#2D221E]">
                        {recipe.title}
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {activeToppings.length === 0
                          ? 'Brew chilled glass & serve directly'
                          : `Order: ${activeToppings
                              .map((t, i) => `${i + 1}. ${TOPPINGS_CATALOG[t].shortName}`)
                              .join(' → ')}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expected Customers */}
          <div className="space-y-2.5">
            <h2 className="font-display font-bold text-lg text-[#2D221E] flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500" />
              <span>Guests Visiting Today</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {level.customerTypes.map((cId) => {
                const guest = CUSTOMER_ARCHETYPES[cId];
                if (!guest) return null;
                return (
                  <div
                    key={cId}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 flex items-center gap-2.5"
                  >
                    <div className="scale-75 -m-2">
                      <CustomerAvatar type={guest.avatarType} mood="happy" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2D221E]">{guest.name}</p>
                      <p className="text-[11px] text-stone-500">{guest.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chef Coco Tip + Action Buttons */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <ChefCoco
              mood={level.isTutorial ? 'excited' : 'happy'}
              size="sm"
              bubblePosition="right"
              dialogue={
                level.isTutorial
                  ? 'Tap or drag ingredients step by step. Plate hot food before the 30s burn timer!'
                  : 'Watch each topping order carefully for a 100% accuracy bonus!'
              }
            />

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(460);
                  onBackToMap();
                }}
                className="min-h-[52px] px-5 rounded-2xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Level Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(640);
                  onStartLevel();
                }}
                className="arcade-btn-3d min-h-[52px] px-7 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-extrabold text-base flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Level</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
