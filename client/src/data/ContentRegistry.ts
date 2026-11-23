import type {
  CropDefinition,
  FishDefinition,
  ItemDefinition,
  NpcDefinition,
  QuestDefinition,
  SaveGameData,
} from '@shared/index';
import { CROPS } from './crops';
import { FISH_LIST } from './fish';
import { ALL_ITEMS } from './items';
import { NPCS } from './npcs';
import { QUESTS } from './quests';

export const CURRENT_SAVE_SCHEMA_VERSION = 2;

class GameContentRegistry {
  private items = new Map<string, ItemDefinition>();
  private crops = new Map<string, CropDefinition>();
  private fish = new Map<string, FishDefinition>();
  private npcs = new Map<string, NpcDefinition>();
  private quests = new Map<string, QuestDefinition>();
  private loadedPacks: string[] = ['core-v1.0.0'];

  constructor() {
    ALL_ITEMS.forEach((i) => this.items.set(i.id, i));
    CROPS.forEach((c) => this.crops.set(c.id, c));
    FISH_LIST.forEach((f) => this.fish.set(f.id, f));
    NPCS.forEach((n) => this.npcs.set(n.id, n));
    QUESTS.forEach((q) => this.quests.set(q.id, q));
  }

  registerContentPack(pack: {
    id: string;
    items?: ItemDefinition[];
    crops?: CropDefinition[];
    fish?: FishDefinition[];
    npcs?: NpcDefinition[];
    quests?: QuestDefinition[];
  }): void {
    pack.items?.forEach((i) => this.items.set(i.id, i));
    pack.crops?.forEach((c) => this.crops.set(c.id, c));
    pack.fish?.forEach((f) => this.fish.set(f.id, f));
    pack.npcs?.forEach((n) => this.npcs.set(n.id, n));
    pack.quests?.forEach((q) => this.quests.set(q.id, q));
    if (!this.loadedPacks.includes(pack.id)) {
      this.loadedPacks.push(pack.id);
    }
  }

  getItem(id: string): ItemDefinition | undefined {
    return this.items.get(id);
  }

  getAllItems(): ItemDefinition[] {
    return Array.from(this.items.values());
  }

  getAllCrops(): CropDefinition[] {
    return Array.from(this.crops.values());
  }

  getAllFish(): FishDefinition[] {
    return Array.from(this.fish.values());
  }

  getAllNpcs(): NpcDefinition[] {
    return Array.from(this.npcs.values());
  }

  getAllQuests(): QuestDefinition[] {
    return Array.from(this.quests.values());
  }

  getSummary() {
    return {
      packs: [...this.loadedPacks],
      items: this.items.size,
      crops: this.crops.size,
      fish: this.fish.size,
      npcs: this.npcs.size,
      quests: this.quests.size,
    };
  }
}

export const ContentRegistry = new GameContentRegistry();

/**
 * Forward-compatible save data migration pipeline (Phase 8).
 * Ensures older saves remain playable across patches without data loss.
 */
export function migrateSaveData(raw: Partial<SaveGameData>): SaveGameData {
  const version = raw.saveVersion ?? 1;
  const migrated = { ...raw } as SaveGameData;

  if (version < 2) {
    migrated.visitedZones = migrated.visitedZones ?? ['farm'];
    migrated.communityBundlesCompleted = migrated.communityBundlesCompleted ?? 0;
    migrated.unlockedSecret = Boolean(migrated.unlockedSecret);
    migrated.equippedArmorId = migrated.equippedArmorId ?? null;
    migrated.mineFloor = migrated.mineFloor ?? 1;
    migrated.saveVersion = CURRENT_SAVE_SCHEMA_VERSION;
  }

  return migrated;
}
