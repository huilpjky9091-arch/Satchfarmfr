import type {
  AnimalSpecies,
  CharacterAppearance,
  FarmAnimalState,
  FarmPlotState,
  InventorySlot,
  NpcRelationshipState,
  PlayerStats,
  QuestProgressState,
  SaveGameData,
  Season,
  SkillType,
  SkillsState,
  WeatherType,
  WorldTime,
  ZoneId,
} from '@shared/index';
import { ANIMAL_BY_SPECIES } from '../../data/animals';
import { CROP_BY_ID, CROP_BY_SEED_ID } from '../../data/crops';
import { CRAFTING_RECIPES, ITEM_BY_ID } from '../../data/items';
import { NPC_BY_ID, NPCS } from '../../data/npcs';
import { QUESTS } from '../../data/quests';
import { AudioSystem } from './AudioSystem';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
const INVENTORY_SIZE = 24;

function createInitialSkills(): SkillsState {
  const make = () => ({ level: 1, exp: 0, nextLevelExp: 60 });
  return {
    farming: make(),
    mining: make(),
    fishing: make(),
    foraging: make(),
    combat: make(),
  };
}

function createStarterInventory(): (InventorySlot | null)[] {
  const slots: (InventorySlot | null)[] = Array(INVENTORY_SIZE).fill(null);
  slots[0] = { itemId: 'tool_hoe', quantity: 1 };
  slots[1] = { itemId: 'tool_watering_can', quantity: 1 };
  slots[2] = { itemId: 'seed_sun_radish', quantity: 6 };
  slots[3] = { itemId: 'tool_scythe', quantity: 1 };
  slots[4] = { itemId: 'tool_pickaxe', quantity: 1 };
  slots[5] = { itemId: 'tool_fishing_rod', quantity: 1 };
  slots[6] = { itemId: 'weapon_sword_iron', quantity: 1 };
  slots[7] = { itemId: 'craft_fertilizer', quantity: 3 };
  slots[8] = { itemId: 'consumable_hp_potion', quantity: 2 };
  return slots;
}

function createInitialRelationships(): Record<string, NpcRelationshipState> {
  const map: Record<string, NpcRelationshipState> = {};
  NPCS.forEach((npc) => {
    map[npc.id] = {
      npcId: npc.id,
      points: 50,
      talkedToday: false,
      giftedToday: false,
      married: false,
      seenEvents: [],
    };
  });
  return map;
}

function createInitialQuests(): Record<string, QuestProgressState> {
  const map: Record<string, QuestProgressState> = {};
  QUESTS.forEach((q) => {
    map[q.id] = {
      questId: q.id,
      progress: 0,
      completed: false,
      claimed: false,
    };
  });
  return map;
}

class GameStateStore {
  appearance!: CharacterAppearance;
  stats!: PlayerStats;
  worldTime!: WorldTime;
  currentZone: ZoneId = 'farm';
  playerTile = { x: 14, y: 12 };
  mineFloor = 1;
  inventory: (InventorySlot | null)[] = [];
  selectedHotbarIndex = 0;
  equippedArmorId: string | null = null;
  farmPlots = new Map<string, FarmPlotState>();
  animals: FarmAnimalState[] = [];
  relationships: Record<string, NpcRelationshipState> = {};
  quests: Record<string, QuestProgressState> = {};
  unlockedSecret = false;
  communityBundlesCompleted = 0;
  visitedZones = new Set<ZoneId>(['farm']);

