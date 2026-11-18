import React from 'react';
import { Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { KITCHEN_BACKDROP_URL, RECIPES_CATALOG } from '../data/gameData';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface SplashScreenProps {
  onPlay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onPlay,
  soundEnabled,
  onToggleSound,
}) => {
  const featuredDishes = [
    RECIPES_CATALOG.sandwich,
    RECIPES_CATALOG.juice,
    RECIPES_CATALOG.cake,
    RECIPES_CATALOG.dates,
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between bg-[#FFF7ED]">
      {/* Animated Café Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <img
          src={KITCHEN_BACKDROP_URL}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-55 scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(255,251,245,0.65) 0%, rgba(255,243,230,0.88) 70%, rgba(254,226,226,0.85) 100%)',
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-white/85 backdrop-blur-xs border border-rose-200 px-3 py-1.5 rounded-xl shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          14 Café Levels · Tap &amp; Drag Kitchen
        </span>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-white/90 border border-stone-200 text-stone-700 hover:bg-white shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-rose-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400" />
          )}
          <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
        </button>
      </div>

      {/* Center Hero */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col items-center justify-center text-center gap-6">
        <div className="space-y-2 animate-pop-in">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-rose-600">
            Welcome to Chef Coco&apos;s Trendy Bistro
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#2D221E] tracking-tight leading-none">
            Coco&apos;s Café Rush
          </h1>
          <p className="text-sm sm:text-base text-stone-700 max-w-xl mx-auto font-medium">
            Toast sandwiches, blend sunset citrus juice, frost strawberry cloud cake,
            and stuff choco-nut dates before the 30-second grill timer burns!
          </p>
        </div>

        {/* Chef Coco + Floating Recipe Preview Cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 flex justify-center">
            <ChefCoco
              mood="excited"
              size="lg"
              bubblePosition="top"
              dialogue="Orders are lining up! Ready to open the café?"
            />
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-3">
            {featuredDishes.map((dish, idx) => (
              <div
                key={dish.id}
                className={`bg-white/95 rounded-2xl border-2 border-amber-200/80 p-2.5 shadow-md flex items-center gap-2.5 text-left ${
                  idx % 2 === 0 ? 'animate-float-slow' : 'animate-float-reverse'
                }`}
              >
                <img
                  src={dish.imageUrl}
                  alt={dish.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-600">{dish.category}</p>
                  <p className="font-display font-bold text-sm text-[#2D221E] truncate">
                    {dish.shortTitle}
                  </p>
                  <p className="text-[11px] text-stone-500">Lv. {dish.unlockLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prominent Play CTA */}
        <button
          type="button"
          onClick={() => {
            soundFX.playPop(640);
            onPlay();
          }}
          className="arcade-btn-3d min-h-[64px] px-12 py-4 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-extrabold text-2xl flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-current" />
          <span>Play Now</span>
        </button>
      </main>

      <footer className="relative z-10 pb-4 text-center text-xs font-medium text-stone-500">
        4 Signature Recipes · 14 Café Levels · Kitchen Upgrades &amp; Daily Rewards
      </footer>
    </div>
  );
};
