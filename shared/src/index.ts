export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type WeatherType = 'Sunny' | 'Rainy' | 'Storm' | 'Snow' | 'Fog';
export type Direction = 'down' | 'up' | 'left' | 'right';
export type HairStyle = 'classic' | 'spiky' | 'long' | 'bob';

export type ZoneId =
  | 'farm'
  | 'village'
  | 'market'
  | 'community'
  | 'forest'
  | 'lake'
  | 'beach'
  | 'mountain'
  | 'mine'
  | 'secret';

export type SkillType = 'farming' | 'mining' | 'fishing' | 'foraging' | 'combat';

export type ItemCategory =
  | 'tool'
  | 'weapon'
  | 'armor'
  | 'seed'
  | 'crop'
  | 'animal_product'
  | 'fish'
  | 'ore'
  | 'gem'
  | 'forage'
  | 'consumable'
  | 'craftable'
  | 'gift';

export interface CharacterAppearance {
  name: string;
  farmName: string;
  skinColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
}

export interface SkillProgress {
  level: number;
  exp: number;
  nextLevelExp: number;
}

export type SkillsState = Record<SkillType, SkillProgress>;

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  level: number;
  exp: number;
  nextLevelExp: number;
  defense: number;
  attack: number;
  skills: SkillsState;
}

export interface WorldTime {
  season: Season;
  day: number; // 1-28
  year: number;
  hour: number; // 6-23
  minute: number; // 0-59
  weather: WeatherType;
  dayPhase: 'Morning' | 'Day' | 'Evening' | 'Night';
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  timeScale: number;
  showMobileControls: 'auto' | 'always' | 'hidden';
}

export interface ItemDefinition {
  id: string;
  name: string;
  nameTh: string;
  category: ItemCategory;
  description: string;
  buyPrice?: number;
  sellPrice: number;
  color: string;
  accentColor?: string;
  icon: string;
  stackable: boolean;
  cropId?: string;
  energyRestore?: number;
  hpRestore?: number;
  attackBonus?: number;
  defenseBonus?: number;
  toolType?: 'hoe' | 'watering_can' | 'scythe' | 'pickaxe' | 'fishing_rod' | 'sword' | 'bow' | 'staff';
  tier?: number;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export interface CropDefinition {
  id: string;
  seedId: string;
  harvestItemId: string;
  name: string;
  nameTh: string;
  seasons: Season[];
  growthDays: number; // total days to mature (stages 0..3)
  seedPrice: number;
  sellPrice: number;
  regrowDays?: number;
  color: string;
  accentColor: string;
}

export interface FarmPlotState {
  key: string; // "col,row"
  col: number;
  row: number;
  tilled: boolean;
  watered: boolean;
  fertilized: boolean;
  cropId?: string;
  growthDays: number;
  mature: boolean;
  decoration?: 'fence' | 'torch' | 'flower_pot';
}

export type AnimalSpecies = 'chicken' | 'cow' | 'sheep' | 'goat' | 'duck' | 'rabbit' | 'pig';

export interface AnimalDefinition {
  species: AnimalSpecies;
  name: string;
  nameTh: string;
  buyPrice: number;
  produceItemId: string;
  produceNameTh: string;
  daysToMature: number;
  color: string;
  accentColor: string;
}

export interface FarmAnimalState {
  id: string;
  species: AnimalSpecies;
  name: string;
  x: number;
  y: number;
  ageDays: number;
  happiness: number; // 0-100
  fedToday: boolean;
  pettedToday: boolean;
  hasProduce: boolean;
}

export type FishRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface FishDefinition {
  id: string;
  name: string;
  nameTh: string;
  seasons: Season[];
  zones: ZoneId[];
  weather: WeatherType[] | 'any';
  timeRange: [number, number]; // [startHour, endHour]
  rarity: FishRarity;
  difficulty: number; // 1-10
  sellPrice: number;
  color: string;
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  bio: string;
  romanceable: boolean;
  homeZone: ZoneId;
  appearance: {
    skinColor: string;
    hairColor: string;
    shirtColor: string;
    pantsColor: string;
    hairStyle: HairStyle;
  };
  schedule: {
    morning: { zone: ZoneId; tileX: number; tileY: number };
    day: { zone: ZoneId; tileX: number; tileY: number };
    evening: { zone: ZoneId; tileX: number; tileY: number };
  };
  lovedGifts: string[];
  likedGifts: string[];
  dislikedGifts: string[];
  dialogues: {
    Spring: string[];
    Summer: string[];
    Autumn: string[];
    Winter: string[];
    highHearts: string[];
    married?: string[];
  };
  heartEvents: { hearts: number; title: string; text: string }[];
}

export interface NpcRelationshipState {
  npcId: string;
  points: number; // 100 points = 1 heart, max 1000 (10 hearts)
  talkedToday: boolean;
  giftedToday: boolean;
  married: boolean;
  seenEvents: number[];
}

export type QuestCategory =
  | 'Main'
  | 'Side'
  | 'Daily'
  | 'Weekly'
  | 'Seasonal'
  | 'Multiplayer'
  | 'Hidden';

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  objectiveType: 'harvest' | 'plant' | 'fish' | 'mine' | 'combat' | 'talk' | 'gold' | 'visit' | 'animal' | 'gift';
  targetId?: string;
  targetCount: number;
  rewardGold: number;
  rewardExp: number;
  rewardItemId?: string;
  rewardItemQty?: number;
  unlocksSecret?: boolean;
}

export interface QuestProgressState {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface CraftingRecipe {
  id: string;
  outputItemId: string;
  outputQty: number;
  nameTh: string;
  description: string;
  ingredients: { itemId: string; qty: number }[];
  requiredSkill?: { skill: SkillType; level: number };
}

export interface InteractableInfo {
  id: string;
  title: string;
  lines: string[];
  npcId?: string;
  shopType?: 'seeds' | 'tools' | 'animals' | 'general';
  actionType?: 'sleep' | 'shipping' | 'community' | 'mine_descend' | 'mine_exit';
}

export interface PlayerPositionSnapshot {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  zone: ZoneId;
  zoneName: string;
  direction: Direction;
  isMoving: boolean;
  isSprinting: boolean;
  mineFloor: number;
}

export interface PatchNote {
  version: string;
  phase: string;
  date: string;
  title: string;
  status: 'implemented' | 'planned';
  highlights: string[];
}

export interface SaveGameData {
  saveVersion: number;
  gameVersion: string;
  savedAt: string;
  slotId: string;
  appearance: CharacterAppearance;
  stats: PlayerStats;
  worldTime: WorldTime;
  currentZone: ZoneId;
  playerTile: { x: number; y: number };
  mineFloor: number;
  inventory: (InventorySlot | null)[];
  selectedHotbarIndex: number;
  equippedArmorId: string | null;
  farmPlots: FarmPlotState[];
  animals: FarmAnimalState[];
  relationships: Record<string, NpcRelationshipState>;
  quests: Record<string, QuestProgressState>;
  unlockedSecret: boolean;
  communityBundlesCompleted: number;
  visitedZones: ZoneId[];
}

// Multiplayer Protocol Types
export interface RemotePlayerState {
  id: string;
  username: string;
  appearance: CharacterAppearance;
  zone: ZoneId;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

export interface RoomSummary {
  code: string;
  hostUsername: string;
  playerCount: number;
  maxPlayers: number;
  players: RemotePlayerState[];
}
