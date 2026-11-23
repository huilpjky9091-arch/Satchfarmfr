import type { CraftingRecipe, ItemDefinition } from '@shared/index';
import { CROPS } from './crops';
import { FISH_LIST } from './fish';

const BASE_ITEMS: ItemDefinition[] = [
  // TOOLS
  { id: 'tool_hoe', name: 'Iron Hoe', nameTh: 'จอบพรวนดิน', category: 'tool', description: 'ใช้พรวนดินบนพื้นที่ฟาร์มเพื่อปลูกเมล็ดพันธุ์', sellPrice: 0, color: '#9aa0a6', icon: '⛏️', stackable: false, toolType: 'hoe', tier: 1 },
  { id: 'tool_watering_can', name: 'Watering Can', nameTh: 'บัวรดน้ำ', category: 'tool', description: 'ใช้รดน้ำดินที่พรวนแล้วเพื่อให้พืชเติบโตในวันถัดไป', sellPrice: 0, color: '#4ba3e3', icon: '🚿', stackable: false, toolType: 'watering_can', tier: 1 },
  { id: 'tool_pickaxe', name: 'Miner Pickaxe', nameTh: 'อีเต้อขุดแร่', category: 'tool', description: 'ใช้ขุดหินและแร่ธาตุในเหมือง Crystal Mine', sellPrice: 0, color: '#788496', icon: '⚒️', stackable: false, toolType: 'pickaxe', tier: 1 },
  { id: 'tool_fishing_rod', name: 'Bamboo Rod', nameTh: 'เบ็ดตกปลา', category: 'tool', description: 'ใช้ตกปลาตามบึงน้ำ ทะเลสาบ ชายหาด และวิหารลับ', sellPrice: 0, color: '#c48a4f', icon: '🎣', stackable: false, toolType: 'fishing_rod', tier: 1 },
  { id: 'tool_scythe', name: 'Harvest Scythe', nameTh: 'เคียวเก็บเกี่ยว', category: 'tool', description: 'ใช้เก็บเกี่ยวผลผลิตและเก็บของป่า', sellPrice: 0, color: '#b5bec7', icon: '🌾', stackable: false, toolType: 'scythe', tier: 1 },

  // WEAPONS (Sword, Bow, Magic Staff)
  { id: 'weapon_sword_iron', name: 'Valley Sword', nameTh: 'ดาบเหล็กกล้า', category: 'weapon', description: 'ดาบระยะประชิด พลังโจมตี 18', buyPrice: 350, sellPrice: 120, color: '#cbd5e1', icon: '⚔️', stackable: false, toolType: 'sword', attackBonus: 18, tier: 1 },
  { id: 'weapon_sword_crystal', name: 'Crystal Blade', nameTh: 'ดาบคริสตัล', category: 'weapon', description: 'ดาบคริสตัลเปล่งแสง พลังโจมตี 36', buyPrice: 1600, sellPrice: 650, color: '#7dd3fc', icon: '🗡️', stackable: false, toolType: 'sword', attackBonus: 36, tier: 2 },
  { id: 'weapon_bow_hunter', name: 'Hunter Bow', nameTh: 'ธนูพรานป่า', category: 'weapon', description: 'ยิงลูกธนูโจมตีระยะไกล พลังโจมตี 22', buyPrice: 550, sellPrice: 200, color: '#a86e3b', icon: '🏹', stackable: false, toolType: 'bow', attackBonus: 22, tier: 1 },
  { id: 'weapon_staff_star', name: 'Starlight Staff', nameTh: 'คทาเวทแสงดาว', category: 'weapon', description: 'ยิงลำแสงเวทมนตร์ระยะไกล พลังโจมตี 30 (ใช้ Stamina 4)', buyPrice: 1100, sellPrice: 450, color: '#a78bfa', icon: '🪄', stackable: false, toolType: 'staff', attackBonus: 30, tier: 2 },

  // ARMOR
  { id: 'armor_leather', name: 'Ranger Vest', nameTh: 'เกราะหนังพรานป่า', category: 'armor', description: 'เพิ่มพลังป้องกัน +6', buyPrice: 450, sellPrice: 160, color: '#8c5529', icon: '🦺', stackable: false, defenseBonus: 6 },
  { id: 'armor_crystal', name: 'Crystal Plate', nameTh: 'ชุดเกราะคริสตัล', category: 'armor', description: 'เพิ่มพลังป้องกัน +15', buyPrice: 1800, sellPrice: 700, color: '#60a5fa', icon: '🛡️', stackable: false, defenseBonus: 15 },

  // ANIMAL PRODUCTS
  { id: 'prod_egg', name: 'Fresh Egg', nameTh: 'ไข่ไก่สด', category: 'animal_product', description: 'ไข่ไก่สดใหม่จากฟาร์ม', sellPrice: 65, color: '#f7f1e3', icon: '🥚', stackable: true, energyRestore: 20 },
  { id: 'prod_duck_egg', name: 'Blue Duck Egg', nameTh: 'ไข่เป็ดสีฟ้า', category: 'animal_product', description: 'ไข่เป็ดหายากคุณภาพสูง', sellPrice: 110, color: '#9ee0f5', icon: '🥚', stackable: true, energyRestore: 30 },
  { id: 'prod_rabbit_wool', name: 'Soft Rabbit Fur', nameTh: 'ขนกระต่ายนุ่ม', category: 'animal_product', description: 'ขนนุ่มละเอียด ราคาดีมาก', sellPrice: 165, color: '#f5dce0', icon: '🧶', stackable: true },
  { id: 'prod_milk', name: 'Creamy Milk', nameTh: 'นมสดหอมมัน', category: 'animal_product', description: 'นมวัวสดจากทุ่งหญ้า ฟื้นฟู Stamina +35', sellPrice: 145, color: '#ffffff', icon: '🥛', stackable: true, energyRestore: 35, hpRestore: 15 },
  { id: 'prod_goat_milk', name: 'Goat Milk', nameTh: 'นมแพะพรีเมียม', category: 'animal_product', description: 'นมแพะภูเขาเข้มข้น ฟื้นฟู Stamina +50', sellPrice: 230, color: '#fdf6e7', icon: '🍶', stackable: true, energyRestore: 50, hpRestore: 25 },
  { id: 'prod_wool', name: 'Cloud Wool', nameTh: 'ขนแกะเนื้อละเอียด', category: 'animal_product', description: 'ขนแกะขาวสะอาดจากแกะเมฆขาว', sellPrice: 260, color: '#f8fafc', icon: '🐑', stackable: true },
  { id: 'prod_truffle', name: 'Black Truffle', nameTh: 'เห็ดทรัฟเฟิลดำ', category: 'animal_product', description: 'วัตถุดิบหายากระดับภัตตาคารที่หมูขุดพบ', sellPrice: 420, color: '#4a3b32', icon: '🍄', stackable: true, energyRestore: 45 },

  // ORES, GEMS & RARE MATERIALS
  { id: 'ore_stone', name: 'Stone', nameTh: 'หินธรรมชาติ', category: 'ore', description: 'ใช้ในการคราฟต์และก่อสร้าง', sellPrice: 5, color: '#8c9296', icon: '🪨', stackable: true },
  { id: 'ore_copper', name: 'Copper Ore', nameTh: 'แร่ทองแดง', category: 'ore', description: 'แร่พื้นฐานจาก Crystal Mine ชั้น 1–3', sellPrice: 25, color: '#d97742', icon: '🟠', stackable: true },
  { id: 'ore_iron', name: 'Iron Ore', nameTh: 'แร่เหล็ก', category: 'ore', description: 'แร่แข็งแรงจาก Crystal Mine ชั้น 2–6', sellPrice: 45, color: '#94a3b8', icon: '⚪', stackable: true },
  { id: 'ore_silver', name: 'Silver Ore', nameTh: 'แร่เงิน', category: 'ore', description: 'แร่เงินแวววาวจากชั้น 4–8', sellPrice: 80, color: '#e2e8f0', icon: '🪙', stackable: true },
  { id: 'ore_gold', name: 'Gold Ore', nameTh: 'แร่ทองคำ', category: 'ore', description: 'แร่ทองคำหายากจากชั้น 5–10', sellPrice: 135, color: '#fbbf24', icon: '🟡', stackable: true },
  { id: 'ore_crystal', name: 'Crystal Shard', nameTh: 'ผลึกคริสตัล', category: 'gem', description: 'คริสตัลเรืองแสงจากชั้นลึกของเหมือง', sellPrice: 190, color: '#38bdf8', icon: '💎', stackable: true },
  { id: 'gem_amethyst', name: 'Amethyst', nameTh: 'อเมทิสต์', category: 'gem', description: 'อัญมณีสีม่วงลึกลับ', sellPrice: 220, color: '#a855f7', icon: '🔮', stackable: true },
  { id: 'gem_ruby', name: 'Ruby', nameTh: 'ทับทิม', category: 'gem', description: 'อัญมณีสีแดงเพลิง', sellPrice: 280, color: '#ef4444', icon: '♦️', stackable: true },
  { id: 'gem_emerald', name: 'Emerald', nameTh: 'มรกต', category: 'gem', description: 'อัญมณีสีเขียวมรกตแห่งหุบเขา', sellPrice: 310, color: '#10b981', icon: '❇️', stackable: true },
  { id: 'ore_starlight', name: 'Starlight Shard', nameTh: 'เศษแสงดาว (Rare)', category: 'gem', description: 'วัสดุหายากระดับตำนานจากบอส Crystal Guardian และชั้นลึก', sellPrice: 550, color: '#fde047', icon: '✨', stackable: true },

  // FORAGEABLES
  { id: 'forage_wood', name: 'Pine Wood', nameTh: 'ไม้สน', category: 'forage', description: 'ไม้สำหรับคราฟต์รั้วและสิ่งปลูกสร้าง', sellPrice: 6, color: '#966031', icon: '🪵', stackable: true },
  { id: 'forage_hardwood', name: 'Ancient Hardwood', nameTh: 'ไม้เนื้อแข็งโบราณ', category: 'forage', description: 'ไม้หายากจากป่า Enchanted Forest', sellPrice: 35, color: '#6b3e1f', icon: '🪵', stackable: true },
  { id: 'forage_wild_herb', name: 'Wild Herb', nameTh: 'สมุนไพรป่า', category: 'forage', description: 'สมุนไพรหอมจากป่า ฟื้นฟู Stamina +20', sellPrice: 28, color: '#5cb84d', icon: '🌿', stackable: true, energyRestore: 20, hpRestore: 10 },
  { id: 'forage_glow_mushroom', name: 'Glow Mushroom', nameTh: 'เห็ดเรืองแสง', category: 'forage', description: 'เห็ดเรืองแสงหายากจาก Enchanted Forest', sellPrice: 65, color: '#67e8f9', icon: '🍄', stackable: true, energyRestore: 30, hpRestore: 20 },
  { id: 'forage_shell', name: 'Sea Shell', nameTh: 'เปลือกหอยสีมุก', category: 'forage', description: 'เปลือกหอยสวยงามจากชายหาด Sunlit Beach', sellPrice: 42, color: '#fbcfe8', icon: '🐚', stackable: true },

  // CRAFTABLES & CONSUMABLES & GIFTS
  { id: 'craft_fertilizer', name: 'Rich Fertilizer', nameTh: 'ปุ๋ยบำรุงดิน', category: 'craftable', description: 'ใส่บนดินที่พรวนแล้วช่วยให้พืชโตไวขึ้น 2 เท่า!', buyPrice: 40, sellPrice: 15, color: '#854d0e', icon: '🌱', stackable: true },
  { id: 'craft_fence', name: 'Wooden Fence', nameTh: 'รั้วไม้ตกแต่งฟาร์ม', category: 'craftable', description: 'วางตกแต่งบนพื้นที่ฟาร์มได้', buyPrice: 30, sellPrice: 10, color: '#a86e3b', icon: '🪵', stackable: true },
  { id: 'consumable_hp_potion', name: 'Health Potion', nameTh: 'ยาฟื้นพลังชีวิต', category: 'consumable', description: 'ฟื้นฟู HP +55 ทันที', buyPrice: 120, sellPrice: 45, color: '#f43f5e', icon: '🧪', stackable: true, hpRestore: 55 },
  { id: 'consumable_energy_tonic', name: 'Energy Tonic', nameTh: 'ยาฟื้นพลังงาน', category: 'consumable', description: 'ฟื้นฟู Stamina +65 ทันที', buyPrice: 110, sellPrice: 40, color: '#84cc16', icon: '⚡', stackable: true, energyRestore: 65 },
  { id: 'gift_starlight_pendant', name: 'Starlight Pendant', nameTh: 'จี้แสงดาว (ขอแต่งงาน)', category: 'gift', description: 'มอบให้ NPC ที่แต่งงานได้เมื่อมีหัวใจครบ 6 ดวงขึ้นไปเพื่อแต่งงาน!', buyPrice: 1500, sellPrice: 500, color: '#f472b6', icon: '💍', stackable: false },
];

