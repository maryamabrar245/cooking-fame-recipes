export type AppScreen =
  | 'SPLASH'
  | 'HOME'
  | 'MAP'
  | 'LEVEL_INTRO'
  | 'PLAYING'
  | 'RESULTS'
  | 'RECIPE_BOOK';

export type DishBaseId = 'sandwich' | 'cake' | 'dates';
export type RecipeId = 'sandwich' | 'juice' | 'cake' | 'dates';

export type ToppingId =
  | 'greens'
  | 'tomato'
  | 'cream'
  | 'strawberries'
  | 'nuts'
  | 'chocolate';

export type ChefMood = 'idle' | 'happy' | 'excited' | 'oops' | 'cooking' | 'proud';

export type CookStatus = 'empty' | 'cooking' | 'cooked' | 'burned';
export type DrinkStatus = 'empty' | 'brewing' | 'ready';

export interface RecipeMeta {
  id: RecipeId;
  title: string;
  shortTitle: string;
  unlockLevel: number;
  unlockCost: number;
  category: string;
  imageUrl: string;
  description: string;
  stepSequence: string[];
  requiredToppingsOrder: ToppingId[]; // ordered sequence for validation
  basePrice: number;
}

export interface ToppingDef {
  id: ToppingId;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  bowlBg: string;
  priceBonus: number;
}

export interface CustomerArchetype {
  id: string;
  name: string;
  role: string;
  avatarType: number;
  patienceMultiplier: number;
}

export interface OrderItem {
  recipeId: RecipeId;
  toppings: ToppingId[];
  fulfilled: boolean;
}

export interface CustomerOrder {
  uid: string;
  slotIndex: number;
  archetype: CustomerArchetype;
  items: OrderItem[];
  patience: number;
  maxPatience: number;
  mood: 'happy' | 'waiting' | 'impatient' | 'delighted';
}

export interface GrillSlotState {
  id: number;
  dishId: DishBaseId | null;
  status: CookStatus;
  cookElapsed: number;
  burnElapsed: number; // burns at 30s
}

export interface PlateState {
  id: number;
  dishId: DishBaseId | null;
  toppings: ToppingId[];
}

export interface DrinkSlotState {
  id: number;
  status: DrinkStatus;
  brewElapsed: number;
}

export interface LevelConfig {
  level: number;
  locationName: string;
  title: string;
  description: string;
  isTutorial?: boolean;
  timeLimitSec: number;
  targetOrders: number;
  targetCoins: number;
  starThresholds: [number, number, number]; // coins for 1, 2, 3 stars
  availableRecipes: RecipeId[];
  availableToppings: ToppingId[];
  customerTypes: string[]; // archetype ids
  maxConcurrentCustomers: number;
  grillSlots: number;
  plateSlots: number;
  drinkSlots: number;
  customerPatienceSec: number;
  maxOrderItems: number;
}

export interface KitchenUpgrades {
  grillSpeedLevel: number; // 0..3
  plateCountBonus: number; // 0..2
  drinkSpeedLevel: number; // 0..2
  patienceLevel: number; // 0..2
}

export interface LevelProgressRecord {
  stars: 1 | 2 | 3;
  bestCoins: number;
  bestAccuracy: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  hintsEnabled: boolean;
}

export interface DailyRewardState {
  streakDay: number; // 0..6 (next day index to claim)
  lastClaimDate: string | null; // YYYY-MM-DD
}

export interface PlayerSaveData {
  coins: number;
  unlockedLevel: number;
  unlockedRecipes: RecipeId[];
  levelRecords: Record<number, LevelProgressRecord>;
  upgrades: KitchenUpgrades;
  settings: GameSettings;
  dailyRewards: DailyRewardState;
}

export interface RoundSummary {
  levelNumber: number;
  passed: boolean;
  completedOrders: number;
  targetOrders: number;
  accuracy: number; // 0..100
  timeRemaining: number;
  coinsEarned: number;
  stars: 0 | 1 | 2 | 3;
  burnedCount: number;
  maxCombo: number;
}
