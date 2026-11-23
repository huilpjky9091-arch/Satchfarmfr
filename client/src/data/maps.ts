import type { ZoneId } from '@shared/index';

export interface WarpPoint {
  col: number;
  row: number;
  width: number;
  height: number;
  targetZone: ZoneId;
  targetCol: number;
  targetRow: number;
  label: string;
  requiresSecret?: boolean;
}

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  nameTh: string;
  cols: number;
  rows: number;
  defaultSpawn: { col: number; row: number };
  mapCoord: { x: number; y: number }; // 0..100 for World Map UI
  description: string;
  hasWater: boolean;
  canFarm: boolean;
  warps: WarpPoint[];
}

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  farm: {
    id: 'farm',
    name: 'Player Farm',
    nameTh: 'ฟาร์มของคุณ',
    cols: 38,
    rows: 28,
    defaultSpawn: { col: 14, row: 12 },
    mapCoord: { x: 25, y: 48 },
    description: 'พื้นที่ฟาร์มส่วนตัว ปลูกพืช เลี้ยงสัตว์ ตกแต่งฟาร์ม และพักผ่อน',
    hasWater: true,
    canFarm: true,
    warps: [
      { col: 36, row: 11, width: 2, height: 4, targetZone: 'village', targetCol: 2, targetRow: 13, label: '→ หมู่บ้าน Evergreen Village' },
      { col: 18, row: 0, width: 4, height: 2, targetZone: 'mountain', targetCol: 17, targetRow: 22, label: '↑ ภูเขา Emerald Mountain' },
      { col: 18, row: 26, width: 4, height: 2, targetZone: 'forest', targetCol: 17, targetRow: 2, label: '↓ ป่า Enchanted Forest' },
    ],
  },
  village: {
    id: 'village',
    name: 'Evergreen Village',
    nameTh: 'หมู่บ้าน Evergreen Village',
    cols: 34,
    rows: 26,
    defaultSpawn: { col: 16, row: 13 },
    mapCoord: { x: 52, y: 46 },
    description: 'หมู่บ้านหลักอันอบอุ่น ศูนย์รวมชาวบ้าน ร้านขนมปัง คลินิก และจัตุรัสกลางเมือง',
    hasWater: false,
    canFarm: false,
    warps: [
      { col: 0, row: 11, width: 2, height: 4, targetZone: 'farm', targetCol: 34, targetRow: 13, label: '← ฟาร์มของคุณ' },
      { col: 32, row: 11, width: 2, height: 4, targetZone: 'market', targetCol: 2, targetRow: 13, label: '→ ตลาดกลางเมือง' },
      { col: 15, row: 0, width: 4, height: 2, targetZone: 'community', targetCol: 15, targetRow: 21, label: '↑ Community Center' },
      { col: 15, row: 24, width: 4, height: 2, targetZone: 'beach', targetCol: 17, targetRow: 2, label: '↓ ชายหาด Sunlit Beach' },
    ],
  },
  market: {
    id: 'market',
    name: 'Town Market',
    nameTh: 'ตลาดกลางเมือง',
    cols: 34,
    rows: 24,
    defaultSpawn: { col: 16, row: 14 },
    mapCoord: { x: 78, y: 46 },
    description: 'ร้านขายเมล็ดพันธุ์ (Clara), ร้านอุปกรณ์/อาวุธ (Rowan), ร้านสัตว์เลี้ยง (Mira), และตลาดรับซื้อ (Bram)',
    hasWater: false,
    canFarm: false,
    warps: [
      { col: 0, row: 11, width: 2, height: 4, targetZone: 'village', targetCol: 30, targetRow: 13, label: '← Evergreen Village' },
      { col: 15, row: 22, width: 4, height: 2, targetZone: 'lake', targetCol: 17, targetRow: 2, label: '↓ ทะเลสาบตกปลา' },
    ],
  },
  community: {
    id: 'community',
    name: 'Community Center',
    nameTh: 'ศูนย์กลางชุมชน',
    cols: 30,
    rows: 24,
    defaultSpawn: { col: 15, row: 18 },
    mapCoord: { x: 52, y: 22 },
    description: 'หอประชุมชุมชนและแท่นบูชาฟื้นฟูหุบเขา สะสมความสำเร็จเพื่อปลดล็อกวิหารลับ',
    hasWater: false,
    canFarm: false,
    warps: [
      { col: 13, row: 22, width: 4, height: 2, targetZone: 'village', targetCol: 17, targetRow: 2, label: '↓ Evergreen Village' },
    ],
  },
  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    nameTh: 'ป่าลึกลับ Enchanted Forest',
    cols: 34,
    rows: 26,
    defaultSpawn: { col: 17, row: 4 },
    mapCoord: { x: 25, y: 74 },
    description: 'ป่าเวทมนตร์ที่อุดมไปด้วยไม้เนื้อแข็ง สมุนไพร เห็ดเรืองแสง และทางเข้าสู่ Whispering Sanctuary',
    hasWater: true,
    canFarm: false,
    warps: [
      { col: 15, row: 0, width: 4, height: 2, targetZone: 'farm', targetCol: 19, targetRow: 24, label: '↑ ฟาร์มของคุณ' },
      { col: 32, row: 11, width: 2, height: 4, targetZone: 'lake', targetCol: 2, targetRow: 13, label: '→ ทะเลสาบตกปลา' },
      { col: 0, row: 11, width: 2, height: 4, targetZone: 'secret', targetCol: 26, targetRow: 12, label: '✨ Whispering Sanctuary (พื้นที่ลับ)', requiresSecret: true },
    ],
  },
  lake: {
    id: 'lake',
    name: 'Fishing Lake',
    nameTh: 'ทะเลสาบตกปลา',
    cols: 34,
    rows: 26,
    defaultSpawn: { col: 17, row: 6 },
    mapCoord: { x: 76, y: 72 },
    description: 'ทะเลสาบน้ำใสพร้อมท่าไม้ตกปลา แหล่งปลาหายากและปลา Legendary ประจำฤดู',
    hasWater: true,
    canFarm: false,
    warps: [
      { col: 15, row: 0, width: 4, height: 2, targetZone: 'market', targetCol: 17, targetRow: 20, label: '↑ ตลาดกลางเมือง' },
      { col: 0, row: 11, width: 2, height: 4, targetZone: 'forest', targetCol: 30, targetRow: 13, label: '← Enchanted Forest' },
    ],
  },
  beach: {
    id: 'beach',
    name: 'Sunlit Beach',
    nameTh: 'ชายหาด Sunlit Beach',
    cols: 34,
    rows: 24,
    defaultSpawn: { col: 17, row: 4 },
    mapCoord: { x: 52, y: 78 },
    description: 'หาดทรายสีทอง เปลือกหอยหายาก และทะเลสีครามสำหรับตกปลาทะเล',
    hasWater: true,
    canFarm: false,
    warps: [
      { col: 15, row: 0, width: 4, height: 2, targetZone: 'village', targetCol: 17, targetRow: 22, label: '↑ Evergreen Village' },
    ],
  },
  mountain: {
    id: 'mountain',
    name: 'Emerald Mountain',
    nameTh: 'ภูเขา Emerald Mountain',
    cols: 34,
    rows: 25,
    defaultSpawn: { col: 17, row: 20 },
    mapCoord: { x: 25, y: 20 },
    description: 'ยอดเขาสูงวิวสวยงาม ลำธารน้ำใส และทางเข้าเหมืองแร่ Crystal Mine',
    hasWater: true,
    canFarm: false,
    warps: [
      { col: 15, row: 23, width: 4, height: 2, targetZone: 'farm', targetCol: 19, targetRow: 2, label: '↓ ฟาร์มของคุณ' },
      { col: 16, row: 6, width: 3, height: 2, targetZone: 'mine', targetCol: 15, targetRow: 18, label: '⛏️ เข้าสู่เหมือง Crystal Mine' },
    ],
  },
  mine: {
    id: 'mine',
    name: 'Crystal Mine',
    nameTh: 'เหมืองแร่ Crystal Mine',
    cols: 30,
    rows: 22,
    defaultSpawn: { col: 15, row: 17 },
    mapCoord: { x: 12, y: 15 },
    description: 'เหมืองหลายระดับความลึก เต็มไปด้วยแร่ อัญมณี มอนสเตอร์ และบอส Crystal Guardian ชั้น 10!',
    hasWater: false,
    canFarm: false,
    warps: [
      { col: 13, row: 20, width: 4, height: 2, targetZone: 'mountain', targetCol: 17, targetRow: 9, label: '↑ ออกจากเหมือง' },
    ],
  },
  secret: {
    id: 'secret',
    name: 'Whispering Sanctuary',
    nameTh: 'วิหารลับ Whispering Sanctuary',
    cols: 30,
    rows: 24,
    defaultSpawn: { col: 24, row: 12 },
    mapCoord: { x: 8, y: 74 },
    description: 'ดินแดนลับอันศักดิ์สิทธิ์ที่ปลดล็อกได้ แหล่งปลา Celestial Arowana และภูตผู้พิทักษ์',
    hasWater: true,
    canFarm: false,
    warps: [
      { col: 28, row: 10, width: 2, height: 4, targetZone: 'forest', targetCol: 3, targetRow: 13, label: '→ กลับสู่ Enchanted Forest' },
    ],
  },
};

export const ZONE_LIST: ZoneDefinition[] = Object.values(ZONES);
