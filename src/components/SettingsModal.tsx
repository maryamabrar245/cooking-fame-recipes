import React, { useState } from 'react';
import { Lightbulb, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundFX } from '../utils/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Settings"
    >
      <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl animate-pop-in">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <h2 className="font-display font-extrabold text-2xl text-[#2D221E]">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 flex flex-col gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextSound = !settings.soundEnabled;
              soundFX.enabled = nextSound;
              onUpdateSettings({ ...settings, soundEnabled: nextSound });
              if (nextSound) soundFX.playPop(560);
            }}
            className="w-full min-h-[56px] px-4 py-3 rounded-2xl border border-stone-200 bg-[#FFFDF9] hover:bg-stone-50 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-3 font-semibold text-sm text-[#2D221E]">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-rose-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-stone-400" />
              )}
              <span>Kitchen Sound Effects</span>
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                settings.soundEnabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Helpful Hints Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFX.playPop(520);
              onUpdateSettings({
                ...settings,
                hintsEnabled: !settings.hintsEnabled,
              });
            }}
            className="w-full min-h-[56px] px-4 py-3 rounded-2xl border border-stone-200 bg-[#FFFDF9] hover:bg-stone-50 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-3 font-semibold text-sm text-[#2D221E]">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Recipe Hints &amp; Guided Steps</span>
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                settings.hintsEnabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {settings.hintsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Reset Saved Progress */}
          <div className="pt-3 border-t border-stone-100">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Saved Progress</span>
              </button>
            ) : (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-3 flex flex-col gap-2">
                <p className="text-xs font-bold text-red-900 text-center">
                  Reset all levels, stars, coins, and upgrades?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTrash();
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 min-h-[40px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 min-h-[40px] rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
