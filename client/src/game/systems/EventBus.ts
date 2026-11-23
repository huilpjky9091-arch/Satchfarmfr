import type {
  CharacterAppearance,
  ChatMessage,
  FarmAnimalState,
  FarmPlotState,
  FishDefinition,
  GameSettings,
  InteractableInfo,
  PlayerPositionSnapshot,
  PlayerStats,
  RemotePlayerState,
  WorldTime,
  ZoneId,
} from '@shared/index';

export interface MobileInputState {
  dx: number;
  dy: number;
  sprinting: boolean;
}

export interface ToastMessage {
  id: number;
  text: string;
  tone?: 'info' | 'success' | 'warning';
}

type EventMap = {
  'world:ready': void;
  'world:time': WorldTime;
  'world:toast': ToastMessage;
  'world:sleep': void;
  'world:refresh_zone': void;
  'zone:teleport': { zone: ZoneId; col?: number; row?: number };
  'mine:change_floor': number;
  'player:position': PlayerPositionSnapshot;
  'player:stats': PlayerStats;
  'interact:nearby': { id: string; title: string } | null;
  'interact:open': InteractableInfo;
  'interact:trigger': void;
  'interact:closed': void;
  'action:use_tool': void;
  'input:mobile': MobileInputState;
  'settings:updated': GameSettings;
  'appearance:updated': CharacterAppearance;
  'game:pause': boolean;
  'farm:updated': FarmPlotState[];
  'animals:updated': FarmAnimalState[];
  'fishing:start': { fish: FishDefinition; zone: ZoneId };
  'fishing:result': { success: boolean; fish: FishDefinition };
  'shop:open': 'seeds' | 'tools' | 'animals' | 'general';
  'npc:open': string;
  'community:open': void;
  'mp:players': RemotePlayerState[];
  'mp:chat': ChatMessage;
  'mp:farm_sync': FarmPlotState[];
};

type Listener<T> = (payload: T) => void;

class TypedEventBus {
  private listeners: Map<keyof EventMap, Set<Listener<never>>> = new Map();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener<never>);
    return () => {
      set.delete(listener as Listener<never>);
    };
  }

  emit<K extends keyof EventMap>(
    event: K,
    ...args: EventMap[K] extends void ? [] : [EventMap[K]]
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    const payload = args[0] as EventMap[K];
    set.forEach((fn) => {
      (fn as Listener<EventMap[K]>)(payload);
    });
  }
}

export const EventBus = new TypedEventBus();