  private listeners = new Set<() => void>();
  private toastCounter = 1;

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
    EventBus.emit('player:stats', { ...this.stats, skills: { ...this.stats.skills } });
  }

  toast(text: string, tone: 'info' | 'success' | 'warning' = 'info'): void {
    EventBus.emit('world:toast', { id: this.toastCounter++, text, tone });
  }

  initNewGame(appearance: CharacterAppearance): void {
    this.appearance = { ...appearance };
    this.stats = {
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      gold: 500,
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      defense: 2,
      attack: 12,
      skills: createInitialSkills(),
    };
    this.worldTime = {
      season: 'Spring',
      day: 1,
      year: 1,
      hour: 7,
      minute: 0,
      weather: 'Sunny',
      dayPhase: 'Morning',
    };
    this.currentZone = 'farm';
    this.playerTile = { x: 14, y: 12 };
    this.mineFloor = 1;
    this.inventory = createStarterInventory();
    this.selectedHotbarIndex = 0;
    this.equippedArmorId = null;
    this.farmPlots = new Map();
    this.animals = [
      {
        id: 'starter_chicken',
        species: 'chicken',
        name: 'Pippy',
        x: 11 * 16,
        y: 16 * 16,
        ageDays: 2,
        happiness: 75,
        fedToday: false,
        pettedToday: false,
        hasProduce: true,
      },
    ];
    this.relationships = createInitialRelationships();
    this.quests = createInitialQuests();
    this.unlockedSecret = false;
    this.communityBundlesCompleted = 0;
    this.visitedZones = new Set<ZoneId>(['farm']);
    this.recomputeCombatStats();
    AudioSystem.setSeason(this.worldTime.season);
    this.notify();
  }

  loadFromSave(save: SaveGameData): void {
    this.appearance = { ...save.appearance };
    this.stats = { ...save.stats, skills: { ...save.stats.skills } };
    this.worldTime = { ...save.worldTime };
    this.currentZone = save.currentZone;
    this.playerTile = { ...save.playerTile };
    this.mineFloor = save.mineFloor || 1;
    this.inventory = Array.from({ length: INVENTORY_SIZE }, (_, i) => save.inventory[i] ?? null);
    this.selectedHotbarIndex = save.selectedHotbarIndex ?? 0;
    this.equippedArmorId = save.equippedArmorId ?? null;
    this.farmPlots = new Map(save.farmPlots.map((p) => [p.key, { ...p }]));
    this.animals = save.animals.map((a) => ({ ...a }));
    this.relationships = { ...createInitialRelationships(), ...save.relationships };
    this.quests = { ...createInitialQuests(), ...save.quests };
    this.unlockedSecret = Boolean(save.unlockedSecret);
    this.communityBundlesCompleted = save.communityBundlesCompleted ?? 0;
    this.visitedZones = new Set<ZoneId>(save.visitedZones ?? ['farm']);
    this.recomputeCombatStats();
    AudioSystem.setSeason(this.worldTime.season);
    this.notify();
  }

  saveToSlot(slotId = 'autosave'): SaveGameData {
    return SaveSystem.save(slotId, {
      appearance: this.appearance,
      stats: this.stats,
      worldTime: this.worldTime,
      currentZone: this.currentZone,
      playerTile: this.playerTile,
      mineFloor: this.mineFloor,
      inventory: this.inventory,
      selectedHotbarIndex: this.selectedHotbarIndex,
      equippedArmorId: this.equippedArmorId,
      farmPlots: Array.from(this.farmPlots.values()),
      animals: this.animals,
      relationships: this.relationships,
      quests: this.quests,
      unlockedSecret: this.unlockedSecret,
      communityBundlesCompleted: this.communityBundlesCompleted,
      visitedZones: Array.from(this.visitedZones),
    });
  }

  getSelectedSlot(): InventorySlot | null {
    return this.inventory[this.selectedHotbarIndex] ?? null;
  }

  selectHotbar(index: number): void {
    if (index < 0 || index > 8) return;
    this.selectedHotbarIndex = index;
    this.recomputeCombatStats();
    this.notify();
  }

  swapSlots(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= INVENTORY_SIZE || b >= INVENTORY_SIZE) return;
    const temp = this.inventory[a];
    this.inventory[a] = this.inventory[b];
    this.inventory[b] = temp;
    this.recomputeCombatStats();
    this.notify();
  }

  addItem(itemId: string, quantity = 1): boolean {
    const def = ITEM_BY_ID[itemId];
    if (!def || quantity <= 0) return false;

    if (def.stackable) {
      for (let i = 0; i < INVENTORY_SIZE; i++) {
        const slot = this.inventory[i];
        if (slot && slot.itemId === itemId) {
          slot.quantity += quantity;
          this.notify();
          return true;
        }
      }
    }

    for (let i = 0; i < INVENTORY_SIZE; i++) {
      if (!this.inventory[i]) {
        this.inventory[i] = { itemId, quantity };
        this.notify();
        return true;
      }
    }

    this.toast('กระเป๋าเต็มแล้ว! กรุณาขายของหรือเคลียร์ช่องว่าง', 'warning');
    return false;
  }

  removeItem(itemId: string, quantity = 1): boolean {
    if (this.countItem(itemId) < quantity) return false;
    let remaining = quantity;
    for (let i = 0; i < INVENTORY_SIZE && remaining > 0; i++) {
      const slot = this.inventory[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(slot.quantity, remaining);
        slot.quantity -= take;
        remaining -= take;
        if (slot.quantity <= 0) {
          this.inventory[i] = null;
        }
      }
    }
    this.notify();
    return true;
  }

  countItem(itemId: string): number {
    return this.inventory.reduce((sum, s) => (s && s.itemId === itemId ? sum + s.quantity : sum), 0);
  }

  consumeItem(slotIndex: number): boolean {
    const slot = this.inventory[slotIndex];
    if (!slot) return false;
    const def = ITEM_BY_ID[slot.itemId];
    if (!def) return false;

    if (def.category === 'armor') {
      this.equippedArmorId = def.id;
      this.recomputeCombatStats();
      AudioSystem.playInteract();
      this.toast(`สวมใส่ ${def.nameTh} แล้ว (DEF +${def.defenseBonus})`, 'success');
      this.notify();
      return true;
    }

    if (!def.energyRestore && !def.hpRestore) return false;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + (def.hpRestore ?? 0));
    this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + (def.energyRestore ?? 0));
    slot.quantity -= 1;
    if (slot.quantity <= 0) this.inventory[slotIndex] = null;
    AudioSystem.playHarvest();
    this.toast(`ใช้ ${def.nameTh} ฟื้นฟูพลังสำเร็จ!`, 'success');
    this.notify();
    return true;
  }

  recomputeCombatStats(): void {
    const selected = this.getSelectedSlot();
    const weaponDef = selected ? ITEM_BY_ID[selected.itemId] : undefined;
    const armorDef = this.equippedArmorId ? ITEM_BY_ID[this.equippedArmorId] : undefined;
    const combatLv = this.stats?.skills?.combat?.level ?? 1;
    this.stats.attack = 10 + combatLv * 2 + (weaponDef?.attackBonus ?? 0);
    this.stats.defense = 2 + Math.floor(combatLv / 2) + (armorDef?.defenseBonus ?? 0);
  }

  addGold(amount: number): void {
    this.stats.gold = Math.max(0, this.stats.gold + amount);
    if (amount > 0) {
      AudioSystem.playCoin();
      this.recordQuestObjective('gold', this.stats.gold, true);
    }
    this.notify();
  }

  spendGold(amount: number): boolean {
    if (this.stats.gold < amount) {
      this.toast('เงินไม่เพียงพอ!', 'warning');
      return false;
    }
    this.stats.gold -= amount;
    AudioSystem.playCoin();
    this.notify();
    return true;
  }

  addSkillExp(skill: SkillType, amount: number): void {
    const sk = this.stats.skills[skill];
    sk.exp += amount;
    while (sk.exp >= sk.nextLevelExp) {
      sk.exp -= sk.nextLevelExp;
      sk.level += 1;
      sk.nextLevelExp = Math.round(sk.nextLevelExp * 1.45);
      this.stats.maxStamina += 5;
      this.stats.maxHp += 5;
      AudioSystem.playLevelUp();
      this.toast(`🎉 ทักษะ ${skill.toUpperCase()} เลเวลอัปเป็น LV.${sk.level}!`, 'success');
    }

    // Player global EXP
    this.stats.exp += amount;
    while (this.stats.exp >= this.stats.nextLevelExp) {
      this.stats.exp -= this.stats.nextLevelExp;
      this.stats.level += 1;
      this.stats.nextLevelExp = Math.round(this.stats.nextLevelExp * 1.4);
      this.stats.maxHp += 10;
      this.stats.hp = this.stats.maxHp;
      this.stats.maxStamina += 10;
      this.stats.stamina = this.stats.maxStamina;
      AudioSystem.playLevelUp();
      this.toast(`⭐ ตัวละครเลเวลอัปเป็น LV.${this.stats.level}!`, 'success');
    }
    this.recomputeCombatStats();
    this.notify();
  }

  useStamina(cost: number): boolean {
    if (this.stats.stamina < cost) {
      this.toast('Stamina หมด! กินอาหาร/ยา หรือนอนพักในบ้านฟาร์ม', 'warning');
      return false;
    }
    this.stats.stamina = Math.max(0, this.stats.stamina - cost);
    this.notify();
    return true;
  }

  takeDamage(rawDamage: number): boolean {
    const dmg = Math.max(1, rawDamage - this.stats.defense);
    this.stats.hp = Math.max(0, this.stats.hp - dmg);
    AudioSystem.playHit();
    if (this.stats.hp <= 0) {
      this.stats.hp = Math.round(this.stats.maxHp * 0.6);
      this.mineFloor = 1;
      this.toast('คุณหมดสติในเหมือง! Dr. Soren พากลับมาพักที่ฟาร์มแล้ว', 'warning');
      EventBus.emit('zone:teleport', { zone: 'farm', col: 14, row: 12 });
      this.notify();
      return true;
    }
    this.notify();
    return false;
  }

  // --- FARMING ---
  tillPlot(col: number, row: number): boolean {
    const key = `${col},${row}`;
    if (this.farmPlots.has(key)) return false;
    if (!this.useStamina(2)) return false;
    this.farmPlots.set(key, {
      key,
      col,
      row,
      tilled: true,
      watered: this.worldTime.weather === 'Rainy' || this.worldTime.weather === 'Storm',
      fertilized: false,
      growthDays: 0,
      mature: false,
    });
    AudioSystem.playTool();
    this.addSkillExp('farming', 3);
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  waterPlot(col: number, row: number): boolean {
    const plot = this.farmPlots.get(`${col},${row}`);
    if (!plot || !plot.tilled || plot.watered) return false;
    if (!this.useStamina(1)) return false;
    plot.watered = true;
    AudioSystem.playWater();
    this.addSkillExp('farming', 2);
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  fertilizePlot(col: number, row: number): boolean {
    const plot = this.farmPlots.get(`${col},${row}`);
    if (!plot || !plot.tilled || plot.fertilized) return false;
    if (!this.removeItem('craft_fertilizer', 1)) return false;
    plot.fertilized = true;
    AudioSystem.playTool();
    this.toast('ใส่ปุ๋ยบำรุงดินแล้ว! พืชจะโตไวขึ้น 2 เท่า', 'success');
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  placeFence(col: number, row: number): boolean {
    const key = `${col},${row}`;
    if (this.farmPlots.has(key)) return false;
    if (!this.removeItem('craft_fence', 1)) return false;
    this.farmPlots.set(key, {
      key,
      col,
      row,
      tilled: false,
      watered: false,
      fertilized: false,
      growthDays: 0,
      mature: false,
      decoration: 'fence',
    });
    AudioSystem.playTool();
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  plantSeed(col: number, row: number, seedId: string): boolean {
    const crop = CROP_BY_SEED_ID[seedId];
    if (!crop) return false;
    if (!crop.seasons.includes(this.worldTime.season)) {
      this.toast(`เมล็ด${crop.nameTh} ปลูกได้เฉพาะฤดู ${crop.seasons.join(', ')}`, 'warning');
      return false;
    }
    const key = `${col},${row}`;
    const plot = this.farmPlots.get(key);
    if (!plot || !plot.tilled || plot.cropId) return false;
    if (!this.removeItem(seedId, 1)) return false;

    plot.cropId = crop.id;
    plot.growthDays = 0;
    plot.mature = false;
    AudioSystem.playTool();
    this.addSkillExp('farming', 6);
    this.recordQuestObjective('plant', 1);
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  harvestPlot(col: number, row: number): boolean {
    const plot = this.farmPlots.get(`${col},${row}`);
    if (!plot || !plot.cropId || !plot.mature) return false;
    const crop = CROP_BY_ID[plot.cropId];
    if (!crop) return false;

    const bonusQty = this.stats.skills.farming.level >= 4 && Math.random() < 0.35 ? 2 : 1;
    if (!this.addItem(crop.harvestItemId, bonusQty)) return false;

    if (crop.regrowDays) {
      plot.mature = false;
      plot.growthDays = Math.max(0, crop.growthDays - crop.regrowDays);
    } else {
      plot.cropId = undefined;
      plot.growthDays = 0;
      plot.mature = false;
      plot.fertilized = false;
    }

    AudioSystem.playHarvest();
    this.addSkillExp('farming', 14);
    this.recordQuestObjective('harvest', bonusQty);
    this.toast(`เก็บเกี่ยว ${crop.nameTh} x${bonusQty}!`, 'success');
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    return true;
  }

  // --- ANIMALS ---
  buyAnimal(species: AnimalSpecies): boolean {
    const def = ANIMAL_BY_SPECIES[species];
    if (!def) return false;
    if (this.animals.length >= 16) {
      this.toast('โรงเรือนสัตว์เต็มแล้ว (สูงสุด 16 ตัว)', 'warning');
      return false;
    }
    if (!this.spendGold(def.buyPrice)) return false;

    const id = `animal_${Date.now()}_${Math.floor(Math.random() * 999)}`;
    this.animals.push({
      id,
      species,
      name: `${def.nameTh} #${this.animals.length + 1}`,
      x: (8 + (this.animals.length % 6) * 2) * 16,
      y: (15 + Math.floor(this.animals.length / 6) * 2) * 16,
      ageDays: 0,
      happiness: 65,
      fedToday: true,
      pettedToday: false,
      hasProduce: false,
    });
    this.recordQuestObjective('animal', 1);
    this.toast(`ซื้อ ${def.nameTh} เข้าฟาร์มเรียบร้อยแล้ว!`, 'success');
    EventBus.emit('animals:updated', [...this.animals]);
    this.notify();
    return true;
  }

  interactAnimal(animalId: string): void {
    const animal = this.animals.find((a) => a.id === animalId);
    if (!animal) return;
    const def = ANIMAL_BY_SPECIES[animal.species];

    if (animal.hasProduce) {
      if (this.addItem(def.produceItemId, 1)) {
        animal.hasProduce = false;
        AudioSystem.playHarvest();
        this.addSkillExp('farming', 10);
        this.toast(`เก็บ ${def.produceNameTh} จาก ${animal.name}!`, 'success');
      }
    } else if (!animal.pettedToday || !animal.fedToday) {
      animal.pettedToday = true;
      animal.fedToday = true;
      animal.happiness = Math.min(100, animal.happiness + 15);
      AudioSystem.playInteract();
      this.toast(`ให้อาหารและลูบหัว ${animal.name} ♥ (ความสุข ${animal.happiness}%)`, 'success');
    } else {
      this.toast(`${animal.name} อิ่มและมีความสุขดีมาก! (${animal.happiness}%)`, 'info');
    }
    EventBus.emit('animals:updated', [...this.animals]);
    this.notify();
  }

  // --- SHOP & CRAFTING ---
  buyItem(itemId: string, qty = 1): boolean {
    const def = ITEM_BY_ID[itemId];
    if (!def || !def.buyPrice) return false;
    const total = def.buyPrice * qty;
    if (!this.spendGold(total)) return false;
    if (!this.addItem(itemId, qty)) {
      this.stats.gold += total;
      this.notify();
      return false;
    }
    this.toast(`ซื้อ ${def.nameTh} x${qty} (-${total} G)`, 'success');
    return true;
  }

  sellItem(slotIndex: number, sellAll = false): boolean {
    const slot = this.inventory[slotIndex];
    if (!slot) return false;
    const def = ITEM_BY_ID[slot.itemId];
    if (!def || def.sellPrice <= 0) {
      this.toast('ไม่สามารถขายไอเทมชิ้นนี้ได้', 'warning');
      return false;
    }
    const qty = sellAll ? slot.quantity : 1;
    const earned = def.sellPrice * qty;
    slot.quantity -= qty;
    if (slot.quantity <= 0) this.inventory[slotIndex] = null;
    this.addGold(earned);
    this.toast(`ขาย ${def.nameTh} x${qty} ได้รับ +${earned} G`, 'success');
    return true;
  }

  craftRecipe(recipeId: string): boolean {
    const rec = CRAFTING_RECIPES.find((r) => r.id === recipeId);
    if (!rec) return false;
    for (const ing of rec.ingredients) {
      if (this.countItem(ing.itemId) < ing.qty) {
        this.toast('วัตถุดิบไม่เพียงพอสำหรับคราฟต์!', 'warning');
        return false;
      }
    }
    rec.ingredients.forEach((ing) => this.removeItem(ing.itemId, ing.qty));
    this.addItem(rec.outputItemId, rec.outputQty);
    AudioSystem.playHarvest();
    this.toast(`คราฟต์ ${rec.nameTh} สำเร็จ!`, 'success');
    return true;
  }

  // --- NPC & RELATIONSHIPS ---
  talkToNpc(npcId: string): { dialogue: string; heartEvent?: { title: string; text: string } } {
    const npc = NPC_BY_ID[npcId];
    const rel = this.relationships[npcId];
    if (!npc || !rel) return { dialogue: '...' };

    if (!rel.talkedToday) {
      rel.talkedToday = true;
      rel.points = Math.min(1000, rel.points + 35);
      this.recordQuestObjective('talk', 1);
    }

    const hearts = Math.floor(rel.points / 100);
    let heartEvent: { title: string; text: string } | undefined;
    for (const ev of npc.heartEvents) {
      if (hearts >= ev.hearts && !rel.seenEvents.includes(ev.hearts)) {
        rel.seenEvents.push(ev.hearts);
        heartEvent = { title: ev.title, text: ev.text };
        break;
      }
    }

    let pool = npc.dialogues[this.worldTime.season];
    if (rel.married && npc.dialogues.married?.length) {
      pool = npc.dialogues.married;
    } else if (hearts >= 6 && npc.dialogues.highHearts.length) {
      pool = npc.dialogues.highHearts;
    }
    const dialogue = pool[Math.floor(Math.random() * pool.length)];
    this.notify();
    return { dialogue, heartEvent };
  }

  giveGiftToNpc(npcId: string, itemId: string): string {
    const npc = NPC_BY_ID[npcId];
    const rel = this.relationships[npcId];
    if (!npc || !rel) return '';

    // Marriage proposal check!
    if (itemId === 'gift_starlight_pendant') {
      if (!npc.romanceable) {
        return `${npc.name}: ขอบใจนะ แต่ฉันคิดว่าจี้แสงดาวนี้ควรเก็บไว้ให้คนพิเศษจะดีกว่า`;
      }
      if (Math.floor(rel.points / 100) < 6) {
        return `${npc.name}: จี้สวยมากเลย... แต่เราลองทำความรู้จักกันให้มากกว่านี้ก่อนนะ (ต้องการ 6 หัวใจขึ้นไป)`;
      }
      if (!this.removeItem(itemId, 1)) return '';
      rel.married = true;
      rel.points = 1000;
      AudioSystem.playLevelUp();
      this.toast(`💍 ยินดีด้วย! คุณและ ${npc.name} แต่งงานกันแล้ว!`, 'success');
      this.notify();
      return `${npc.name}: ตกลงจ้ะ! ฉันมีความสุขที่สุดเลย ตั้งแต่นี้ไปเราจะดูแลหุบเขาและฟาร์มนี้ไปด้วยกันนะ ♥`;
    }

    if (rel.giftedToday) {
      return `คุณมอบของขวัญให้ ${npc.name} ไปแล้วในวันนี้`;
    }
    if (!this.removeItem(itemId, 1)) return 'ไม่พบไอเทมในกระเป๋า';

    rel.giftedToday = true;
    this.recordQuestObjective('gift', 1);

    if (npc.lovedGifts.includes(itemId)) {
      rel.points = Math.min(1000, rel.points + 120);
      AudioSystem.playLevelUp();
      this.notify();
      return `${npc.name}: ว้าว! ของโปรดของฉันเลย ขอบคุณมากนะ!! (+120 ความสัมพันธ์ ♥)`;
    }
    if (npc.likedGifts.includes(itemId)) {
      rel.points = Math.min(1000, rel.points + 65);
      AudioSystem.playInteract();
      this.notify();
      return `${npc.name}: ขอบใจมากนะ ฉันชอบของชิ้นนี้เลยล่ะ (+65 ความสัมพันธ์)`;
    }
    if (npc.dislikedGifts.includes(itemId)) {
      rel.points = Math.max(0, rel.points - 25);
      this.notify();
      return `${npc.name}: เอ่อ... ขอบใจนะ แต่ฉันไม่ค่อยชอบของแบบนี้เท่าไหร่ (-25 ความสัมพันธ์)`;
    }

    rel.points = Math.min(1000, rel.points + 35);
    AudioSystem.playInteract();
    this.notify();
    return `${npc.name}: ขอบคุณสำหรับของขวัญนะ! (+35 ความสัมพันธ์)`;
  }

  // --- QUESTS & COMMUNITY CENTER ---
  recordQuestObjective(
    type: QuestProgressState extends never ? never : (typeof QUESTS)[number]['objectiveType'],
    amount = 1,
    absolute = false
  ): void {
    let anyCompleted = false;
    QUESTS.forEach((q) => {
      if (q.objectiveType !== type) return;
      const st = this.quests[q.id];
      if (!st || st.completed) return;
      st.progress = absolute ? Math.max(st.progress, amount) : st.progress + amount;
      if (st.progress >= q.targetCount) {
        st.progress = q.targetCount;
        st.completed = true;
        anyCompleted = true;
        this.toast(`📜 เควสต์สำเร็จ: ${q.title} (รับรางวัลใน Quest Log)`, 'success');
      }
    });
    if (anyCompleted) this.notify();
  }

  claimQuestReward(questId: string): boolean {
    const q = QUESTS.find((x) => x.id === questId);
    const st = this.quests[questId];
    if (!q || !st || !st.completed || st.claimed) return false;
    st.claimed = true;
    this.addGold(q.rewardGold);
    this.addSkillExp('farming', Math.round(q.rewardExp / 2));
    if (q.rewardItemId && q.rewardItemQty) {
      this.addItem(q.rewardItemId, q.rewardItemQty);
    }
    if (q.unlocksSecret && !this.unlockedSecret) {
      this.unlockedSecret = true;
      this.toast('✨ ปลดล็อกพื้นที่ลับ Whispering Sanctuary (ฝั่งซ้ายของ Enchanted Forest)!', 'success');
    }
    AudioSystem.playLevelUp();
    this.notify();
    return true;
  }

  contributeCommunityBundle(): boolean {
    const cost = 250;
    if (!this.spendGold(cost)) return false;
    this.communityBundlesCompleted += 1;
    if (this.communityBundlesCompleted >= 2 && !this.unlockedSecret) {
      this.unlockedSecret = true;
      this.toast('✨ Community Center ฟื้นฟูแล้ว! ปลดล็อกทางเข้า Whispering Sanctuary!', 'success');
    } else {
      this.toast(`ร่วมฟื้นฟู Community Center สำเร็จ (${this.communityBundlesCompleted}/2)!`, 'success');
    }
    AudioSystem.playLevelUp();
    this.notify();
    return true;
  }

  visitZone(zone: ZoneId): void {
    this.currentZone = zone;
    if (!this.visitedZones.has(zone)) {
      this.visitedZones.add(zone);
      this.recordQuestObjective('visit', this.visitedZones.size, true);
    }
    this.notify();
  }

  // --- DAY SLEEP / ADVANCE DAY ---
  sleepToNextDay(): void {
    const t = this.worldTime;
    t.day += 1;
    t.hour = 6;
    t.minute = 30;
    t.dayPhase = 'Morning';

    if (t.day > 28) {
      t.day = 1;
      const nextSeasonIdx = (SEASONS.indexOf(t.season) + 1) % SEASONS.length;
      t.season = SEASONS[nextSeasonIdx];
      if (nextSeasonIdx === 0) t.year += 1;
      AudioSystem.setSeason(t.season);
    }

    // Roll weather for new day
    const r = Math.random();
    let weather: WeatherType = 'Sunny';
    if (t.season === 'Winter') weather = r < 0.55 ? 'Snow' : r < 0.85 ? 'Sunny' : 'Fog';
    else if (t.season === 'Summer') weather = r < 0.65 ? 'Sunny' : r < 0.9 ? 'Rainy' : 'Storm';
    else weather = r < 0.6 ? 'Sunny' : r < 0.88 ? 'Rainy' : 'Fog';
    t.weather = weather;

    // Grow watered crops
    const isRaining = weather === 'Rainy' || weather === 'Storm';
    this.farmPlots.forEach((plot) => {
      if (plot.cropId) {
        const crop = CROP_BY_ID[plot.cropId];
        if (crop && !crop.seasons.includes(t.season)) {
          // Out-of-season crop withers
          plot.cropId = undefined;
          plot.growthDays = 0;
          plot.mature = false;
        } else if (crop && plot.watered) {
          plot.growthDays += plot.fertilized ? 2 : 1;
          if (plot.growthDays >= crop.growthDays) {
            plot.mature = true;
          }
        }
      }
      plot.watered = isRaining;
    });

    // Update animals & generate produce
    this.animals.forEach((animal) => {
      animal.ageDays += 1;
      const def = ANIMAL_BY_SPECIES[animal.species];
      if (animal.ageDays >= def.daysToMature && (animal.fedToday || animal.happiness >= 50)) {
        animal.hasProduce = true;
      }
      animal.fedToday = false;
      animal.pettedToday = false;
    });

    // Reset NPC daily flags
    Object.values(this.relationships).forEach((rel) => {
      rel.talkedToday = false;
      rel.giftedToday = false;
    });

    // Restore HP & Stamina
    this.stats.hp = this.stats.maxHp;
    this.stats.stamina = this.stats.maxStamina;

    // Auto-save!
    this.saveToSlot('autosave');

    EventBus.emit('world:time', { ...this.worldTime });
    EventBus.emit('farm:updated', Array.from(this.farmPlots.values()));
    EventBus.emit('animals:updated', [...this.animals]);
    EventBus.emit('world:refresh_zone');
    this.toast(`☀️ เช้าวันใหม่: ${t.season} Day ${t.day}, ปี ${t.year} (${t.weather}) — บันทึกอัตโนมัติแล้ว`, 'success');
    this.notify();
  }
}

export const GameState = new GameStateStore();
