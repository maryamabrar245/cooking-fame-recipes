import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Coins,
  Flame,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  CUSTOMER_ARCHETYPES,
  KITCHEN_BACKDROP_URL,
  RECIPES_CATALOG,
  TOPPINGS_CATALOG,
} from '../data/gameData';
import {
  ChefMood,
  CustomerOrder,
  DishBaseId,
  DrinkSlotState,
  GameSettings,
  GrillSlotState,
  KitchenUpgrades,
  LevelConfig,
  OrderItem,
  PlateState,
  RoundSummary,
  ToppingId,
} from '../types/game';
import { soundFX } from '../utils/sound';
import { ChefCoco } from './ChefCoco';
import { CustomerAvatar, DishSprite, DrinkGlassSprite } from './FoodGraphics';

interface GameplayScreenProps {
  level: LevelConfig;
  upgrades: KitchenUpgrades;
  settings: GameSettings;
  onToggleSound: () => void;
  onFinishRound: (summary: RoundSummary) => void;
  onRestart: () => void;
  onExitToMap: () => void;
}

type DragPayload =
  | { kind: 'raw'; dishId: DishBaseId }
  | { kind: 'cooked'; grillId: number }
  | { kind: 'burned'; grillId: number }
  | { kind: 'topping'; toppingId: ToppingId }
  | { kind: 'plate'; plateId: number }
  | { kind: 'drink'; drinkId: number };

interface FloatingPopup {
  id: number;
  text: string;
  slotIndex: number;
  tone: 'coin' | 'combo' | 'oops';
}

const BURN_LIMIT_SEC = 30;
const COMBO_WINDOW_MS = 7500;

