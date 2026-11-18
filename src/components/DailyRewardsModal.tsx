import React from 'react';
import { Check, Coins, Gift, X } from 'lucide-react';
import { DAILY_REWARDS } from '../data/gameData';
import { DailyRewardState } from '../types/game';
import { soundFX } from '../utils/sound';

interface DailyRewardsModalProps {
  dailyRewards: DailyRewardState;
  canClaim: boolean;
  onClaim: (coins: number) => void;
  onClose: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  dailyRewards,
  canClaim,
  onClaim,
  onClose,
}) => {
  const currentDayIdx = dailyRewards.streakDay % DAILY_REWARDS.length;
  const todaysReward = DAILY_REWARDS[currentDayIdx];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Daily Rewards"
    >
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl animate-pop-in">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#2D221E]">
                Daily Café Rewards
              </h2>
              <p className="text-xs text-stone-500">
                Check in every day for bonus coins!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close daily rewards"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          {DAILY_REWARDS.map((item, idx) => {
            const claimed = idx < currentDayIdx || (idx === currentDayIdx && !canClaim);
            const isToday = idx === currentDayIdx && canClaim;

            return (
              <div
                key={item.day}
                className={`rounded-2xl border-2 p-3 text-center flex flex-col items-center justify-between gap-1 ${
                  idx === 6 ? 'col-span-2' : ''
                } ${
                  isToday
                    ? 'bg-rose-50 border-rose-500 shadow-sm'
                    : claimed
                      ? 'bg-emerald-50 border-emerald-200 opacity-85'
                      : 'bg-stone-50 border-stone-200'
                }`}
              >
                <span className="text-[11px] font-bold text-stone-500">
                  Day {item.day}
                </span>
                <span className="font-display font-extrabold text-lg text-[#2D221E] flex items-center gap-1 tabular-nums">
                  <Coins className="w-4 h-4 text-amber-500" />
                  +{item.coins}
                </span>
                <span className="text-[10px] font-semibold text-stone-600">
                  {claimed ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700">
                      <Check className="w-3 h-3" /> Claimed
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canClaim}
          onClick={() => {
            soundFX.playVictory();
            onClaim(todaysReward.coins);
          }}
          className={`w-full min-h-[52px] rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
            canClaim
              ? 'arcade-btn-3d bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer'
              : 'bg-stone-100 text-stone-500 cursor-not-allowed'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span>
            {canClaim
              ? `Claim Day ${todaysReward.day} (+${todaysReward.coins} Coins)`
              : 'Already Claimed Today — Come Back Tomorrow!'}
          </span>
        </button>
      </div>
    </div>
  );
};
