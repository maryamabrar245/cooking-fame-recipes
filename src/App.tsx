/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, Coins, Star, Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_SAVE_DATA, LEVELS } from './data/gameData';
import {
  AppScreen,
  GameSettings,
  KitchenUpgrades,
  LevelConfig,
  PlayerSaveData,
  RecipeId,
  RoundSummary,
} from './types/game';
import { soundFX } from './utils/sound';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { LevelMap } from './components/LevelMap';
import { LevelIntroScreen } from './components/LevelIntroScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { RecipeBookScreen } from './components/RecipeBookScreen';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEY = 'cocos_cafe_rush_save_v2';

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const loadSaveData = (): PlayerSaveData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE_DATA;
    const parsed = JSON.parse(raw) as Partial<PlayerSaveData>;
    return {
      coins: typeof parsed.coins === 'number' ? parsed.coins : DEFAULT_SAVE_DATA.coins,
      unlockedLevel: Math.max(1, Math.min(14, parsed.unlockedLevel ?? 1)),
      unlockedRecipes:
        Array.isArray(parsed.unlockedRecipes) && parsed.unlockedRecipes.length > 0
          ? parsed.unlockedRecipes
          : DEFAULT_SAVE_DATA.unlockedRecipes,
      levelRecords: parsed.levelRecords ?? {},
      upgrades: {
        ...DEFAULT_SAVE_DATA.upgrades,
        ...(parsed.upgrades ?? {}),
      },
      settings: {
        ...DEFAULT_SAVE_DATA.settings,
        ...(parsed.settings ?? {}),
      },
      dailyRewards: {
        ...DEFAULT_SAVE_DATA.dailyRewards,
        ...(parsed.dailyRewards ?? {}),
      },
    };
  } catch {
    return DEFAULT_SAVE_DATA;
  }
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('SPLASH');
  const [saveData, setSaveData] = useState<PlayerSaveData>(loadSaveData);
  const [activeLevelNum, setActiveLevelNum] = useState<number>(1);
  const [gameInstanceKey, setGameInstanceKey] = useState<number>(0);
  const [lastSummary, setLastSummary] = useState<RoundSummary | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Sync Web Audio sound flag with saved settings
  useEffect(() => {
    soundFX.enabled = saveData.settings.soundEnabled;
  }, [saveData.settings.soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // Ignore storage quota issues cleanly
    }
  }, [saveData]);

  const todayKey = getTodayKey();
  const canClaimDaily = saveData.dailyRewards.lastClaimDate !== todayKey;

  const totalStars = Object.values(saveData.levelRecords).reduce(
    (sum, rec) => sum + rec.stars,
    0
  );

  const toggleSound = () => {
    const nextSound = !saveData.settings.soundEnabled;
    soundFX.enabled = nextSound;
    if (nextSound) soundFX.playPop(580);
    setSaveData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: nextSound,
      },
    }));
  };

  const handleOpenLevelIntro = (levelNumber: number) => {
    setActiveLevelNum(levelNumber);
    // Automatically unlock recipes featured in this level if newly reached
    const lvl = LEVELS.find((l) => l.level === levelNumber);
    if (lvl) {
      setSaveData((prev) => {
        const merged = Array.from(
          new Set([...prev.unlockedRecipes, ...lvl.availableRecipes])
        ) as RecipeId[];
        if (merged.length === prev.unlockedRecipes.length) return prev;
        return { ...prev, unlockedRecipes: merged };
      });
    }
    setScreen('LEVEL_INTRO');
  };

  const handleStartLevel = () => {
    setGameInstanceKey((k) => k + 1);
    setScreen('PLAYING');
  };

  const handleFinishRound = (summary: RoundSummary) => {
    setLastSummary(summary);
    setSaveData((prev) => {
      const existing = prev.levelRecords[summary.levelNumber];
      const nextUnlocked = summary.passed
        ? Math.min(14, Math.max(prev.unlockedLevel, summary.levelNumber + 1))
        : prev.unlockedLevel;

      const nextRecords = { ...prev.levelRecords };
      if (summary.passed && summary.stars >= 1) {
        const bestStars = Math.max(existing?.stars ?? 0, summary.stars) as 1 | 2 | 3;
        const bestCoins = Math.max(existing?.bestCoins ?? 0, summary.coinsEarned);
        const bestAccuracy = Math.max(existing?.bestAccuracy ?? 0, summary.accuracy);
        nextRecords[summary.levelNumber] = {
          stars: bestStars,
          bestCoins,
          bestAccuracy,
        };
      }

      // Unlock any recipes introduced at newly unlocked level
      const newlyUnlockedCfg = LEVELS.find((l) => l.level === nextUnlocked);
      const nextRecipes = newlyUnlockedCfg
        ? (Array.from(
            new Set([...prev.unlockedRecipes, ...newlyUnlockedCfg.availableRecipes])
          ) as RecipeId[])
        : prev.unlockedRecipes;

      return {
        ...prev,
        coins: prev.coins + summary.coinsEarned,
        unlockedLevel: nextUnlocked,
        unlockedRecipes: nextRecipes,
        levelRecords: nextRecords,
      };
    });
    setScreen('RESULTS');
  };

  const handleClaimDaily = (rewardCoins: number) => {
    setSaveData((prev) => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      dailyRewards: {
        streakDay: (prev.dailyRewards.streakDay + 1) % 7,
        lastClaimDate: todayKey,
      },
    }));
  };

  const handleUnlockRecipe = (recipeId: RecipeId, cost: number) => {
    setSaveData((prev) => {
      if (prev.coins < cost || prev.unlockedRecipes.includes(recipeId)) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        unlockedRecipes: [...prev.unlockedRecipes, recipeId],
      };
    });
  };

  const handleBuyUpgrade = (key: keyof KitchenUpgrades, cost: number) => {
    setSaveData((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [key]: prev.upgrades[key] + 1,
        },
      };
    });
  };

  const handleUpdateSettings = (nextSettings: GameSettings) => {
    setSaveData((prev) => ({
      ...prev,
      settings: nextSettings,
    }));
  };

  const handleResetProgress = () => {
    setSaveData(DEFAULT_SAVE_DATA);
    setActiveLevelNum(1);
    setScreen('HOME');
  };

  // --- Full-Viewport Screens ---
  if (screen === 'SPLASH') {
    return (
      <SplashScreen
        onPlay={() => setScreen('HOME')}
        soundEnabled={saveData.settings.soundEnabled}
        onToggleSound={toggleSound}
      />
    );
  }

  const activeLevelConfig: LevelConfig =
    LEVELS.find((l) => l.level === activeLevelNum) ?? LEVELS[0];

  if (screen === 'PLAYING') {
    return (
      <GameplayScreen
        key={`lvl-${activeLevelNum}-${gameInstanceKey}`}
        level={activeLevelConfig}
        upgrades={saveData.upgrades}
        settings={saveData.settings}
        onToggleSound={toggleSound}
        onFinishRound={handleFinishRound}
        onRestart={() => {
          setGameInstanceKey((k) => k + 1);
        }}
        onExitToMap={() => setScreen('MAP')}
      />
    );
  }

  // --- Hub & Navigation Shell (HOME, MAP, LEVEL_INTRO, RECIPE_BOOK, RESULTS) ---
  const handleHeaderBack = () => {
    soundFX.playPop(460);
    if (screen === 'HOME') {
      setScreen('SPLASH');
    } else if (screen === 'LEVEL_INTRO') {
      setScreen('MAP');
    } else {
      setScreen('HOME');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED] text-[#2D221E]">
      <header className="sticky top-0 z-30 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="min-h-[44px] px-2.5 -ml-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>
              {screen === 'HOME'
                ? 'Title'
                : screen === 'LEVEL_INTRO'
                  ? 'Map'
                  : 'Home'}
            </span>
          </button>

          <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-[#2D221E] whitespace-nowrap truncate">
            Coco&apos;s Café Rush
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-extrabold text-amber-900 tabular-nums">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              {saveData.coins}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-900 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              {totalStars}
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={saveData.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
              className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center justify-center cursor-pointer"
            >
              {saveData.settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {screen === 'HOME' && (
          <HomeScreen
            saveData={saveData}
            canClaimDaily={canClaimDaily}
            onPlayNext={() => handleOpenLevelIntro(saveData.unlockedLevel)}
            onOpenMap={() => setScreen('MAP')}
            onOpenRecipeBook={() => setScreen('RECIPE_BOOK')}
            onOpenDailyRewards={() => setShowDailyModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}

        {screen === 'MAP' && (
          <LevelMap
            saveData={saveData}
            onSelectLevel={(lvl) => handleOpenLevelIntro(lvl.level)}
            onOpenRecipeBook={() => setScreen('RECIPE_BOOK')}
          />
        )}

        {screen === 'LEVEL_INTRO' && (
          <LevelIntroScreen
            level={activeLevelConfig}
            record={saveData.levelRecords[activeLevelConfig.level]}
            onStartLevel={handleStartLevel}
            onBackToMap={() => setScreen('MAP')}
          />
        )}

        {screen === 'RECIPE_BOOK' && (
          <RecipeBookScreen
            saveData={saveData}
            onUnlockRecipe={handleUnlockRecipe}
            onBuyUpgrade={handleBuyUpgrade}
          />
        )}

        {screen === 'RESULTS' && lastSummary && (
          <ResultsScreen
            summary={lastSummary}
            hasNextLevel={lastSummary.levelNumber < 14}
            onContinue={() =>
              handleOpenLevelIntro(Math.min(14, lastSummary.levelNumber + 1))
            }
            onReplay={handleStartLevel}
            onHome={() => setScreen('HOME')}
          />
        )}
      </main>

      {showDailyModal && (
        <DailyRewardsModal
          dailyRewards={saveData.dailyRewards}
          canClaim={canClaimDaily}
          onClaim={handleClaimDaily}
          onClose={() => setShowDailyModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
