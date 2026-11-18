import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Home,
  RotateCcw,
  Star,
} from 'lucide-react';
import { RoundSummary } from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';

interface ResultsScreenProps {
  summary: RoundSummary;
  hasNextLevel: boolean;
  onContinue: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  summary,
  hasNextLevel,
  onContinue,
  onReplay,
  onHome,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pop-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
        {/* Star Rating */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                s <= summary.stars
                  ? 'bg-amber-50 border-amber-300 scale-105 shadow-sm'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  s <= summary.stars
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-stone-300'
                }`}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
            Level {summary.levelNumber} Summary
          </p>
          <h1 className="font-display font-extrabold text-3xl text-[#2D221E] mt-1">
            {summary.passed ? 'Café Shift Complete!' : 'Time Ran Out!'}
          </h1>
        </div>

        {/* Chef Coco Reaction */}
        <div className="flex justify-center">
          <ChefCoco
            mood={summary.passed ? 'proud' : 'oops'}
            size="sm"
            bubblePosition="right"
            dialogue={
              summary.passed
                ? summary.stars === 3
                  ? `Flawless service! ${summary.accuracy}% accuracy and ${summary.maxCombo}x max combo!`
                  : 'Awesome cooking! Replay anytime to chase 3 stars.'
                : 'Almost had it! Watch the 30s burn timer and serve orders quicker next try.'
            }
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5">
            <p className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Orders
            </p>
            <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
              {summary.completedOrders}/{summary.targetOrders}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
            <p className="text-[11px] font-bold text-emerald-700">Accuracy</p>
            <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
              {summary.accuracy}%
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3.5">
            <p className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Time Left
            </p>
            <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
              {formatTime(summary.timeRemaining)}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
            <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              Coins Earned
            </p>
            <p className="font-display font-extrabold text-xl text-[#2D221E] mt-1 tabular-nums">
              +{summary.coinsEarned}
            </p>
          </div>
        </div>

        {/* Action Buttons: Continue, Replay, Home */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {summary.passed && hasNextLevel && (
            <button
              type="button"
              onClick={() => {
                soundFX.playPop(640);
                onContinue();
              }}
              className="arcade-btn-3d flex-1 min-h-[54px] px-6 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundFX.playPop(560);
              onReplay();
            }}
            className="flex-1 min-h-[54px] px-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop(480);
              onHome();
            }}
            className="flex-1 min-h-[54px] px-5 rounded-2xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
