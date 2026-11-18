import React from 'react';
import { BookOpen, Clock, Coins, Lock, Play, Star } from 'lucide-react';
import { LEVELS, RECIPES_CATALOG } from '../data/gameData';
import { LevelConfig, PlayerSaveData } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface LevelMapProps {
  saveData: PlayerSaveData;
  onSelectLevel: (level: LevelConfig) => void;
  onOpenRecipeBook: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  saveData,
  onSelectLevel,
  onOpenRecipeBook,
}) => {
  const totalStars = Object.values(saveData.levelRecords).reduce(
    (sum, rec) => sum + rec.stars,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-pop-in">
      {/* Summary Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ChefCoco
          mood="happy"
          size="sm"
          bubblePosition="right"
          dialogue={`Pick any unlocked level! You've earned ${totalStars} of 42 café stars.`}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-amber-700">Coins</p>
              <p className="font-display font-extrabold text-lg text-[#2D221E] leading-none tabular-nums">
                {saveData.coins}
              </p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-rose-700">Stars</p>
              <p className="font-display font-extrabold text-lg text-[#2D221E] leading-none tabular-nums">
                {totalStars} / 42
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop(540);
              onOpenRecipeBook();
            }}
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-900 font-display font-bold text-sm flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Recipes &amp; Upgrades</span>
          </button>
        </div>
      </div>

      {/* 14 Unlockable Café Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {LEVELS.map((lvl) => {
          const isUnlocked = lvl.level <= saveData.unlockedLevel;
          const record = saveData.levelRecords[lvl.level];
          const stars = record?.stars ?? 0;

          return (
            <button
              key={lvl.level}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                soundFX.playPop(600);
                onSelectLevel(lvl);
              }}
              className={`text-left rounded-3xl border-2 p-4 flex flex-col justify-between gap-3 transition-all ${
                isUnlocked
                  ? 'bg-white border-stone-200 hover:border-rose-400 hover:shadow-md cursor-pointer'
                  : 'bg-stone-100/80 border-stone-200/80 opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Top row: Level number + stars */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-display font-extrabold text-sm tabular-nums ${
                        isUnlocked
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-300 text-stone-600'
                      }`}
                    >
                      {lvl.level}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      {lvl.locationName}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#2D221E] mt-2 leading-tight">
                    {lvl.title}
                  </h3>
                </div>

                {!isUnlocked ? (
                  <span className="w-8 h-8 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </span>
                ) : (
                  <div className="flex items-center gap-0.5 shrink-0 pt-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recipes & Goals */}
              <div className="space-y-2">
                <p className="text-xs text-stone-600 line-clamp-2">{lvl.description}</p>

                <div className="text-[11px] font-semibold text-stone-700 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{lvl.targetOrders} Orders</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 tabular-nums">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {lvl.targetCoins}+ goal
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {lvl.timeLimitSec}s
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {lvl.availableRecipes.map((rId) => (
                    <img
                      key={rId}
                      src={RECIPES_CATALOG[rId].imageUrl}
                      alt={RECIPES_CATALOG[rId].shortTitle}
                      title={RECIPES_CATALOG[rId].shortTitle}
                      className="w-7 h-7 rounded-lg object-cover border border-stone-200"
                    />
                  ))}
                  {isUnlocked && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-rose-600">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Open
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