const CROP_ITEMS: ItemDefinition[] = CROPS.flatMap((c) => [
  {
    id: c.seedId,
    name: `${c.name} Seeds`,
    nameTh: `เมล็ด${c.nameTh}`,
    category: 'seed' as const,
    description: `ฤดู: ${c.seasons.join(', ')} • โตใน ${c.growthDays} วัน${c.regrowDays ? ` (เก็บซ้ำได้ทุก ${c.regrowDays} วัน)` : ''}`,
    buyPrice: c.seedPrice,
    sellPrice: Math.floor(c.seedPrice / 2),
    color: c.color,
    accentColor: c.accentColor,
    icon: '🌰',
    stackable: true,
    cropId: c.id,
  },
  {
    id: c.harvestItemId,
    name: c.name,
    nameTh: c.nameTh,
    category: 'crop' as const,
    description: `ผลผลิตสดจากฟาร์ม ขายได้ ${c.sellPrice} G • กินฟื้นฟู Stamina +22`,
    sellPrice: c.sellPrice,
    color: c.color,
    accentColor: c.accentColor,
    icon: '🧺',
    stackable: true,
    cropId: c.id,
    energyRestore: 22,
    hpRestore: 10,
  },
]);

const FISH_ITEMS: ItemDefinition[] = FISH_LIST.map((f) => ({
  id: f.id,
  name: f.name,
  nameTh: f.nameTh,
  category: 'fish',
  description: `ระดับ: ${f.rarity} • ขายได้ ${f.sellPrice} G`,
  sellPrice: f.sellPrice,
  color: f.color,
  icon: '🐟',
  stackable: true,
  energyRestore: 25,
  hpRestore: 12,
}));

