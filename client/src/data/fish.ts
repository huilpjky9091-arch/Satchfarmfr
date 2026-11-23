import type { FishDefinition } from '@shared/index';

export const FISH_LIST: FishDefinition[] = [
  // Common & Uncommon Freshwater (Farm Pond, Lake, Mountain)
  { id: 'fish_silver_minnow', name: 'Silver Minnow', nameTh: 'ปลาซิวเงิน', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], zones: ['farm', 'lake'], weather: 'any', timeRange: [6, 23], rarity: 'Common', difficulty: 1, sellPrice: 35, color: '#b8d4e8' },
  { id: 'fish_brook_trout', name: 'Brook Trout', nameTh: 'ปลาเทราต์ลำธาร', seasons: ['Spring', 'Autumn'], zones: ['lake', 'mountain'], weather: 'any', timeRange: [6, 20], rarity: 'Common', difficulty: 2, sellPrice: 55, color: '#7ea878' },
  { id: 'fish_sun_perch', name: 'Sun Perch', nameTh: 'ปลาเพิร์ชตะวัน', seasons: ['Spring', 'Summer'], zones: ['farm', 'lake'], weather: ['Sunny'], timeRange: [7, 18], rarity: 'Common', difficulty: 2, sellPrice: 50, color: '#e6b84c' },
  { id: 'fish_moss_carp', name: 'Moss Carp', nameTh: 'ปลาคาร์ปมอส', seasons: ['Spring', 'Summer', 'Autumn'], zones: ['farm', 'lake'], weather: 'any', timeRange: [6, 23], rarity: 'Common', difficulty: 2, sellPrice: 48, color: '#6e8c56' },
  { id: 'fish_mud_catfish', name: 'River Catfish', nameTh: 'ปลาดุกแม่น้ำ', seasons: ['Spring', 'Autumn'], zones: ['lake', 'forest'], weather: ['Rainy', 'Storm'], timeRange: [6, 23], rarity: 'Uncommon', difficulty: 5, sellPrice: 125, color: '#6b645c' },
  { id: 'fish_emerald_bass', name: 'Emerald Bass', nameTh: 'ปลากะพงมรกต', seasons: ['Spring', 'Summer', 'Autumn'], zones: ['lake'], weather: 'any', timeRange: [6, 21], rarity: 'Uncommon', difficulty: 4, sellPrice: 95, color: '#459e6b' },
  { id: 'fish_amber_pike', name: 'Amber Pike', nameTh: 'ปลาไพค์อำพัน', seasons: ['Summer', 'Autumn'], zones: ['lake', 'mountain'], weather: 'any', timeRange: [6, 22], rarity: 'Uncommon', difficulty: 4, sellPrice: 105, color: '#cc893b' },
  { id: 'fish_night_bullhead', name: 'Twilight Bullhead', nameTh: 'ปลาบูลเฮดยามค่ำ', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], zones: ['farm', 'lake', 'mountain'], weather: 'any', timeRange: [18, 23], rarity: 'Uncommon', difficulty: 3, sellPrice: 88, color: '#545b73' },
  { id: 'fish_golden_koi', name: 'Golden Koi', nameTh: 'ปลาคาร์ปทองคำ', seasons: ['Spring', 'Summer'], zones: ['farm', 'lake', 'secret'], weather: ['Sunny'], timeRange: [8, 17], rarity: 'Rare', difficulty: 6, sellPrice: 210, color: '#f7b731' },
  { id: 'fish_rain_eel', name: 'Rain Eel', nameTh: 'ปลาไหลสายฝน', seasons: ['Spring', 'Autumn'], zones: ['lake', 'beach'], weather: ['Rainy', 'Storm'], timeRange: [16, 23], rarity: 'Rare', difficulty: 6, sellPrice: 185, color: '#4d6b8a' },
  { id: 'fish_jade_salmon', name: 'Jade Salmon', nameTh: 'แซลมอนหยก', seasons: ['Autumn'], zones: ['lake', 'mountain'], weather: 'any', timeRange: [6, 20], rarity: 'Uncommon', difficulty: 4, sellPrice: 115, color: '#e87a6b' },
  { id: 'fish_frost_chub', name: 'Frost Chub', nameTh: 'ปลาชับเหมันต์', seasons: ['Winter'], zones: ['lake', 'mountain'], weather: 'any', timeRange: [6, 22], rarity: 'Common', difficulty: 3, sellPrice: 68, color: '#9cd6f0' },
  { id: 'fish_ice_sturgeon', name: 'Ice Sturgeon', nameTh: 'ปลาสเตอร์เจียนน้ำแข็ง', seasons: ['Winter', 'Summer'], zones: ['mountain', 'lake'], weather: 'any', timeRange: [6, 19], rarity: 'Rare', difficulty: 7, sellPrice: 240, color: '#789bb8' },
  { id: 'fish_crystal_darter', name: 'Crystal Darter', nameTh: 'ปลาดาร์เตอร์คริสตัล', seasons: ['Winter', 'Spring'], zones: ['mountain', 'secret'], weather: 'any', timeRange: [6, 23], rarity: 'Rare', difficulty: 6, sellPrice: 195, color: '#8ae3ff' },
  { id: 'fish_blossom_guppy', name: 'Blossom Guppy', nameTh: 'ปลาหางนกยูงซากุระ', seasons: ['Spring'], zones: ['farm', 'lake', 'secret'], weather: ['Sunny'], timeRange: [7, 17], rarity: 'Uncommon', difficulty: 2, sellPrice: 82, color: '#f598b5' },
  { id: 'fish_autumn_bream', name: 'Maple Bream', nameTh: 'ปลาบรีมเมเปิล', seasons: ['Autumn'], zones: ['farm', 'lake'], weather: 'any', timeRange: [12, 23], rarity: 'Common', difficulty: 3, sellPrice: 64, color: '#d96b38' },
  { id: 'fish_mist_walleye', name: 'Mist Walleye', nameTh: 'ปลาวอลล์อายสายหมอก', seasons: ['Autumn', 'Winter'], zones: ['lake', 'mountain'], weather: ['Fog', 'Rainy'], timeRange: [14, 23], rarity: 'Rare', difficulty: 6, sellPrice: 190, color: '#98a6b3' },
  { id: 'fish_shadow_loach', name: 'Shadow Loach', nameTh: 'ปลาหมูเงา', seasons: ['Autumn', 'Winter'], zones: ['forest', 'secret'], weather: 'any', timeRange: [18, 23], rarity: 'Rare', difficulty: 6, sellPrice: 175, color: '#4c4166' },
  { id: 'fish_emerald_chub', name: 'Forest Chub', nameTh: 'ปลาชับป่าลึก', seasons: ['Spring', 'Summer', 'Autumn'], zones: ['forest', 'lake'], weather: 'any', timeRange: [6, 20], rarity: 'Common', difficulty: 2, sellPrice: 52, color: '#589c52' },
  { id: 'fish_honey_shad', name: 'Honey Shad', nameTh: 'ปลาแชดน้ำผึ้ง', seasons: ['Spring', 'Summer', 'Autumn'], zones: ['lake'], weather: ['Rainy'], timeRange: [9, 22], rarity: 'Uncommon', difficulty: 4, sellPrice: 92, color: '#e6c167' },

  // Ocean & Beach Fish (17)
  { id: 'fish_azure_sardine', name: 'Azure Sardine', nameTh: 'ปลาซาร์ดีนฟ้าคราม', seasons: ['Spring', 'Autumn', 'Winter'], zones: ['beach'], weather: 'any', timeRange: [6, 19], rarity: 'Common', difficulty: 1, sellPrice: 40, color: '#4e8cd9' },
  { id: 'fish_coral_snapper', name: 'Coral Snapper', nameTh: 'ปลากะพงปะการัง', seasons: ['Summer', 'Autumn'], zones: ['beach'], weather: 'any', timeRange: [6, 20], rarity: 'Uncommon', difficulty: 4, sellPrice: 110, color: '#eb5e55' },
  { id: 'fish_sun_flounder', name: 'Sun Flounder', nameTh: 'ปลาตาเดียวหาดทราย', seasons: ['Spring', 'Summer'], zones: ['beach'], weather: 'any', timeRange: [6, 20], rarity: 'Common', difficulty: 3, sellPrice: 70, color: '#d4b27a' },
  { id: 'fish_cobalt_tuna', name: 'Cobalt Tuna', nameTh: 'ทูน่าโคบอลต์', seasons: ['Summer', 'Winter'], zones: ['beach'], weather: 'any', timeRange: [6, 19], rarity: 'Rare', difficulty: 6, sellPrice: 185, color: '#2b59a3' },
  { id: 'fish_silver_herring', name: 'Silver Herring', nameTh: 'ปลาแฮร์ริ่งเงิน', seasons: ['Spring', 'Winter'], zones: ['beach'], weather: 'any', timeRange: [6, 23], rarity: 'Common', difficulty: 2, sellPrice: 42, color: '#c4d4e0' },
  { id: 'fish_pearl_mullet', name: 'Pearl Mullet', nameTh: 'ปลากระบอกไข่มุก', seasons: ['Summer'], zones: ['beach'], weather: ['Sunny'], timeRange: [6, 19], rarity: 'Uncommon', difficulty: 4, sellPrice: 98, color: '#e3e8eb' },
  { id: 'fish_tide_halibut', name: 'Tide Halibut', nameTh: 'ปลาฮาลิบัตคลื่น', seasons: ['Spring', 'Summer', 'Winter'], zones: ['beach'], weather: 'any', timeRange: [6, 11], rarity: 'Uncommon', difficulty: 5, sellPrice: 120, color: '#8f7d65' },
  { id: 'fish_reef_puffer', name: 'Reef Puffer', nameTh: 'ปลาปักเป้าปะการัง', seasons: ['Summer'], zones: ['beach'], weather: ['Sunny'], timeRange: [12, 16], rarity: 'Rare', difficulty: 7, sellPrice: 230, color: '#f2c94c' },
  { id: 'fish_midnight_squid', name: 'Midnight Squid', nameTh: 'หมึกเที่ยงคืน', seasons: ['Winter', 'Autumn'], zones: ['beach'], weather: 'any', timeRange: [18, 23], rarity: 'Rare', difficulty: 6, sellPrice: 195, color: '#6448a8' },
  { id: 'fish_crimson_octopus', name: 'Crimson Octopus', nameTh: 'หมึกยักษ์แดง', seasons: ['Summer'], zones: ['beach'], weather: 'any', timeRange: [6, 14], rarity: 'Epic', difficulty: 8, sellPrice: 310, color: '#c93848' },
  { id: 'fish_lantern_cucumber', name: 'Lantern Sea Cucumber', nameTh: 'ปลิงทะเลโคมไฟ', seasons: ['Autumn', 'Winter'], zones: ['beach'], weather: 'any', timeRange: [17, 23], rarity: 'Uncommon', difficulty: 3, sellPrice: 105, color: '#e89b3c' },
  { id: 'fish_storm_marlin', name: 'Storm Marlin', nameTh: 'ปลามาร์ลินพายุ', seasons: ['Summer', 'Autumn'], zones: ['beach'], weather: ['Rainy', 'Storm'], timeRange: [6, 20], rarity: 'Epic', difficulty: 8, sellPrice: 340, color: '#2b78c7' },
  { id: 'fish_amber_mackerel', name: 'Amber Mackerel', nameTh: 'ปลาทูอำพัน', seasons: ['Spring', 'Autumn'], zones: ['beach'], weather: 'any', timeRange: [6, 21], rarity: 'Common', difficulty: 2, sellPrice: 58, color: '#5c94bd' },
  { id: 'fish_star_seahorse', name: 'Starlight Seahorse', nameTh: 'ม้าน้ำแสงดาว', seasons: ['Spring', 'Summer'], zones: ['beach', 'secret'], weather: ['Sunny'], timeRange: [8, 18], rarity: 'Rare', difficulty: 5, sellPrice: 215, color: '#f5b041' },
  { id: 'fish_opal_anchovy', name: 'Opal Anchovy', nameTh: 'ปลาแอนโชวี่โอปอล', seasons: ['Spring', 'Autumn'], zones: ['beach'], weather: 'any', timeRange: [6, 23], rarity: 'Common', difficulty: 1, sellPrice: 38, color: '#8ac4e8' },
  { id: 'fish_ruby_grouper', name: 'Ruby Grouper', nameTh: 'ปลาเก๋าทับทิม', seasons: ['Summer', 'Autumn'], zones: ['beach'], weather: 'any', timeRange: [10, 22], rarity: 'Rare', difficulty: 6, sellPrice: 205, color: '#c43e4c' },
  { id: 'fish_glacier_cod', name: 'Glacier Cod', nameTh: 'ปลาค็อดธารน้ำแข็ง', seasons: ['Winter'], zones: ['beach'], weather: ['Snow', 'Sunny'], timeRange: [6, 22], rarity: 'Uncommon', difficulty: 4, sellPrice: 112, color: '#a8cbe0' },

  // 5 LEGENDARY FISH (42 total!)
  { id: 'fish_leg_spring_emperor', name: 'Emerald Sovereign', nameTh: 'ราชันย์มรกต (Legendary)', seasons: ['Spring'], zones: ['mountain', 'lake'], weather: ['Rainy', 'Storm'], timeRange: [6, 20], rarity: 'Legendary', difficulty: 9, sellPrice: 1200, color: '#2ecc71' },
  { id: 'fish_leg_summer_leviathan', name: 'Solar Leviathan', nameTh: 'เลเวียธานสุริยะ (Legendary)', seasons: ['Summer'], zones: ['beach'], weather: ['Sunny'], timeRange: [10, 17], rarity: 'Legendary', difficulty: 9, sellPrice: 1350, color: '#ff6b35' },
  { id: 'fish_leg_autumn_specter', name: 'Crimson Specter', nameTh: 'ภูตวารีแดงฉาน (Legendary)', seasons: ['Autumn'], zones: ['lake', 'forest'], weather: 'any', timeRange: [16, 23], rarity: 'Legendary', difficulty: 9, sellPrice: 1250, color: '#e63946' },
  { id: 'fish_leg_winter_frostwing', name: 'Glacier Frostwing', nameTh: 'ปีกเหมันต์ธารน้ำแข็ง (Legendary)', seasons: ['Winter'], zones: ['mountain', 'beach'], weather: ['Snow', 'Fog'], timeRange: [6, 22], rarity: 'Legendary', difficulty: 10, sellPrice: 1400, color: '#74c0fc' },
  { id: 'fish_leg_sanctuary_celestial', name: 'Celestial Arowana', nameTh: 'มังกรเงินแห่งวิหารลับ (Legendary)', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], zones: ['secret'], weather: 'any', timeRange: [6, 23], rarity: 'Legendary', difficulty: 10, sellPrice: 2000, color: '#ffd43b' },
];

export const FISH_BY_ID: Record<string, FishDefinition> = Object.fromEntries(
  FISH_LIST.map((f) => [f.id, f])
);
