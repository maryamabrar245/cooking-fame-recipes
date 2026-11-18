import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Flame,
  RotateCcw,
  ShoppingBasket,
  X,
} from 'lucide-react';
import { ChefMood, Ingredient, Recipe } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface IngredientPickerProps {
  recipe: Recipe;
  onComplete: (mistakes: number) => void;
}

interface BurstEffect {
  id: number;
  emoji: string;
  label: string;
}

const MAX_MISTAKES = 3;

export const IngredientPicker: React.FC<IngredientPickerProps> = ({
  recipe,
  onComplete,
}) => {
  const requiredIngredients = useMemo(
    () => recipe.ingredients.filter((i) => i.isCorrect),
    [recipe.ingredients]
  );

  // Shuffle pantry shelf once per mount for genuine culinary selection
  const shuffledIngredients = useMemo(() => {
    const copy = [...recipe.ingredients];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [recipe.ingredients]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bowlPulseKey, setBowlPulseKey] = useState(0);
  const [bursts, setBursts] = useState<Record<string, BurstEffect>>({});
  const [lastShakenId, setLastShakenId] = useState<string | null>(null);
  const [activeError, setActiveError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [cocoMood, setCocoMood] = useState<ChefMood>('happy');
  const [cocoLine, setCocoLine] = useState(recipe.introLine);

  const gatheredCount = selectedIds.length;
  const totalRequired = requiredIngredients.length;
  const isReady = gatheredCount === totalRequired;
  const isSpoiled = mistakes >= MAX_MISTAKES;

  const handleIngredientClick = (item: Ingredient) => {
    if (selectedIds.includes(item.id) || rejectedIds.includes(item.id) || isSpoiled || isReady) {
      return;
    }

    if (item.isCorrect) {
      soundFX.playGoodPick();
      const nextSelected = [...selectedIds, item.id];
      setSelectedIds(nextSelected);
      setStreak((s) => s + 1);
      setBowlPulseKey((k) => k + 1);
      setActiveError(null);

      // Spawn tap-tap pop burst on that card
      const burstId = Date.now() + Math.random();
      setBursts((prev) => ({
        ...prev,
        [item.id]: { id: burstId, emoji: item.emoji, label: '+Added!' },
      }));

      setCocoMood(nextSelected.length === totalRequired ? 'excited' : 'happy');
      setCocoLine(
        nextSelected.length === totalRequired
          ? 'Prep bowl is stacked! All 5 authentic ingredients ready—let us pick our pan!'
          : item.reactionLine
      );
    } else {
      soundFX.playOops();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setStreak(0);
      setRejectedIds((prev) => [...prev, item.id]);
      setLastShakenId(item.id);
      setActiveError({
        title: item.errorTitle ?? 'Wrong Ingredient Selected',
        message: item.reactionLine,
      });
      setCocoMood('oops');

      if (nextMistakes >= MAX_MISTAKES) {
        setCocoLine(
          'Too many wrong ingredients spoiled the prep bowl! Clear the bowl and start fresh.'
        );
      } else {
        setCocoLine(item.reactionLine);
      }
    }
  };

  const handleReset = () => {
    soundFX.playPop(460);
    setSelectedIds([]);
    setRejectedIds([]);
    setMistakes(0);
    setStreak(0);
    setBursts({});
    setLastShakenId(null);
    setActiveError(null);
    setCocoMood('idle');
    setCocoLine(recipe.ingredientsPrompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 animate-pop-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Chef Coco + Bouncing Prep Bowl */}
        <div className="lg:col-span-5 kitchen-panel rounded-3xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-rose-600">
                Phase 1 · Kitchen Pantry Prep
              </p>
              <h1 className="font-display font-extrabold text-2xl text-[#2D221E]">
                {recipe.title}
              </h1>
            </div>

            <div className="text-right shrink-0">
              <span className="block text-sm font-bold text-stone-800 tabular-nums">
                {gatheredCount} / {totalRequired} picked
              </span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  mistakes > 0 ? 'text-red-600' : 'text-stone-500'
                }`}
              >
                Errors: {mistakes} / {MAX_MISTAKES}
              </span>
            </div>
          </div>

          <ChefCoco mood={cocoMood} dialogue={cocoLine} size="md" />

          {/* Prep Bowl Checklist with Bounce Animation */}
          <div
            key={bowlPulseKey}
            className={`pt-4 border-t border-stone-200/70 ${
              bowlPulseKey > 0 ? 'animate-bowl-bounce' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <ShoppingBasket className="w-4 h-4 text-rose-600" />
                <span>Prep Bowl</span>
                {streak >= 2 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 ml-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    {streak}x streak
                  </span>
                )}
              </span>
              {(gatheredCount > 0 || mistakes > 0) && !isReady && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 min-h-[32px] px-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Prep
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {requiredIngredients.map((req, idx) => {
                const picked = selectedIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1 transition-all ${
                      picked
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs animate-pop-in'
                        : 'bg-stone-50/90 border-dashed border-stone-300 text-stone-400'
                    }`}
                    title={picked ? req.name : `Slot ${idx + 1}`}
                  >
                    {picked ? (
                      <>
                        <span className="text-2xl leading-none">{req.emoji}</span>
                        <span className="text-[10px] font-semibold text-emerald-800 truncate max-w-full mt-1">
                          {req.name.split(' ').slice(-1)[0]}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold tabular-nums">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Next CTA or Spoiled Reset */}
          {isSpoiled ? (
            <button
              type="button"
              onClick={handleReset}
              className="w-full min-h-[52px] rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-display font-bold text-base shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Bowl &amp; Try Again</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!isReady}
              onClick={() => {
                soundFX.playStepComplete();
                onComplete(mistakes);
              }}
              className={`w-full min-h-[52px] rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
                isReady
                  ? 'btn-kitchen-primary bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>
                {isReady
                  ? 'Open Cookware Drawer'
                  : `Tap-tap ${totalRequired - gatheredCount} more ingredient${totalRequired - gatheredCount > 1 ? 's' : ''}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Kitchen Pantry Shelf + Explicit Error Banner */}
        <div className="lg:col-span-7 kitchen-panel rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-xl text-[#2D221E]">
                Kitchen Pantry Shelf
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">
                {recipe.ingredientsPrompt} Three wrong picks spoil the batch.
              </p>
            </div>
          </div>

          {/* Explicit Kitchen Error Alert */}
          {activeError && (
            <div
              role="alert"
              className={`rounded-2xl border p-4 flex items-start gap-3 animate-pop-in ${
                isSpoiled
                  ? 'bg-red-100 border-red-400 text-red-950'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">
                  {isSpoiled
                    ? 'Batch Spoiled (3/3 Kitchen Errors)'
                    : activeError.title}
                </p>
                <p className="mt-0.5 leading-snug">{activeError.message}</p>
              </div>
            </div>
          )}

          {/* 10 Culinary Ingredients Grid with Tap-Tap Bursts */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {shuffledIngredients.map((item) => {
              const isPicked = selectedIds.includes(item.id);
              const isRejected = rejectedIds.includes(item.id);
              const isShaking = lastShakenId === item.id;
              const burst = bursts[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isPicked || isRejected || isSpoiled || isReady}
                  onClick={() => handleIngredientClick(item)}
                  className={`relative min-h-[120px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-rose-600 ${
                    isShaking && isRejected ? 'animate-shake-error' : ''
                  } ${
                    isPicked
                      ? 'bg-emerald-50 border-emerald-400 cursor-default shadow-xs'
                      : isRejected
                        ? 'bg-red-50 border-red-300 text-red-900/75 cursor-not-allowed'
                        : isSpoiled || isReady
                          ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                          : 'bg-white border-stone-200 hover:border-rose-400 hover:-translate-y-1 hover:shadow-md active:scale-92 cursor-pointer'
                  }`}
                >
                  {/* Floating Tap-Tap Burst */}
                  {burst && (
                    <span
                      key={burst.id}
                      aria-hidden="true"
                      className="animate-tap-burst pointer-events-none absolute top-3 left-1/2 z-20 text-xs font-extrabold text-emerald-700 whitespace-nowrap drop-shadow-xs"
                    >
                      {burst.emoji} {burst.label}
                    </span>
                  )}

                  <span
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs transition-transform ${
                      isRejected ? 'grayscale opacity-60' : 'group-hover:scale-105'
                    }`}
                    style={{ backgroundColor: item.accentColor }}
                  >
                    {item.emoji}
                  </span>

                  <span
                    className={`text-xs sm:text-[13px] font-bold text-center leading-tight ${
                      isRejected ? 'line-through text-red-700' : 'text-[#2D221E]'
                    }`}
                  >
                    {item.name}
                  </span>

                  {isPicked && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}

                  {isRejected && (
                    <span
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs"
                      aria-label="Wrong ingredient"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
