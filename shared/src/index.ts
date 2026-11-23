export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type WeatherType = 'Sunny' | 'Rainy' | 'Storm' | 'Snow' | 'Fog';

export type Direction = 'down' | 'up' | 'left' | 'right';

export type HairStyle = 'classic' | 'spiky' | 'long' | 'bob';

export interface CharacterAppearance {
  name: string;
  farmName: string;
  skinColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export interface WorldTime {
  season: Season;
  day: number; // 1-28
  year: number;
  hour: number; // 6-24 (0-23)
  minute: number; // 0-59
  weather: WeatherType;
  dayPhase: 'Morning' | 'Day' | 'Evening' | 'Night';
}

export interface GameSettings {
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  timeScale: number; // 1 = ~15-20 min/day, 2 = 2x faster, 5 = 5x faster
  showMobileControls: 'auto' | 'always' | 'hidden';
}

export interface InteractableInfo {
  id: string;
  title: string;
  lines: string[];
}

export interface PlayerPositionSnapshot {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  zone: string;
  direction: Direction;
  isMoving: boolean;
  isSprinting: boolean;
}

export interface PatchNote {
  version: string;
  phase: string;
  date: string;
  title: string;
  status: 'implemented' | 'planned';
  highlights: string[];
}
