import type { CropDefinition } from '@shared/index';

export const CROPS: CropDefinition[] = [
  // SPRING (8)
  { id: 'sun_radish', seedId: 'seed_sun_radish', harvestItemId: 'crop_sun_radish', name: 'Sun Radish', nameTh: 'หัวไชเท้าตะวัน', seasons: ['Spring'], growthDays: 3, seedPrice: 20, sellPrice: 45, color: '#f06277', accentColor: '#76c45e' },
  { id: 'meadow_pea', seedId: 'seed_meadow_pea', harvestItemId: 'crop_meadow_pea', name: 'Meadow Pea', nameTh: 'ถั่วทุ่งหญ้า', seasons: ['Spring'], growthDays: 4, seedPrice: 35, sellPrice: 55, regrowDays: 2, color: '#69c95b', accentColor: '#c8f59a' },
  { id: 'dew_berry', seedId: 'seed_dew_berry', harvestItemId: 'crop_dew_berry', name: 'Dew Berry', nameTh: 'เบอร์รี่น้ำค้าง', seasons: ['Spring'], growthDays: 5, seedPrice: 60, sellPrice: 95, regrowDays: 3, color: '#e83f6f', accentColor: '#ff9eb8' },
  { id: 'emerald_lettuce', seedId: 'seed_emerald_lettuce', harvestItemId: 'crop_emerald_lettuce', name: 'Emerald Lettuce', nameTh: 'ผักกาดมรกต', seasons: ['Spring'], growthDays: 3, seedPrice: 25, sellPrice: 52, color: '#4cb551', accentColor: '#a2e88b' },
  { id: 'spring_carrot', seedId: 'seed_spring_carrot', harvestItemId: 'crop_spring_carrot', name: 'Honey Carrot', nameTh: 'แครอทน้ำผึ้ง', seasons: ['Spring'], growthDays: 4, seedPrice: 30, sellPrice: 68, color: '#f08733', accentColor: '#5cb84d' },
  { id: 'cloud_cauliflower', seedId: 'seed_cloud_cauliflower', harvestItemId: 'crop_cloud_cauliflower', name: 'Cloud Cauliflower', nameTh: 'กะหล่ำดอกเมฆ', seasons: ['Spring'], growthDays: 6, seedPrice: 70, sellPrice: 165, color: '#f4f0e4', accentColor: '#569c4c' },
  { id: 'breeze_tulip', seedId: 'seed_breeze_tulip', harvestItemId: 'crop_breeze_tulip', name: 'Breeze Tulip', nameTh: 'ทิวลิปสายลม', seasons: ['Spring'], growthDays: 4, seedPrice: 30, sellPrice: 75, color: '#f598b5', accentColor: '#ffe066' },
  { id: 'dawn_garlic', seedId: 'seed_dawn_garlic', harvestItemId: 'crop_dawn_garlic', name: 'Dawn Garlic', nameTh: 'กระเทียมรุ่งอรุณ', seasons: ['Spring'], growthDays: 4, seedPrice: 35, sellPrice: 78, color: '#efe5d1', accentColor: '#c9a9d6' },

  // SUMMER (8)
  { id: 'ruby_tomato', seedId: 'seed_ruby_tomato', harvestItemId: 'crop_ruby_tomato', name: 'Ruby Tomato', nameTh: 'มะเขือเทศทับทิม', seasons: ['Summer'], growthDays: 5, seedPrice: 45, sellPrice: 65, regrowDays: 2, color: '#e33b3b', accentColor: '#52a647' },
  { id: 'golden_corn', seedId: 'seed_golden_corn', harvestItemId: 'crop_golden_corn', name: 'Golden Corn', nameTh: 'ข้าวโพดทองคำ', seasons: ['Summer', 'Autumn'], growthDays: 6, seedPrice: 75, sellPrice: 80, regrowDays: 3, color: '#f7ca3e', accentColor: '#66b54c' },
  { id: 'sun_melon', seedId: 'seed_sun_melon', harvestItemId: 'crop_sun_melon', name: 'Sun Melon', nameTh: 'เมล่อนสุริยะ', seasons: ['Summer'], growthDays: 7, seedPrice: 85, sellPrice: 220, color: '#f5a162', accentColor: '#ffe194' },
  { id: 'sky_blueberry', seedId: 'seed_sky_blueberry', harvestItemId: 'crop_sky_blueberry', name: 'Sky Blueberry', nameTh: 'บลูเบอร์รี่ฟ้าใส', seasons: ['Summer'], growthDays: 6, seedPrice: 80, sellPrice: 95, regrowDays: 3, color: '#457be0', accentColor: '#98c1ff' },
  { id: 'flame_pepper', seedId: 'seed_flame_pepper', harvestItemId: 'crop_flame_pepper', name: 'Flame Pepper', nameTh: 'พริกเปลวไฟ', seasons: ['Summer'], growthDays: 4, seedPrice: 40, sellPrice: 62, regrowDays: 2, color: '#e85127', accentColor: '#ffc247' },
  { id: 'star_pineapple', seedId: 'seed_star_pineapple', harvestItemId: 'crop_star_pineapple', name: 'Star Pineapple', nameTh: 'สับปะรดดารา', seasons: ['Summer'], growthDays: 7, seedPrice: 95, sellPrice: 245, color: '#ebba34', accentColor: '#489e47' },
  { id: 'radiant_sunflower', seedId: 'seed_radiant_sunflower', harvestItemId: 'crop_radiant_sunflower', name: 'Radiant Sunflower', nameTh: 'ทานตะวันจรัสแสง', seasons: ['Summer', 'Autumn'], growthDays: 5, seedPrice: 50, sellPrice: 120, color: '#ffd43b', accentColor: '#6b3e1f' },
  { id: 'amber_wheat', seedId: 'seed_amber_wheat', harvestItemId: 'crop_amber_wheat', name: 'Amber Wheat', nameTh: 'ข้าวสาลีอำพัน', seasons: ['Summer', 'Autumn'], growthDays: 3, seedPrice: 15, sellPrice: 38, color: '#e3bd64', accentColor: '#f7e19c' },

  // AUTUMN (8)
  { id: 'harvest_pumpkin', seedId: 'seed_harvest_pumpkin', harvestItemId: 'crop_harvest_pumpkin', name: 'Harvest Pumpkin', nameTh: 'ฟักทองฤดูเก็บเกี่ยว', seasons: ['Autumn'], growthDays: 7, seedPrice: 90, sellPrice: 250, color: '#e67824', accentColor: '#4e8a3b' },
  { id: 'crimson_yam', seedId: 'seed_crimson_yam', harvestItemId: 'crop_crimson_yam', name: 'Crimson Yam', nameTh: 'มันม่วงทับทิม', seasons: ['Autumn'], growthDays: 5, seedPrice: 55, sellPrice: 135, color: '#9c4375', accentColor: '#d98ab7' },
  { id: 'velvet_eggplant', seedId: 'seed_velvet_eggplant', harvestItemId: 'crop_velvet_eggplant', name: 'Velvet Eggplant', nameTh: 'มะเขือม่วงกำมะหยี่', seasons: ['Autumn'], growthDays: 4, seedPrice: 40, sellPrice: 68, regrowDays: 2, color: '#6b3fa0', accentColor: '#569c4c' },
  { id: 'scarlet_cranberry', seedId: 'seed_scarlet_cranberry', harvestItemId: 'crop_scarlet_cranberry', name: 'Scarlet Cranberry', nameTh: 'แครนเบอร์รี่แดงชาด', seasons: ['Autumn'], growthDays: 5, seedPrice: 75, sellPrice: 100, regrowDays: 3, color: '#c42741', accentColor: '#ff788e' },
  { id: 'maple_beet', seedId: 'seed_maple_beet', harvestItemId: 'crop_maple_beet', name: 'Maple Beet', nameTh: 'บีทรูทเมเปิล', seasons: ['Autumn'], growthDays: 4, seedPrice: 35, sellPrice: 88, color: '#a82a4e', accentColor: '#6bb359' },
  { id: 'cider_grape', seedId: 'seed_cider_grape', harvestItemId: 'crop_cider_grape', name: 'Cider Grape', nameTh: 'องุ่นไซเดอร์', seasons: ['Autumn'], growthDays: 5, seedPrice: 65, sellPrice: 90, regrowDays: 2, color: '#7b4bb8', accentColor: '#b993eb' },
  { id: 'spice_ginger', seedId: 'seed_spice_ginger', harvestItemId: 'crop_spice_ginger', name: 'Spice Ginger', nameTh: 'ขิงหอม', seasons: ['Autumn'], growthDays: 4, seedPrice: 45, sellPrice: 105, color: '#d9a45b', accentColor: '#75b557' },
  { id: 'moon_chrysanthemum', seedId: 'seed_moon_chrysanthemum', harvestItemId: 'crop_moon_chrysanthemum', name: 'Moon Mum', nameTh: 'เบญจมาศจันทรา', seasons: ['Autumn'], growthDays: 5, seedPrice: 50, sellPrice: 130, color: '#f2c94c', accentColor: '#fff0b3' },

  // WINTER (8)
  { id: 'frost_turnip', seedId: 'seed_frost_turnip', harvestItemId: 'crop_frost_turnip', name: 'Frost Turnip', nameTh: 'เทอร์นิปน้ำแข็ง', seasons: ['Winter'], growthDays: 4, seedPrice: 30, sellPrice: 75, color: '#9ee0f5', accentColor: '#e8f9ff' },
  { id: 'snow_berry', seedId: 'seed_snow_berry', harvestItemId: 'crop_snow_berry', name: 'Snow Berry', nameTh: 'เบอร์รี่หิมะ', seasons: ['Winter'], growthDays: 5, seedPrice: 65, sellPrice: 98, regrowDays: 3, color: '#d6f0ff', accentColor: '#5ea7e6' },
  { id: 'glacier_mint', seedId: 'seed_glacier_mint', harvestItemId: 'crop_glacier_mint', name: 'Glacier Mint', nameTh: 'มินต์ธารน้ำแข็ง', seasons: ['Winter'], growthDays: 3, seedPrice: 35, sellPrice: 80, color: '#5ee3c6', accentColor: '#c4fff2' },
  { id: 'crystal_lotus', seedId: 'seed_crystal_lotus', harvestItemId: 'crop_crystal_lotus', name: 'Crystal Lotus', nameTh: 'บัวคริสตัล', seasons: ['Winter'], growthDays: 7, seedPrice: 110, sellPrice: 285, color: '#b5d6ff', accentColor: '#ffffff' },
  { id: 'winter_leek', seedId: 'seed_winter_leek', harvestItemId: 'crop_winter_leek', name: 'Winter Leek', nameTh: 'ต้นหอมเหมันต์', seasons: ['Winter'], growthDays: 4, seedPrice: 30, sellPrice: 72, color: '#8bd48e', accentColor: '#edf7ed' },
  { id: 'aurora_plum', seedId: 'seed_aurora_plum', harvestItemId: 'crop_aurora_plum', name: 'Aurora Plum', nameTh: 'พลัมแสงเหนือ', seasons: ['Winter'], growthDays: 6, seedPrice: 85, sellPrice: 215, color: '#9f7aea', accentColor: '#63e6be' },
  { id: 'pine_truffle_root', seedId: 'seed_pine_truffle_root', harvestItemId: 'crop_pine_truffle_root', name: 'Pine Root', nameTh: 'รากสนหิมะ', seasons: ['Winter'], growthDays: 5, seedPrice: 55, sellPrice: 140, color: '#b08968', accentColor: '#e6ccb2' },
  { id: 'starlight_rose', seedId: 'seed_starlight_rose', harvestItemId: 'crop_starlight_rose', name: 'Starlight Rose', nameTh: 'กุหลาบแสงดาว', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], growthDays: 8, seedPrice: 150, sellPrice: 390, color: '#ff85c0', accentColor: '#fff2a6' },
];

export const CROP_BY_ID: Record<string, CropDefinition> = Object.fromEntries(
  CROPS.map((c) => [c.id, c])
);
export const CROP_BY_SEED_ID: Record<string, CropDefinition> = Object.fromEntries(
  CROPS.map((c) => [c.seedId, c])
);
