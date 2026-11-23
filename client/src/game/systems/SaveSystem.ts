import type { SaveGameData } from '@shared/index';
import { CURRENT_SAVE_SCHEMA_VERSION, migrateSaveData } from '../../data/ContentRegistry';
import { GAME_VERSION } from '../../data/version';

const SLOT_PREFIX = 'evergreen_valley_save_';
const BACKUP_KEY = 'evergreen_valley_backup_latest';

export interface SaveSlotSummary {
  slotId: string;
  exists: boolean;
  playerName?: string;
  farmName?: string;
  season?: string;
  day?: number;
  year?: number;
  gold?: number;
  savedAt?: string;
  gameVersion?: string;
}

class LocalSaveSystem {
  save(slotId: string, data: Omit<SaveGameData, 'saveVersion' | 'gameVersion' | 'savedAt' | 'slotId'>): SaveGameData {
    const payload: SaveGameData = {
      ...data,
      slotId,
      saveVersion: CURRENT_SAVE_SCHEMA_VERSION,
      gameVersion: GAME_VERSION,
      savedAt: new Date().toISOString(),
    };

    try {
      const serialized = JSON.stringify(payload);
      // Backup existing slot before overwriting to prevent corruption loss
      const existing = localStorage.getItem(SLOT_PREFIX + slotId);
      if (existing) {
        localStorage.setItem(BACKUP_KEY, existing);
      }
      localStorage.setItem(SLOT_PREFIX + slotId, serialized);
    } catch (err) {
      console.error('[SaveSystem] Failed to save:', err);
    }

    return payload;
  }

  load(slotId: string): SaveGameData | null {
    try {
      const raw = localStorage.getItem(SLOT_PREFIX + slotId);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<SaveGameData>;
      return migrateSaveData(parsed);
    } catch (err) {
      console.error('[SaveSystem] Corrupted save, attempting backup recovery:', err);
      return this.loadBackup();
    }
  }

  loadBackup(): SaveGameData | null {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      return migrateSaveData(JSON.parse(raw) as Partial<SaveGameData>);
    } catch {
      return null;
    }
  }

  deleteSlot(slotId: string): void {
    localStorage.removeItem(SLOT_PREFIX + slotId);
  }

  listSlots(): SaveSlotSummary[] {
    const slotIds = ['autosave', 'slot1', 'slot2', 'slot3'];
    return slotIds.map((slotId) => {
      const data = this.load(slotId);
      if (!data) return { slotId, exists: false };
      return {
        slotId,
        exists: true,
        playerName: data.appearance.name,
        farmName: data.appearance.farmName,
        season: data.worldTime.season,
        day: data.worldTime.day,
        year: data.worldTime.year,
        gold: data.stats.gold,
        savedAt: data.savedAt,
        gameVersion: data.gameVersion,
      };
    });
  }

  exportSaveJson(data: SaveGameData): string {
    return JSON.stringify(data, null, 2);
  }

  importSaveJson(jsonText: string, slotId = 'slot1'): SaveGameData | null {
    try {
      const parsed = JSON.parse(jsonText) as Partial<SaveGameData>;
      if (!parsed.appearance || !parsed.stats || !parsed.worldTime) {
        return null;
      }
      const migrated = migrateSaveData(parsed);
      migrated.slotId = slotId;
      localStorage.setItem(SLOT_PREFIX + slotId, JSON.stringify(migrated));
      return migrated;
    } catch {
      return null;
    }
  }
}

export const SaveSystem = new LocalSaveSystem();
