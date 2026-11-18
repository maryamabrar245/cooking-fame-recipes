import React, { useState } from 'react';
import { BookOpen, Check, Coins, Lock, Sparkles, Wrench } from 'lucide-react';
import {
  RECIPES_CATALOG,
  TOPPINGS_CATALOG,
  UPGRADE_CATALOG,
} from '../data/gameData';
import { KitchenUpgrades, PlayerSaveData, RecipeId } from '../types/game';
import { soundFX } from '../utils/sound';

interface RecipeBookScreenProps {
  saveData: PlayerSaveData;
  onUnlockRecipe: (recipeId: RecipeId, cost: number) => void;
  onBuyUpgrade: (key: keyof KitchenUpgrades, cost: number) => void;
}

export const RecipeBookScreen: React.FC<RecipeBookScreenProps> = ({
  saveData,
  onUnlockRecipe,
  onBuyUpgrade,
}) => {
  const [tab, setTab] = useState<'recipes' | 'upgrades'>('recipes');
  const recipesList = Object.values(RECIPES_CATALOG);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-pop-in">
      {/* Header + Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2D221E]">
            Recipe Book &amp; Kitchen Gear
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Master every step sequence and upgrade your café equipment with coins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-display font-extrabold text-base tabular-nums">
            <Coins className="w-4 h-4 text-amber-500" />
            {saveData.coins} Coins
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playPop(520);
            setTab('recipes');
          }}
          className={`min-h-[48px] px-5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 border-2 cursor-pointer transition-colors ${
            tab === 'recipes'
              ? 'bg-[#E11D48] text-white border-[#9F1239]'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Recipes ({saveData.unlockedRecipes.length}/4)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playPop(520);
            setTab('upgrades');
          }}
          className={`min-h-[48px] px-5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 border-2 cursor-pointer transition-colors ${
            tab === 'upgrades'
              ? 'bg-[#E11D48] text-white border-[#9F1239]'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Kitchen Upgrades</span>
        </button>
      </div>

      {/* Tab 1: Recipes */}
      {tab === 'recipes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recipesList.map((recipe) => {
            const isUnlocked = saveData.unlockedRecipes.includes(recipe.id);
            const canAfford = saveData.coins >= recipe.unlockCost;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="relative h-44 bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className={`w-full h-full object-cover ${
                      isUnlocked ? '' : 'grayscale opacity-75'
                    }`}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-xl text-xs font-extrabold text-[#2D221E] shadow-xs">
                    {recipe.category} · +{recipe.basePrice} Base Coins
                  </div>
                  {isUnlocked ? (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-stone-900/80 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Lv. {recipe.unlockLevel}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <h2 className="font-display font-extrabold text-xl text-[#2D221E]">
                      {recipe.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">{recipe.description}</p>

                    {recipe.requiredToppingsOrder.length > 0 && (
                      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-950">
                        Exact Topping Order:{' '}
                        {recipe.requiredToppingsOrder
                          .map((t, i) => `${i + 1}. ${TOPPINGS_CATALOG[t].emoji} ${TOPPINGS_CATALOG[t].name}`)
                          .join(' → ')}
                      </div>
                    )}

                    <ol className="space-y-1.5 pt-1">
                      {recipe.stepSequence.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-stone-700 flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {!isUnlocked && recipe.unlockCost > 0 && (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        soundFX.playVictory();
                        onUnlockRecipe(recipe.id, recipe.unlockCost);
                      }}
                      className={`w-full min-h-[48px] rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 ${
                        canAfford
                          ? 'arcade-btn-3d bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        Unlock Early ({recipe.unlockCost} Coins) or Reach Lv. {recipe.unlockLevel}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tab 2: Kitchen Upgrades */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UPGRADE_CATALOG.map((up) => {
            const currentLvl = saveData.upgrades[up.key];
            const isMax = currentLvl >= up.maxLevel;
            const nextCost = isMax ? 0 : up.costs[currentLvl];
            const canAfford = !isMax && saveData.coins >= nextCost;

            return (
              <div
                key={up.key}
                className="bg-white rounded-3xl border-2 border-stone-200 p-5 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-2xl flex items-center justify-center shrink-0">
                    {up.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-extrabold text-lg text-[#2D221E]">
                        {up.name}
                      </h3>
                      <span className="text-xs font-extrabold text-rose-600 tabular-nums">
                        Lv. {currentLvl}/{up.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      {up.description}
                    </p>

                    {/* Level Bars */}
                    <div className="flex gap-1.5 mt-3">
                      {Array.from({ length: up.maxLevel }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 flex-1 rounded-full ${
                            idx < currentLvl ? 'bg-emerald-500' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isMax || !canAfford}
                  onClick={() => {
                    soundFX.playCashRegister();
                    onBuyUpgrade(up.key, nextCost);
                  }}
                  className={`w-full min-h-[48px] rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 ${
                    isMax
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : canAfford
                        ? 'arcade-btn-3d bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Maxed Out!</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 text-amber-300" />
                      <span>Upgrade · {nextCost} Coins</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