export const ALL_ITEMS: ItemDefinition[] = [...BASE_ITEMS, ...CROP_ITEMS, ...FISH_ITEMS];

export const ITEM_BY_ID: Record<string, ItemDefinition> = Object.fromEntries(
  ALL_ITEMS.map((item) => [item.id, item])
);

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'rec_fertilizer',
    outputItemId: 'craft_fertilizer',
    outputQty: 3,
    nameTh: 'ปุ๋ยบำรุงดิน x3',
    description: 'ช่วยให้พืชโตเร็วขึ้น 2 เท่า',
    ingredients: [
      { itemId: 'forage_wild_herb', qty: 1 },
      { itemId: 'forage_wood', qty: 2 },
    ],
  },
  {
    id: 'rec_fence',
    outputItemId: 'craft_fence',
    outputQty: 4,
    nameTh: 'รั้วไม้ตกแต่งฟาร์ม x4',
    description: 'ใช้วางตกแต่งพื้นที่ฟาร์ม',
    ingredients: [{ itemId: 'forage_wood', qty: 4 }],
  },
  {
    id: 'rec_hp_potion',
    outputItemId: 'consumable_hp_potion',
    outputQty: 2,
    nameTh: 'ยาฟื้นพลังชีวิต x2',
    description: 'ฟื้นฟู HP +55 สำหรับลงเหมือง',
    ingredients: [
      { itemId: 'forage_wild_herb', qty: 2 },
      { itemId: 'forage_glow_mushroom', qty: 1 },
    ],
  },
  {
    id: 'rec_energy_tonic',
    outputItemId: 'consumable_energy_tonic',
    outputQty: 2,
    nameTh: 'ยาฟื้นพลังงาน x2',
    description: 'ฟื้นฟู Stamina +65 ทันที',
    ingredients: [
      { itemId: 'forage_wild_herb', qty: 2 },
      { itemId: 'ore_copper', qty: 1 },
    ],
  },
  {
    id: 'rec_crystal_blade',
    outputItemId: 'weapon_sword_crystal',
    outputQty: 1,
    nameTh: 'ดาบคริสตัล (ATK +36)',
    description: 'อาวุธระดับสูงสำหรับปราบบอส Crystal Guardian',
    ingredients: [
      { itemId: 'ore_iron', qty: 5 },
      { itemId: 'ore_crystal', qty: 4 },
      { itemId: 'ore_gold', qty: 2 },
    ],
  },
  {
    id: 'rec_star_staff',
    outputItemId: 'weapon_staff_star',
    outputQty: 1,
    nameTh: 'คทาเวทแสงดาว (ATK +30)',
    description: 'ยิงเวทมนตร์ระยะไกล',
    ingredients: [
      { itemId: 'forage_hardwood', qty: 3 },
      { itemId: 'gem_amethyst', qty: 2 },
      { itemId: 'ore_crystal', qty: 2 },
    ],
  },
  {
    id: 'rec_crystal_armor',
    outputItemId: 'armor_crystal',
    outputQty: 1,
    nameTh: 'ชุดเกราะคริสตัล (DEF +15)',
    description: 'ลดความเสียหายจากมอนสเตอร์และบอสอย่างมาก',
    ingredients: [
      { itemId: 'ore_silver', qty: 4 },
      { itemId: 'ore_crystal', qty: 5 },
    ],
  },
];
