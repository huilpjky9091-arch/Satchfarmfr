import type {
  CharacterAppearance,
  GameSettings,
  InteractableInfo,
  PlayerPositionSnapshot,
  PlayerStats,
  WorldTime,
} from '@shared/index';

export interface MobileInputState {
  dx: number; // -1..1
  dy: number; // -1..1
  sprinting: boolean;
}

type EventMap = {
  'world:ready': void;
  'player:position': PlayerPositionSnapshot;
  'player:stats': PlayerStats;
  'world:time': WorldTime;
  'interact:nearby': { id: string; title: string } | null;
  'interact:open': InteractableInfo;
  'interact:trigger': void;
  'interact:closed': void;
  'input:mobile': MobileInputState;
  'settings:updated': GameSettings;
  'appearance:updated': CharacterAppearance;
  'game:pause': boolean;
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

  emit<K extends keyof EventMap>(event: K, ...args: EventMap[K] extends void ? [] : [EventMap[K]]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    const payload = args[0] as EventMap[K];
    set.forEach((fn) => {
      (fn as Listener<EventMap[K]>)(payload);
    });
  }
}

export const EventBus = new TypedEventBus();