const sameToppings = (a: ToppingId[], b: ToppingId[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((t, idx) => t === b[idx]);
};

const createCustomerOrder = (
  level: LevelConfig,
  slotIndex: number,
  patienceBonusSec: number
): CustomerOrder => {
  const archetypeId =
    level.customerTypes[Math.floor(Math.random() * level.customerTypes.length)] ??
    'regular';
  const archetype = CUSTOMER_ARCHETYPES[archetypeId] ?? CUSTOMER_ARCHETYPES.regular;

  const itemCount =
    level.maxOrderItems === 1
      ? 1
      : Math.random() < 0.55
        ? Math.min(level.maxOrderItems, 2)
        : level.maxOrderItems === 3 && Math.random() < 0.45
          ? 3
          : 1;

  const items: OrderItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    const recipeId =
      level.availableRecipes[
        Math.floor(Math.random() * level.availableRecipes.length)
      ] ?? 'sandwich';

    let toppings: ToppingId[] = [];
    if (recipeId === 'sandwich') {
      if (level.availableToppings.includes('tomato') && Math.random() < 0.68) {
        toppings = ['greens', 'tomato'];
      } else if (level.availableToppings.includes('greens')) {
        toppings = ['greens'];
      }
    } else if (recipeId === 'cake') {
      toppings = ['cream', 'strawberries'].filter((t) =>
        level.availableToppings.includes(t as ToppingId)
      ) as ToppingId[];
    } else if (recipeId === 'dates') {
      toppings = ['nuts', 'chocolate'].filter((t) =>
        level.availableToppings.includes(t as ToppingId)
      ) as ToppingId[];
    }

    items.push({ recipeId, toppings, fulfilled: false });
  }

  const maxPatience =
    (level.customerPatienceSec + patienceBonusSec) * archetype.patienceMultiplier;

  return {
    uid: `cust-${Date.now()}-${slotIndex}-${Math.random().toString(36).slice(2, 6)}`,
    slotIndex,
    archetype,
    items,
    patience: maxPatience,
    maxPatience,
    mood: 'happy',
  };
};

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  upgrades,
  settings,
  onToggleSound,
  onFinishRound,
  onRestart,
  onExitToMap,
}) => {
  const cookDuration = Math.max(1.7, 3.6 * (1 - upgrades.grillSpeedLevel * 0.2));
  const drinkDuration = Math.max(1.3, 3.0 * (1 - upgrades.drinkSpeedLevel * 0.25));
  const patienceBonusSec = upgrades.patienceLevel * 5;
  const totalPlateSlots = level.plateSlots + upgrades.plateCountBonus;

  const [timeRemaining, setTimeRemaining] = useState<number>(level.timeLimitSec);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctActions, setCorrectActions] = useState<number>(0);
  const [totalActions, setTotalActions] = useState<number>(0);
  const [burnedCount, setBurnedCount] = useState<number>(0);

  const [grills, setGrills] = useState<GrillSlotState[]>(() =>
    Array.from({ length: level.grillSlots }, (_, id) => ({
      id,
      dishId: null,
      status: 'empty',
      cookElapsed: 0,
      burnElapsed: 0,
    }))
  );

  const [plates, setPlates] = useState<PlateState[]>(() =>
    Array.from({ length: totalPlateSlots }, (_, id) => ({
      id,
      dishId: null,
      toppings: [],
    }))
  );

  const [drinks, setDrinks] = useState<DrinkSlotState[]>(() =>
    Array.from({ length: level.drinkSlots }, (_, id) => ({
      id,
      status: 'empty',
      brewElapsed: 0,
    }))
  );

  const [customers, setCustomers] = useState<(CustomerOrder | null)[]>(() => {
    const initial: (CustomerOrder | null)[] = Array.from(
      { length: level.maxConcurrentCustomers },
      () => null
    );
    initial[0] = createCustomerOrder(level, 0, patienceBonusSec);
    if (level.maxConcurrentCustomers > 1) {
      initial[1] = createCustomerOrder(level, 1, patienceBonusSec);
    }
    return initial;
  });

  const [selectedPlateId, setSelectedPlateId] = useState<number | null>(null);
  const [shakePlateId, setShakePlateId] = useState<number | null>(null);
  const [cocoMood, setCocoMood] = useState<ChefMood>('happy');
  const [cocoMessage, setCocoMessage] = useState<string>(
    level.isTutorial
      ? 'Tap or drag Brioche Bread onto the grill to start!'
      : `Welcome to ${level.locationName}! Serve ${level.targetOrders} orders before time runs out.`
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(settings.hintsEnabled);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  const lastServeTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const warnSoundCooldownRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);

  // Refs for latest stats when game finishes inside interval
  const statsRef = useRef({
    completedOrders,
    coinsEarned,
    correctActions,
    totalActions,
    burnedCount,
    maxCombo,
    timeRemaining,
  });
  statsRef.current = {
    completedOrders,
    coinsEarned,
    correctActions,
    totalActions,
    burnedCount,
    maxCombo,
    timeRemaining,
  };

  const triggerCoco = useCallback((mood: ChefMood, message: string) => {
    setCocoMood(mood);
    setCocoMessage(message);
  }, []);

  const spawnPopup = useCallback(
    (slotIndex: number, text: string, tone: 'coin' | 'combo' | 'oops') => {
      const id = Date.now() + Math.random();
      setPopups((prev) => [...prev, { id, slotIndex, text, tone }]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 850);
    },
    []
  );

  const triggerShakePlate = useCallback((plateId: number) => {
    setShakePlateId(plateId);
    setTimeout(() => setShakePlateId(null), 360);
  }, []);

  const finalizeRound = useCallback(
    (passed: boolean, timeLeft: number, finalOrders: number, finalCoins: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      const s = statsRef.current;
      const timeBonus = passed ? Math.round(timeLeft) : 0;
      const totalRoundCoins = finalCoins + timeBonus;
      const acc =
        s.totalActions === 0
          ? 100
          : Math.max(0, Math.min(100, Math.round((s.correctActions / s.totalActions) * 100)));

      const stars: 0 | 1 | 2 | 3 = !passed
        ? 0
        : totalRoundCoins >= level.starThresholds[2]
          ? 3
          : totalRoundCoins >= level.starThresholds[1]
            ? 2
            : 1;

      if (passed) {
        soundFX.playVictory();
      } else {
        soundFX.playOops();
      }

      onFinishRound({
        levelNumber: level.level,
        passed,
        completedOrders: finalOrders,
        targetOrders: level.targetOrders,
        accuracy: acc,
        timeRemaining: Math.max(0, Math.ceil(timeLeft)),
        coinsEarned: totalRoundCoins,
        stars,
        burnedCount: s.burnedCount,
        maxCombo: s.maxCombo,
      });
    },
    [level, onFinishRound]
  );

  // Main 100ms simulation loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (finishedRef.current) return;
      const dt = 0.1;

      // 1. Countdown Timer
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - dt);
        if (next <= 0) {
          const s = statsRef.current;
          const passed = s.completedOrders >= level.targetOrders;
          setTimeout(
            () => finalizeRound(passed, 0, s.completedOrders, s.coinsEarned),
            50
          );
        }
        return next;
      });

      // 2. Grill cooking & 30s burn timer
      setGrills((prevGrills) => {
        let dinged = false;
        let burnedNow = false;
        let warningActive = false;

        const updated = prevGrills.map((g) => {
          if (g.status === 'cooking') {
            const nextCook = g.cookElapsed + dt;
            if (nextCook >= cookDuration) {
              dinged = true;
              return {
                ...g,
                status: 'cooked' as const,
                cookElapsed: cookDuration,
                burnElapsed: 0,
              };
            }
            return { ...g, cookElapsed: nextCook };
          }

          if (g.status === 'cooked') {
            const nextBurn = g.burnElapsed + dt;
            if (nextBurn >= BURN_LIMIT_SEC) {
              burnedNow = true;
              return {
                ...g,
                status: 'burned' as const,
                burnElapsed: BURN_LIMIT_SEC,
              };
            }
            if (BURN_LIMIT_SEC - nextBurn <= 7) {
              warningActive = true;
            }
            return { ...g, burnElapsed: nextBurn };
          }

          return g;
        });

        if (dinged) {
          soundFX.playCookedDing();
        }
        if (warningActive && Date.now() - warnSoundCooldownRef.current > 2400) {
          warnSoundCooldownRef.current = Date.now();
          soundFX.playBurnWarning();
          triggerCoco('oops', 'Hurry! Food on the grill burns in a few seconds!');
        }
        if (burnedNow) {
          soundFX.playBurnt();
          setBurnedCount((b) => b + 1);
          setTotalActions((t) => t + 1);
          triggerCoco('oops', 'Oh no, it burned after 30s! Toss it in the Trash Bin.');
        }

        return updated;
      });

      // 3. Drink dispenser progress
      setDrinks((prevDrinks) => {
        let readyDing = false;
        const nextDrinks = prevDrinks.map((d) => {
          if (d.status !== 'brewing') return d;
          const nextElapsed = d.brewElapsed + dt;
          if (nextElapsed >= drinkDuration) {
            readyDing = true;
            return { ...d, status: 'ready' as const, brewElapsed: drinkDuration };
          }
          return { ...d, brewElapsed: nextElapsed };
        });
        if (readyDing) soundFX.playCookedDing();
        return nextDrinks;
      });

      // 4. Customer patience & automatic seat refills
      spawnTimerRef.current += dt;
      setCustomers((prevCusts) => {
        let lostGuest = false;
        let nextCusts: (CustomerOrder | null)[] = prevCusts.map((c) => {
          if (!c) return null;
          if (c.mood === 'delighted') return c;
          const nextPatience = c.patience - dt;
          if (nextPatience <= 0) {
            lostGuest = true;
            return null;
          }
          const ratio = nextPatience / c.maxPatience;
          const mood: CustomerOrder['mood'] =
            ratio > 0.55 ? 'happy' : ratio > 0.25 ? 'waiting' : 'impatient';
          return { ...c, patience: nextPatience, mood };
        });

        if (lostGuest) {
          soundFX.playOops();
          setCombo(0);
          setTotalActions((t) => t + 1);
          triggerCoco('oops', 'A customer left waiting! Keep those orders moving.');
        }

        if (spawnTimerRef.current >= 1.6) {
          const emptyIdx = nextCusts.findIndex((c) => c === null);
          if (emptyIdx !== -1) {
            spawnTimerRef.current = 0;
            nextCusts = nextCusts.map((c, idx) =>
              idx === emptyIdx ? createCustomerOrder(level, emptyIdx, patienceBonusSec) : c
            );
          }
        }

        return nextCusts;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [
    cookDuration,
    drinkDuration,
    finalizeRound,
    isPaused,
    level,
    patienceBonusSec,
    triggerCoco,
  ]);

  // --- Gameplay Actions ---

  const startCookingDish = (dishId: DishBaseId, targetGrillId?: number) => {
    const slot =
      targetGrillId !== undefined
        ? grills.find((g) => g.id === targetGrillId && g.status === 'empty')
        : grills.find((g) => g.status === 'empty');

    if (!slot) {
      soundFX.playOops();
      triggerCoco('oops', 'All grill slots are busy! Plate cooked food first.');
      return;
    }

    soundFX.playSizzle();
    setCorrectActions((c) => c + 1);
    setTotalActions((t) => t + 1);
    setGrills((prev) =>
      prev.map((g) =>
        g.id === slot.id
          ? { ...g, dishId, status: 'cooking', cookElapsed: 0, burnElapsed: 0 }
          : g
      )
    );
    triggerCoco('cooking', `Cooking ${RECIPES_CATALOG[dishId].shortTitle}—don't let it burn!`);
  };

  const plateFromGrill = (grillId: number, targetPlateId?: number) => {
    const grill = grills.find((g) => g.id === grillId);
    if (!grill || !grill.dishId) return;

    if (grill.status === 'burned') {
      discardGrillSlot(grillId);
      return;
    }
    if (grill.status !== 'cooked') {
      soundFX.playOops();
      triggerCoco('oops', 'Wait for it to finish cooking first!');
      return;
    }

    const plate =
      targetPlateId !== undefined
        ? plates.find((p) => p.id === targetPlateId && p.dishId === null)
        : plates.find((p) => p.dishId === null);

    if (!plate) {
      soundFX.playOops();
      triggerCoco('oops', 'No empty plates! Serve or clear a plate first.');
      return;
    }

    soundFX.playPop(560);
    setCorrectActions((c) => c + 1);
    setTotalActions((t) => t + 1);
    setPlates((prev) =>
      prev.map((p) =>
        p.id === plate.id ? { ...p, dishId: grill.dishId, toppings: [] } : p
      )
    );
    setGrills((prev) =>
      prev.map((g) =>
        g.id === grillId
          ? { ...g, dishId: null, status: 'empty', cookElapsed: 0, burnElapsed: 0 }
          : g
      )
    );
    setSelectedPlateId(plate.id);
    triggerCoco('happy', `Plated ${RECIPES_CATALOG[grill.dishId].shortTitle}! Add toppings in order.`);
  };

  const discardGrillSlot = (grillId: number) => {
    const grill = grills.find((g) => g.id === grillId);
    if (!grill || grill.status === 'empty') return;
    soundFX.playTrash();
    setGrills((prev) =>
      prev.map((g) =>
        g.id === grillId
          ? { ...g, dishId: null, status: 'empty', cookElapsed: 0, burnElapsed: 0 }
          : g
      )
    );
    triggerCoco('idle', 'Cleared the grill! Ready for a fresh cook.');
  };

  const discardPlate = (plateId: number) => {
    const plate = plates.find((p) => p.id === plateId);
    if (!plate || !plate.dishId) return;
    soundFX.playTrash();
    setPlates((prev) =>
      prev.map((p) => (p.id === plateId ? { ...p, dishId: null, toppings: [] } : p))
    );
    if (selectedPlateId === plateId) setSelectedPlateId(null);
    triggerCoco('idle', 'Cleared that plate for a fresh dish.');
  };

  const applyToppingToPlate = (toppingId: ToppingId, explicitPlateId?: number) => {
    let targetPlate: PlateState | undefined;

    if (explicitPlateId !== undefined) {
      targetPlate = plates.find((p) => p.id === explicitPlateId);
    } else if (selectedPlateId !== null) {
      targetPlate = plates.find((p) => p.id === selectedPlateId && p.dishId !== null);
    }

    if (!targetPlate || !targetPlate.dishId) {
      targetPlate = plates.find((p) => p.dishId !== null);
    }

    if (!targetPlate || !targetPlate.dishId) {
      soundFX.playOops();
      triggerCoco('oops', 'Plate a cooked dish first before adding toppings!');
      return;
    }

    const dishId = targetPlate.dishId;
    const recipe = RECIPES_CATALOG[dishId];
    const validSequence = recipe.requiredToppingsOrder.filter((t) =>
      level.availableToppings.includes(t)
    );

    // 1. Check if topping belongs to this recipe
    if (!validSequence.includes(toppingId)) {
      soundFX.playOops();
      setTotalActions((t) => t + 1);
      setCombo(0);
      triggerShakePlate(targetPlate.id);
      triggerCoco(
        'oops',
        `Oops! ${TOPPINGS_CATALOG[toppingId].name} doesn't go on ${recipe.shortTitle}!`
      );
      return;
    }

    // 2. Check duplicate
    if (targetPlate.toppings.includes(toppingId)) {
      soundFX.playOops();
      triggerShakePlate(targetPlate.id);
      triggerCoco('oops', `${TOPPINGS_CATALOG[toppingId].name} is already on this plate!`);
      return;
    }

    // 3. Check exact required order!
    const expectedNextTopping = validSequence[targetPlate.toppings.length];
    if (toppingId !== expectedNextTopping) {
      soundFX.playOops();
      setTotalActions((t) => t + 1);
      setCombo(0);
      triggerShakePlate(targetPlate.id);
      triggerCoco(
        'oops',
        `Wrong order! Add ${TOPPINGS_CATALOG[expectedNextTopping].name} FIRST before ${TOPPINGS_CATALOG[toppingId].name}!`
      );
      return;
    }

    soundFX.playPop(620);
    setCorrectActions((c) => c + 1);
    setTotalActions((t) => t + 1);
    const updatedToppings = [...targetPlate.toppings, toppingId];
    setPlates((prev) =>
      prev.map((p) =>
        p.id === targetPlate!.id ? { ...p, toppings: updatedToppings } : p
      )
    );
    setSelectedPlateId(targetPlate.id);
    triggerCoco('happy', `Added ${TOPPINGS_CATALOG[toppingId].name}!`);
  };

  const startBrewDrink = (drinkId: number) => {
    const slot = drinks.find((d) => d.id === drinkId);
    if (!slot || slot.status !== 'empty') return;
    soundFX.playPop(480);
    setCorrectActions((c) => c + 1);
    setTotalActions((t) => t + 1);
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, status: 'brewing', brewElapsed: 0 } : d
      )
    );
    triggerCoco('cooking', 'Blending fresh Sunset Citrus Juice!');
  };

  const completeServe = (
    customerIdx: number,
    itemIndex: number,
    recipeId: 'sandwich' | 'cake' | 'dates' | 'juice',
    toppings: ToppingId[],
    cleanupSource: () => void
  ) => {
    const cust = customers[customerIdx];
    if (!cust) return;

    const now = Date.now();
    const isCombo = now - lastServeTimeRef.current <= COMBO_WINDOW_MS;
    lastServeTimeRef.current = now;
    const nextCombo = isCombo ? combo + 1 : 1;
    setCombo(nextCombo);
    setMaxCombo((m) => Math.max(m, nextCombo));

    const basePrice = RECIPES_CATALOG[recipeId].basePrice;
    const toppingBonus = toppings.reduce(
      (sum, t) => sum + TOPPINGS_CATALOG[t].priceBonus,
      0
    );
    const comboBonus = nextCombo > 1 ? (nextCombo - 1) * 5 : 0;
    const earned = basePrice + toppingBonus + comboBonus;

    soundFX.playCashRegister();
    cleanupSource();
    setCorrectActions((c) => c + 1);
    setTotalActions((t) => t + 1);

    const newCoinsTotal = coinsEarned + earned;
    setCoinsEarned(newCoinsTotal);
    spawnPopup(
      customerIdx,
      nextCombo > 1 ? `+${earned} (${nextCombo}x!)` : `+${earned}`,
      nextCombo > 1 ? 'combo' : 'coin'
    );

    const updatedItems = cust.items.map((it, idx) =>
      idx === itemIndex ? { ...it, fulfilled: true } : it
    );
    const allFulfilled = updatedItems.every((it) => it.fulfilled);

    if (allFulfilled) {
      const nextCompleted = completedOrders + 1;
      setCompletedOrders(nextCompleted);
      triggerCoco(
        'excited',
        nextCombo > 1
          ? `Order complete! ${nextCombo}x Combo streak!`
          : `Yay! ${cust.archetype.name} loved their order!`
      );

      // Show delighted guest briefly then clear seat
      setCustomers((prev) =>
        prev.map((c, idx) =>
          idx === customerIdx
            ? c
              ? { ...c, items: updatedItems, mood: 'delighted' }
              : null
            : c
        )
      );

      setTimeout(() => {
        setCustomers((prev) =>
          prev.map((c, idx) => (idx === customerIdx && c?.uid === cust.uid ? null : c))
        );
      }, 450);

      if (nextCompleted >= level.targetOrders) {
        setTimeout(() => {
          finalizeRound(
            true,
            statsRef.current.timeRemaining,
            nextCompleted,
            newCoinsTotal
          );
        }, 550);
      }
    } else {
      setCustomers((prev) =>
        prev.map((c, idx) =>
          idx === customerIdx && c ? { ...c, items: updatedItems } : c
        )
      );
      triggerCoco('happy', 'Nice serve! Finish the rest of their order.');
    }
  };

  const servePlateToCustomer = (plateId: number, explicitCustomerIdx?: number) => {
    const plate = plates.find((p) => p.id === plateId);
    if (!plate || !plate.dishId) return;

    const candidates =
      explicitCustomerIdx !== undefined
        ? [explicitCustomerIdx]
        : customers.map((_, idx) => idx);

    for (const cIdx of candidates) {
      const cust = customers[cIdx];
      if (!cust) continue;
      const matchItemIdx = cust.items.findIndex(
        (it) =>
          !it.fulfilled &&
          it.recipeId === plate.dishId &&
          sameToppings(it.toppings, plate.toppings)
      );
      if (matchItemIdx !== -1) {
        completeServe(cIdx, matchItemIdx, plate.dishId, plate.toppings, () => {
          setPlates((prev) =>
            prev.map((p) =>
              p.id === plateId ? { ...p, dishId: null, toppings: [] } : p
            )
          );
          if (selectedPlateId === plateId) setSelectedPlateId(null);
        });
        return;
      }
    }

    // No match found
    soundFX.playOops();
    setTotalActions((t) => t + 1);
    triggerShakePlate(plateId);
    triggerCoco(
      'oops',
      'No guest wants that exact topping combo yet—check the order tickets!'
    );
  };

  const serveDrinkToCustomer = (drinkId: number, explicitCustomerIdx?: number) => {
    const drink = drinks.find((d) => d.id === drinkId);
    if (!drink || drink.status !== 'ready') return;

    const candidates =
      explicitCustomerIdx !== undefined
        ? [explicitCustomerIdx]
        : customers.map((_, idx) => idx);

    for (const cIdx of candidates) {
      const cust = customers[cIdx];
      if (!cust) continue;
      const matchItemIdx = cust.items.findIndex(
        (it) => !it.fulfilled && it.recipeId === 'juice'
      );
      if (matchItemIdx !== -1) {
        completeServe(cIdx, matchItemIdx, 'juice', [], () => {
          setDrinks((prev) =>
            prev.map((d) =>
              d.id === drinkId ? { ...d, status: 'empty', brewElapsed: 0 } : d
            )
          );
        });
        return;
      }
    }

    soundFX.playOops();
    triggerCoco('oops', 'No guest is asking for Sunset Citrus Juice right now!');
  };

  const handleCustomerClick = (cIdx: number) => {
    if (selectedPlateId !== null) {
      const p = plates.find((pl) => pl.id === selectedPlateId && pl.dishId !== null);
      if (p) {
        servePlateToCustomer(p.id, cIdx);
        return;
      }
    }

    // Otherwise try any matching plate or ready drink automatically
    const cust = customers[cIdx];
    if (!cust) return;
    for (const plate of plates) {
      if (!plate.dishId) continue;
      const match = cust.items.some(
        (it) =>
          !it.fulfilled &&
          it.recipeId === plate.dishId &&
          sameToppings(it.toppings, plate.toppings)
      );
      if (match) {
        servePlateToCustomer(plate.id, cIdx);
        return;
      }
    }
    const readyDrink = drinks.find((d) => d.status === 'ready');
    if (
      readyDrink &&
      cust.items.some((it) => !it.fulfilled && it.recipeId === 'juice')
    ) {
      serveDrinkToCustomer(readyDrink.id, cIdx);
    }
  };

  // --- Drag & Drop Handlers ---
  const setDragData = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const parseDragData = (e: React.DragEvent): DragPayload | null => {
    try {
      const raw = e.dataTransfer.getData('text/plain');
      return raw ? (JSON.parse(raw) as DragPayload) : null;
    } catch {
      return null;
    }
  };

  // --- Dynamic Step Hint ---
  const smartHint = useMemo(() => {
    const burned = grills.find((g) => g.status === 'burned');
    if (burned) return 'Tap or drag burned food to the Trash Bin!';

    const cooked = grills.find((g) => g.status === 'cooked');
    if (cooked) {
      return `Tap or drag cooked ${RECIPES_CATALOG[cooked.dishId!].shortTitle} onto a Serving Plate before 30s!`;
    }

    for (const plate of plates) {
      if (!plate.dishId) continue;
      const readyForCustomer = customers.some(
        (c) =>
          c &&
          c.items.some(
            (it) =>
              !it.fulfilled &&
              it.recipeId === plate.dishId &&
              sameToppings(it.toppings, plate.toppings)
          )
      );
      if (readyForCustomer) {
        return `Your ${RECIPES_CATALOG[plate.dishId].shortTitle} is ready! Tap the plate or drag it to the guest.`;
      }

      const seq = RECIPES_CATALOG[plate.dishId].requiredToppingsOrder.filter((t) =>
        level.availableToppings.includes(t)
      );
      const nextTop = seq[plate.toppings.length];
      if (nextTop) {
        return `Next step: Add ${TOPPINGS_CATALOG[nextTop].name} onto your plated ${RECIPES_CATALOG[plate.dishId].shortTitle}!`;
      }
    }

    const readyJuice = drinks.find((d) => d.status === 'ready');
    if (
      readyJuice &&
      customers.some((c) => c && c.items.some((it) => !it.fulfilled && it.recipeId === 'juice'))
    ) {
      return 'Sunset Citrus Juice is ready! Tap the glass or drag it to the guest.';
    }

    const wantsJuice = customers.some(
      (c) => c && c.items.some((it) => !it.fulfilled && it.recipeId === 'juice')
    );
    if (wantsJuice && drinks.some((d) => d.status === 'empty')) {
      return 'Tap the Juice Dispenser to brew Sunset Citrus Juice!';
    }

    return 'Pick an ingredient from the Raw Food Drawer (tap or drag to grill) to cook!';
  }, [customers, drinks, grills, level.availableToppings, plates]);

  const rawCookableDishes: DishBaseId[] = (['sandwich', 'cake', 'dates'] as DishBaseId[]).filter(
    (d) => level.availableRecipes.includes(d)
  );

  const progressPct = Math.min(
    100,
    Math.round((completedOrders / Math.max(1, level.targetOrders)) * 100)
  );
  const timerCeil = Math.ceil(timeRemaining);
  const timerStr = `${Math.floor(timerCeil / 60)}:${(timerCeil % 60)
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED] text-[#2D221E] relative overflow-x-hidden">
      {/* Subtle Background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <img
          src={KITCHEN_BACKDROP_URL}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Top Gameplay HUD */}
      <header className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playPop(460);
                setIsPaused(true);
              }}
              aria-label="Pause level"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-5 h-5 text-stone-700" />
            </button>
            <div>
              <p className="text-[11px] font-bold text-rose-600 leading-none">
                Level {level.level} · {level.locationName}
              </p>
              <p className="font-display font-extrabold text-sm sm:text-base text-[#2D221E] leading-tight">
                {level.title}
              </p>
            </div>
          </div>

          {/* Progress Bar + Timer + Coins + Combo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Orders Progress Bar */}
            <div className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 min-w-[130px] sm:min-w-[170px]">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1 tabular-nums">
                <span className="flex items-center gap-1 text-stone-600">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  Orders
                </span>
                <span className="text-[#2D221E]">
                  {completedOrders}/{level.targetOrders}
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Coins */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 font-display font-extrabold text-sm text-amber-900 tabular-nums">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{coinsEarned}</span>
              <span className="text-[10px] font-semibold text-amber-700">
                /{level.targetCoins}
              </span>
            </div>

            {/* Countdown Timer */}
            <div
              className={`rounded-xl px-3 py-1.5 border font-display font-extrabold text-sm flex items-center gap-1.5 tabular-nums ${
                timerCeil <= 18
                  ? 'bg-red-100 border-red-300 text-red-700 animate-sizzle'
                  : 'bg-white border-stone-200 text-[#2D221E]'
              }`}
            >
              <Clock className="w-4 h-4 text-rose-500" />
              <span>{timerStr}</span>
            </div>

            {combo > 1 && (
              <div className="rounded-xl px-2.5 py-1.5 bg-orange-500 text-white font-display font-extrabold text-xs flex items-center gap-1 tabular-nums">
                <Flame className="w-3.5 h-3.5" />
                {combo}x Combo
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                soundFX.playPop(500);
                setShowHints((h) => !h);
              }}
              aria-label="Toggle step hints"
              title="Toggle helpful hints"
              className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center cursor-pointer ${
                showHints
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-stone-200 flex items-center justify-center cursor-pointer"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Playfield */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4 flex-1 flex flex-col gap-3">
        {/* Helpful Hint Bar */}
        {(showHints || level.isTutorial) && (
          <div className="bg-amber-50/95 border border-amber-300 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2 shadow-xs">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{smartHint}</span>
          </div>
        )}

        {/* Dining Counter: Chef Coco + Customer Seats */}
        <section className="bg-white/90 backdrop-blur-xs rounded-3xl border border-stone-200 p-3 sm:p-4 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <ChefCoco
              mood={cocoMood}
              size="sm"
              bubblePosition="right"
              isActionActive={grills.some((g) => g.status === 'cooking')}
              dialogue={cocoMessage}
            />
          </div>

          <div
            className={`lg:col-span-8 grid gap-2.5 ${
              level.maxConcurrentCustomers <= 2
                ? 'grid-cols-2'
                : level.maxConcurrentCustomers === 3
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {customers.map((cust, cIdx) => {
              const slotPopups = popups.filter((p) => p.slotIndex === cIdx);

              return (
                <div
                  key={cIdx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const payload = parseDragData(e);
                    if (!payload) return;
                    if (payload.kind === 'plate') {
                      servePlateToCustomer(payload.plateId, cIdx);
                    } else if (payload.kind === 'drink') {
                      serveDrinkToCustomer(payload.drinkId, cIdx);
                    }
                  }}
                  onClick={() => handleCustomerClick(cIdx)}
                  className={`relative rounded-2xl border-2 p-2.5 min-h-[146px] flex flex-col justify-between transition-all ${
                    cust
                      ? 'bg-[#FFFDF9] border-amber-200 hover:border-rose-400 cursor-pointer shadow-xs'
                      : 'bg-stone-50/70 border-dashed border-stone-200 items-center justify-center'
                  }`}
                >
                  {/* Floating Coin/Combo Popups */}
                  {slotPopups.map((pop) => (
                    <span
                      key={pop.id}
                      className={`animate-coin-float absolute left-1/2 top-2 z-20 px-2.5 py-0.5 rounded-full text-xs font-extrabold whitespace-nowrap shadow-sm ${
                        pop.tone === 'combo'
                          ? 'bg-orange-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {pop.text}
                    </span>
                  ))}

                  {!cust ? (
                    <span className="text-[11px] font-semibold text-stone-400 text-center">
                      Seat Open...
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="scale-90 -ml-1">
                          <CustomerAvatar type={cust.archetype.avatarType} mood={cust.mood} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#2D221E] truncate">
                            {cust.archetype.name}
                          </p>
                          {/* Patience Bar */}
                          <div className="h-2 rounded-full bg-stone-200 overflow-hidden mt-1">
                            <div
                              className={`h-full transition-all duration-150 ${
                                cust.mood === 'impatient'
                                  ? 'bg-red-500'
                                  : cust.mood === 'waiting'
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(100, (cust.patience / cust.maxPatience) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Order Ticket Items */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cust.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`relative rounded-xl border px-1.5 py-1 flex items-center gap-1 ${
                              item.fulfilled
                                ? 'bg-emerald-50 border-emerald-300 opacity-60'
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            {item.recipeId === 'juice' ? (
                              <DrinkGlassSprite size="sm" />
                            ) : (
                              <DishSprite
                                dishId={item.recipeId}
                                toppings={item.toppings}
                                size="sm"
                              />
                            )}
                            {item.toppings.length > 0 && (
                              <div className="flex flex-col text-[11px] leading-none">
                                {item.toppings.map((t, tIdx) => (
                                  <span key={tIdx} title={TOPPINGS_CATALOG[t].name}>
                                    {TOPPINGS_CATALOG[t].emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.fulfilled && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Kitchen Counter Workstation */}
        <section className="arcade-counter-surface rounded-3xl border-2 border-stone-300 p-3 sm:p-5 flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left: Grill / Oven + Juice Dispenser */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Grill Chassis */}
              <div className="arcade-grill-chassis rounded-2xl p-3 text-white">
                <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-300" />
                    Hot Grill &amp; Oven
                  </span>
                  <span className="text-[11px] text-rose-100">
                    Burns at 30s!
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {grills.map((g) => {
                    const burnLeft = Math.max(0, Math.ceil(BURN_LIMIT_SEC - g.burnElapsed));
                    const isDanger = g.status === 'cooked' && burnLeft <= 7;

                    return (
                      <button
                        key={g.id}
                        type="button"
                        draggable={g.status === 'cooked' || g.status === 'burned'}
                        onDragStart={(e) => {
                          if (g.status === 'cooked') {
                            setDragData(e, { kind: 'cooked', grillId: g.id });
                          } else if (g.status === 'burned') {
                            setDragData(e, { kind: 'burned', grillId: g.id });
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const payload = parseDragData(e);
                          if (payload?.kind === 'raw') {
                            startCookingDish(payload.dishId, g.id);
                          }
                        }}
                        onClick={() => {
                          if (g.status === 'cooked') {
                            plateFromGrill(g.id);
                          } else if (g.status === 'burned') {
                            discardGrillSlot(g.id);
                          }
                        }}
                        className={`relative min-h-[88px] rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                          g.status === 'empty'
                            ? 'bg-stone-900/60 border-stone-700/80 text-stone-300'
                            : g.status === 'cooking'
                              ? 'bg-stone-800 border-amber-400 animate-sizzle cursor-wait'
                              : g.status === 'cooked'
                                ? isDanger
                                  ? 'bg-amber-900/90 border-red-400 animate-burn-flash cursor-pointer'
                                  : 'bg-amber-950/75 border-emerald-400 cursor-pointer'
                                : 'bg-stone-950 border-red-600 cursor-pointer'
                        }`}
                      >
                        {g.status === 'empty' && (
                          <span className="text-[11px] font-semibold text-stone-400">
                            Burner {g.id + 1}
                          </span>
                        )}

                        {g.dishId && (
                          <DishSprite dishId={g.dishId} status={g.status} size="sm" />
                        )}

                        {g.status === 'cooking' && (
                          <div className="w-full mt-1">
                            <div className="h-1.5 rounded-full bg-stone-700 overflow-hidden">
                              <div
                                className="h-full bg-amber-400"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (g.cookElapsed / cookDuration) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {g.status === 'cooked' && (
                          <span
                            className={`mt-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded tabular-nums ${
                              isDanger
                                ? 'bg-red-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            Ready · {burnLeft}s
                          </span>
                        )}

                        {g.status === 'burned' && (
                          <span className="mt-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-700 text-white flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Burned!
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Juice Dispenser */}
              {drinks.length > 0 && (
                <div className="bg-sky-900 text-white rounded-2xl border-2 border-sky-950 p-3">
                  <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                    <span>Sunset Juice Dispenser</span>
                    <span className="text-[11px] text-sky-200">Tap to Brew / Serve</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {drinks.map((d) => {
                      const fillRatio =
                        d.status === 'ready'
                          ? 1
                          : d.status === 'brewing'
                            ? d.brewElapsed / drinkDuration
                            : 0;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          draggable={d.status === 'ready'}
                          onDragStart={(e) => {
                            if (d.status === 'ready') {
                              setDragData(e, { kind: 'drink', drinkId: d.id });
                            }
                          }}
                          onClick={() => {
                            if (d.status === 'empty') {
                              startBrewDrink(d.id);
                            } else if (d.status === 'ready') {
                              serveDrinkToCustomer(d.id);
                            }
                          }}
                          className={`min-h-[76px] rounded-xl border-2 flex items-center justify-center gap-2 p-2 cursor-pointer transition-all ${
                            d.status === 'ready'
                              ? 'bg-sky-700 border-emerald-300 shadow-sm'
                              : d.status === 'brewing'
                                ? 'bg-sky-800 border-amber-300 animate-sizzle'
                                : 'bg-sky-950/60 border-sky-700 hover:bg-sky-800/70'
                          }`}
                        >
                          <DrinkGlassSprite size="sm" filling={fillRatio} />
                          <span className="text-[11px] font-bold">
                            {d.status === 'empty'
                              ? 'Brew Juice'
                              : d.status === 'brewing'
                                ? 'Brewing...'
                                : 'Tap to Serve!'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Serving Plates & Topping Bowls */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3">
              {/* Serving Plates */}
              <div className="bg-white/95 rounded-2xl border-2 border-stone-300 p-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-700 mb-2">
                  <span>Serving Plates (Tap or Drag to Customer)</span>
                  <span className="text-[11px] text-stone-500">
                    Click a plate to select
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {plates.map((plate) => {
                    const isSelected = selectedPlateId === plate.id;
                    const isShaking = shakePlateId === plate.id;

                    return (
                      <button
                        key={plate.id}
                        type="button"
                        draggable={plate.dishId !== null}
                        onDragStart={(e) => {
                          if (plate.dishId) {
                            setDragData(e, { kind: 'plate', plateId: plate.id });
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const payload = parseDragData(e);
                          if (!payload) return;
                          if (payload.kind === 'cooked') {
                            plateFromGrill(payload.grillId, plate.id);
                          } else if (payload.kind === 'topping') {
                            applyToppingToPlate(payload.toppingId, plate.id);
                          }
                        }}
                        onClick={() => {
                          if (!plate.dishId) return;
                          // If clicking already-selected plate OR plate matches a waiting guest, try serving!
                          const matchesSomeone = customers.some(
                            (c) =>
                              c &&
                              c.items.some(
                                (it) =>
                                  !it.fulfilled &&
                                  it.recipeId === plate.dishId &&
                                  sameToppings(it.toppings, plate.toppings)
                              )
                          );
                          if (matchesSomeone) {
                            servePlateToCustomer(plate.id);
                          } else {
                            setSelectedPlateId(plate.id);
                            soundFX.playPop(500);
                          }
                        }}
                        className={`min-h-[96px] rounded-2xl border-2 p-2 flex flex-col items-center justify-center transition-all ${
                          isShaking ? 'animate-shake-error border-red-500 bg-red-50' : ''
                        } ${
                          plate.dishId
                            ? isSelected
                              ? 'bg-rose-50 border-rose-500 shadow-sm cursor-pointer'
                              : 'bg-[#FFFDF9] border-amber-300 hover:border-rose-400 cursor-pointer'
                            : 'bg-stone-100 border-dashed border-stone-300 text-stone-400'
                        }`}
                      >
                        {!plate.dishId ? (
                          <span className="text-[11px] font-semibold">
                            Empty Plate
                          </span>
                        ) : (
                          <>
                            <DishSprite
                              dishId={plate.dishId}
                              status="cooked"
                              toppings={plate.toppings}
                              size="md"
                            />
                            <span className="text-[10px] font-bold text-stone-700 mt-0.5 truncate max-w-full">
                              {RECIPES_CATALOG[plate.dishId].shortTitle}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topping Bowls */}
              <div className="bg-white/95 rounded-2xl border-2 border-stone-300 p-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-700 mb-2">
                  <span>Toppings &amp; Sauces (Follow Recipe Order!)</span>
                  <span className="text-[11px] text-rose-600">Tap or Drag onto Plate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {level.availableToppings.map((tId) => {
                    const top = TOPPINGS_CATALOG[tId];
                    return (
                      <button
                        key={tId}
                        type="button"
                        draggable
                        onDragStart={(e) =>
                          setDragData(e, { kind: 'topping', toppingId: tId })
                        }
                        onClick={() => applyToppingToPlate(tId)}
                        style={{ backgroundColor: top.bowlBg }}
                        className="min-h-[52px] px-3 py-2 rounded-xl border-2 border-stone-300 hover:border-rose-500 flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-transform"
                      >
                        <span className="text-xl shrink-0">{top.emoji}</span>
                        <span className="font-bold text-xs text-[#2D221E] leading-tight">
                          {top.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Strip: Raw Food Drawer + Trash Bin */}
          <div className="bg-[#5C3A21] text-white rounded-2xl border-2 border-[#3E2412] p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-extrabold text-amber-200 mr-1">
                Raw Drawer:
              </span>
              {rawCookableDishes.map((dishId) => {
                const recipe = RECIPES_CATALOG[dishId];
                return (
                  <button
                    key={dishId}
                    type="button"
                    draggable
                    onDragStart={(e) => setDragData(e, { kind: 'raw', dishId })}
                    onClick={() => startCookingDish(dishId)}
                    className="min-h-[54px] px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-white text-[#2D221E] border-2 border-amber-300 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                  >
                    <DishSprite dishId={dishId} status="cooking" size="sm" />
                    <div className="text-left">
                      <p className="font-display font-bold text-xs leading-tight">
                        {recipe.shortTitle}
                      </p>
                      <p className="text-[10px] text-stone-600">Tap / Drag</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trash Bin */}
            <button
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const payload = parseDragData(e);
                if (!payload) return;
                if (payload.kind === 'burned' || payload.kind === 'cooked') {
                  discardGrillSlot(payload.grillId);
                } else if (payload.kind === 'plate') {
                  discardPlate(payload.plateId);
                }
              }}
              onClick={() => {
                const burned = grills.find((g) => g.status === 'burned');
                if (burned) {
                  discardGrillSlot(burned.id);
                  return;
                }
                if (selectedPlateId !== null) {
                  discardPlate(selectedPlateId);
                }
              }}
              className="min-h-[54px] px-4 rounded-xl bg-stone-800 hover:bg-red-900 border-2 border-stone-600 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Trash Bin</span>
            </button>
          </div>
        </section>
      </main>

      {/* Pause Modal */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Game Paused"
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-2xl text-[#2D221E]">
                Kitchen Paused
              </h2>
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                aria-label="Resume game"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(580);
                  setIsPaused(false);
                }}
                className="arcade-btn-3d w-full min-h-[50px] rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Cooking</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(520);
                  onRestart();
                }}
                className="w-full min-h-[48px] rounded-2xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Level</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop(440);
                  onExitToMap();
                }}
                className="w-full min-h-[48px] rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-sm cursor-pointer"
              >
                Exit to Level Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
