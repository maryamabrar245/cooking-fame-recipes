import React from 'react';
import {
  BookOpen,
  Coins,
  Gift,
  Map,
  Play,
  Settings,
  Star,
} from 'lucide-react';
import { KITCHEN_BACKDROP_URL } from '../data/gameData';
import { PlayerSaveData } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface HomeScreenProps {
  saveData: PlayerSaveData;
  canClaimDaily: boolean;
  onPlayNext: () => void;
  onOpenMap: () => void;
  onOpenRecipeBook: () => void;
  onOpenDailyRewards: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  saveData,
  canClaimDaily,
  onPlayNext,
  onOpenMap,
  onOpenRecipeBook,
  onOpenDailyRewards,
  onOpenSettings,
}) => {
  const totalStars = Object.values(saveData.levelRecords).reduce(
    (sum, r) => sum + r.stars,
    0
  );

  return (
    <div className="relative min-h-[calc(100vh-56px)] w-full flex items-center">
      {/* Warm Café Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <img
          src={KITCHEN_BACKDROP_URL}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,251,245,0.82) 0%, rgba(255,243,230,0.86) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 animate-pop-in">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Chef Coco + Totals */}
          <div className="lg:col-span-5 flex flex-col items-center text-center gap-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm tabular-nums">
                <Coins className="w-4 h-4 text-amber-500" />
                {saveData.coins} Coins
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-sm tabular-nums">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {totalStars} / 42 Stars
              </span>
            </div>

            <ChefCoco
              mood="happy"
              size="lg"
              bubblePosition="top"
              dialogue={`Welcome back! Ready for Level ${saveData.unlockedLevel}?`}
            />
          </div>

          {/* Right: 5 Main Hub Navigation Buttons */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            <div>
              <p className="text-xs font-bold text-rose-600 tracking-wide">
                Trendy Café Hub
              </p>
              <h1 className="font-display font-extrabold text-3xl text-[#2D221E]">
                Coco&apos;s Café Kitchen
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playPop(620);
                onPlayNext();
              }}
              className="arcade-btn-3d w-full min-h-[60px] px-6 py-3.5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-bold text-xl flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" />
                <span>Play Level {saveData.unlockedLevel}</span>
              </span>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-lg">
                Continue
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(540);
                  onOpenMap();
                }}
                className="min-h-[56px] px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-[#2D221E] font-display font-bold text-base flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Map className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Level Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(540);
                  onOpenRecipeBook();
                }}
                className="min-h-[56px] px-5 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-[#2D221E] font-display font-bold text-base flex items-center gap-3 transition-colors cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Recipe Book</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(580);
                  onOpenDailyRewards();
                }}
                className="relative min-h-[56px] px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-[#2D221E] font-display font-bold text-base flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Gift className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Daily Rewards</span>
                {canClaimDaily && (
                  <span className="ml-auto text-[11px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded-md">
                    Claim!
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(480);
                  onOpenSettings();
                }}
                className="min-h-[56px] px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 border-2 border-stone-200 text-[#2D221E] font-display font-bold text-base flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Settings className="w-5 h-5 text-stone-600 shrink-0" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
