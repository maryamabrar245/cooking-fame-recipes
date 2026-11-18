import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Hand,
  Sparkles,
  Timer,
} from 'lucide-react';
import { ChefMood, KitchenTool, Recipe } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';
import { CounterVisuals } from './CounterVisuals';

interface CookingStageProps {
  recipe: Recipe;
  selectedTool: KitchenTool | null;
  onFinishCooking: (perfectTimingSteps: number, totalTimingSteps: number) => void;
}

interface TapBurst {
  id: number;
  x: number;
  y: number;
  word: string;
}

export const CookingStage: React.FC<CookingStageProps> = ({
  recipe,
  selectedTool,
  onFinishCooking,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [tapCount, setTapCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [timingPos, setTimingPos] = useState(10); // 0 to 100
  const [timingStopped, setTimingStopped] = useState(false);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [cocoMood, setCocoMood] = useState<ChefMood>('cooking');
  const [cocoLine, setCocoLine] = useState(recipe.steps[0].cocoLineStart);
  const [perfectTimings, setPerfectTimings] = useState(0);
  const [timingMissed, setTimingMissed] = useState(false);
  const [tapBursts, setTapBursts] = useState<TapBurst[]>([]);

  const step = recipe.steps[stepIndex];
  const isLastStep = stepIndex === recipe.steps.length - 1;
  const totalTimingSteps = recipe.steps.filter((s) => s.mechanic === 'timing').length;
  const isTapInteractive = !isStepComplete && (step.mechanic === 'tap' || step.mechanic === 'layer');

  const holdRafRef = useRef<number | null>(null);
  const timingRafRef = useRef<number | null>(null);
  const lastTickSoundRef = useRef<number>(0);

  const finishCurrentStep = useCallback(
    (customLine?: string, customMood: ChefMood = 'excited') => {
      setIsStepComplete(true);
      setIsHolding(false);
      setCocoMood(customMood);
      setCocoLine(customLine ?? step.cocoLineDone);
      if (customMood === 'oops') {
        soundFX.playOops();
      } else {
        soundFX.playStepComplete();
      }
    },
    [step.cocoLineDone]
  );

  // Reset per-step state whenever stepIndex changes
  useEffect(() => {
    const current = recipe.steps[stepIndex];
    setProgress(0);
    setTapCount(0);
    setIsHolding(false);
    setTimingPos(12);
    setTimingStopped(false);
    setTimingMissed(false);
    setIsStepComplete(false);
    setTapBursts([]);
    setCocoMood('cooking');
    setCocoLine(current.cocoLineStart);
  }, [recipe.steps, stepIndex]);

  // 'hold' mechanic animation loop
  useEffect(() => {
    if (step.mechanic !== 'hold' || !isHolding || isStepComplete) {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
      return;
    }

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = Math.min(1, prev + dt * 0.56);
        if (now - lastTickSoundRef.current > 180) {
          soundFX.playActionTick(next);
          lastTickSoundRef.current = now;
        }
        if (next >= 1) {
          finishCurrentStep();
          return 1;
        }
        return next;
      });

      holdRafRef.current = requestAnimationFrame(tick);
    };

    holdRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, [step.mechanic, isHolding, isStepComplete, finishCurrentStep]);

  // 'timing' mechanic smooth needle sweep
  useEffect(() => {
    if (step.mechanic !== 'timing' || timingStopped || isStepComplete) {
      if (timingRafRef.current) cancelAnimationFrame(timingRafRef.current);
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const pos = 50 + 44 * Math.sin(elapsed * 2.35 - Math.PI / 2);
      setTimingPos(pos);
      timingRafRef.current = requestAnimationFrame(tick);
    };

    timingRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (timingRafRef.current) cancelAnimationFrame(timingRafRef.current);
    };
  }, [step.mechanic, timingStopped, isStepComplete]);

  const spawnBurst = (xPercent = 50, yPercent = 48) => {
    const word = step.tapFeedbackWord ?? 'Nice!';
    const id = Date.now() + Math.random();
    setTapBursts((prev) => [...prev.slice(-4), { id, x: xPercent, y: yPercent, word }]);
  };

  const handleTapStep = (clientX?: number, clientY?: number, rect?: DOMRect) => {
    if (isStepComplete) return;
    const target = step.targetCount ?? 4;
    const nextCount = tapCount + 1;
    const nextProgress = Math.min(1, nextCount / target);

    if (clientX !== undefined && clientY !== undefined && rect && rect.width > 0 && rect.height > 0) {
      const xPct = Math.max(15, Math.min(85, ((clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(20, Math.min(75, ((clientY - rect.top) / rect.height) * 100));
      spawnBurst(xPct, yPct);
    } else {
      spawnBurst(44 + Math.random() * 14, 38 + Math.random() * 14);
    }

    setTapCount(nextCount);
    setProgress(nextProgress);
    setPulseKey((k) => k + 1);
    soundFX.playActionTick(nextProgress);

    if (nextCount >= target) {
      finishCurrentStep();
    } else {
      setCocoMood('happy');
    }
  };

  const handleTimingStop = () => {
    if (timingStopped || isStepComplete) return;
    setTimingStopped(true);
    setProgress(1);
    setPulseKey((k) => k + 1);

    const inSweetSpot = timingPos >= 33 && timingPos <= 67;
    if (inSweetSpot) {
      setTimingMissed(false);
      setPerfectTimings((p) => p + 1);
      finishCurrentStep(`${step.cocoLineDone} Spot-on kitchen timing!`, 'excited');
    } else {
      setTimingMissed(true);
      const direction = timingPos < 33 ? 'too early' : 'a touch late';
      finishCurrentStep(
        `Timing error: stopped ${direction}! Still edible, though it costs a star deduction.`,
        'oops'
      );
    }
  };

  const handleNextStep = () => {
    soundFX.playPop(640);
    if (isLastStep) {
      onFinishCooking(perfectTimings, totalTimingSteps);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const nextLayerLabel =
    step.mechanic === 'layer' && step.layerItems
      ? step.layerItems[Math.min(tapCount, step.layerItems.length - 1)]
      : step.actionLabel;

  const showWarmSteam =
    (recipe.id === 'cake' && stepIndex === 2) ||
    (recipe.id === 'sandwich' && (stepIndex === 1 || stepIndex === 3)) ||
    (recipe.id === 'dates' && stepIndex === 2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 animate-pop-in">
      {/* Step Progress Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-600">
            Step {stepIndex + 1} of {recipe.steps.length} · {recipe.title}
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2D221E]">
            {step.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {selectedTool && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-white/90 border border-stone-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span>{selectedTool.emoji}</span>
              <span>{selectedTool.name}</span>
            </span>
          )}

          {/* Step Indicator Bars */}
          <div className="flex items-center gap-2" aria-label="Cooking steps progress">
            {recipe.steps.map((s, idx) => (
              <div
                key={s.id}
                className={`h-2.5 w-10 sm:w-12 rounded-full transition-colors ${
                  idx < stepIndex || (idx === stepIndex && isStepComplete)
                    ? 'bg-emerald-500'
                    : idx === stepIndex
                      ? 'bg-rose-500'
                      : 'bg-stone-300/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left/Top: Chef Coco Co-Cooking Panel */}
        <div className="lg:col-span-5 kitchen-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Station: {step.toolName}</span>
            <span className="tabular-nums">{Math.round(progress * 100)}% ready</span>
          </div>

          <div className="my-auto flex justify-center py-2">
            <ChefCoco
              mood={cocoMood}
              dialogue={cocoLine}
              size="md"
              isActionActive={isHolding || (!isStepComplete && tapCount > 0)}
              bubblePosition="top"
            />
          </div>

          {/* Checklist of steps for clarity */}
          <div className="pt-3 border-t border-stone-200/70 grid grid-cols-2 gap-2">
            {recipe.steps.map((s, idx) => {
              const done = idx < stepIndex || (idx === stepIndex && isStepComplete);
              const active = idx === stepIndex && !isStepComplete;
              return (
                <div
                  key={s.id}
                  className={`text-xs px-2.5 py-2 rounded-xl border flex items-center gap-1.5 ${
                    done
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                      : active
                        ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                        : 'bg-stone-50 border-stone-200/70 text-stone-400 font-medium'
                  }`}
                >
                  <span className="tabular-nums">{idx + 1}.</span>
                  <span className="truncate">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right/Bottom: Interactive Kitchen Counter */}
        <div
          className="lg:col-span-7 rounded-3xl border border-stone-300/80 p-5 sm:p-7 shadow-md flex flex-col justify-between gap-5"
          style={{ backgroundColor: recipe.themeBg }}
        >
          {/* Live Dish Illustration Stage (Directly Tap-Tappable!) */}
          <div
            onClick={(e) => {
              if (!isTapInteractive) return;
              const rect = e.currentTarget.getBoundingClientRect();
              handleTapStep(e.clientX, e.clientY, rect);
            }}
            role={isTapInteractive ? 'button' : undefined}
            tabIndex={isTapInteractive ? 0 : undefined}
            onKeyDown={(e) => {
              if (isTapInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleTapStep();
              }
            }}
            aria-label={isTapInteractive ? `Tap counter to ${nextLayerLabel}` : undefined}
            className={`relative overflow-hidden bg-white/90 backdrop-blur-xs rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
              isTapInteractive
                ? 'border-rose-200 hover:border-rose-400 cursor-pointer active:scale-[0.99]'
                : 'border-white'
            }`}
          >
            {isTapInteractive && (
              <span className="absolute top-3 right-3 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5 pointer-events-none">
                Tap Counter!
              </span>
            )}

            {/* Rising Steam Wisps on Heated Steps */}
            {showWarmSteam && !isStepComplete && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 flex gap-6" aria-hidden="true">
                <span className="animate-steam w-2.5 h-6 rounded-full bg-stone-300/50 blur-[2px]" />
                <span
                  className="animate-steam w-3 h-7 rounded-full bg-stone-300/50 blur-[2px]"
                  style={{ animationDelay: '0.7s' }}
                />
                <span
                  className="animate-steam w-2 h-5 rounded-full bg-stone-300/50 blur-[2px]"
                  style={{ animationDelay: '1.3s' }}
                />
              </div>
            )}

            {/* Floating Tap-Tap Words */}
            {tapBursts.map((b) => (
              <span
                key={b.id}
                aria-hidden="true"
                className="animate-tap-burst pointer-events-none absolute z-20 font-display font-extrabold text-lg text-rose-600 drop-shadow-xs"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                {b.word}
              </span>
            ))}

            <CounterVisuals
              recipeId={recipe.id}
              stepIndex={stepIndex}
              progress={progress}
              isStepComplete={isStepComplete}
              pulseKey={pulseKey}
            />
          </div>

          {/* Step Instruction & Interactive Control */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm sm:text-base font-semibold text-[#2D221E] leading-snug">
                {step.instruction}
              </p>
              {isStepComplete && (
                timingMissed ? (
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                )
              )}
            </div>

            {/* Mechanic Specific Controls */}
            {!isStepComplete && (step.mechanic === 'tap' || step.mechanic === 'layer') && (
              <div className="flex flex-col gap-3">
                {step.mechanic === 'layer' && step.layerItems ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {step.layerItems.map((label, idx) => {
                      const added = idx < tapCount;
                      return (
                        <div
                          key={label}
                          className={`text-xs font-semibold px-2.5 py-2 rounded-xl border text-center transition-colors ${
                            added
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : idx === tapCount
                                ? 'bg-rose-50 border-rose-300 text-rose-800'
                                : 'bg-stone-50 border-stone-200 text-stone-400'
                          }`}
                        >
                          {added ? `✓ ${label}` : label}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-3.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                    <div
                      className="h-full bg-rose-500 transition-all duration-150"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleTapStep()}
                  className="btn-kitchen-primary w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-bold text-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Hand className="w-5 h-5" />
                  <span>
                    {nextLayerLabel} ({tapCount}/{step.targetCount ?? 4})
                  </span>
                </button>
              </div>
            )}

            {!isStepComplete && step.mechanic === 'hold' && (
              <div className="flex flex-col gap-3">
                <div className="w-full h-4 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-[width] duration-75"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>

                <button
                  type="button"
                  onMouseDown={() => setIsHolding(true)}
                  onMouseUp={() => setIsHolding(false)}
                  onMouseLeave={() => setIsHolding(false)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setIsHolding(true);
                  }}
                  onTouchEnd={() => setIsHolding(false)}
                  onTouchCancel={() => setIsHolding(false)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') setIsHolding(true);
                  }}
                  onKeyUp={() => setIsHolding(false)}
                  className={`btn-kitchen-primary w-full min-h-[54px] px-6 py-3 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2.5 select-none cursor-pointer ${
                    isHolding
                      ? 'bg-[#BE123C] text-white translate-y-0.5'
                      : 'bg-[#E11D48] hover:bg-[#BE123C] text-white'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{isHolding ? 'Keep Holding...' : step.actionLabel}</span>
                </button>
              </div>
            )}

            {!isStepComplete && step.mechanic === 'timing' && (
              <div className="flex flex-col gap-3">
                <div className="relative w-full h-9 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-200/90 border-x-2 border-emerald-500 flex items-center justify-center"
                    style={{ left: '33%', width: '34%' }}
                  >
                    <span className="text-[11px] font-bold text-emerald-900 tracking-wide">
                      Sweet Spot
                    </span>
                  </div>

                  <div
                    className="absolute top-1 bottom-1 w-3 -ml-1.5 rounded-full bg-[#2D221E] shadow-sm"
                    style={{ left: `${timingPos}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTimingStop}
                  className="btn-kitchen-primary w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-bold text-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Timer className="w-5 h-5" />
                  <span>{step.actionLabel}</span>
                </button>
              </div>
            )}

            {/* Step Complete -> Continue Button */}
            {isStepComplete && (
              <div className="flex flex-col gap-3">
                {timingMissed && (
                  <div
                    role="alert"
                    className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-amber-900 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Timing error: missed the green sweet spot! Star rating adjusted.</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="animate-pop-in w-full min-h-[54px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-bold text-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLastStep ? 'Serve Dish!' : 'Next Step'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
