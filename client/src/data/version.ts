import type { PatchNote } from '@shared/index';

export const GAME_VERSION = '1.0.0';
export const CURRENT_PHASE = 'Full Release (Phases 1–10)';

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '1.0.0',
    phase: 'Phase 8–10',
    date: '2026-11-22',
    title: 'Patch Registry, Seasonal Audio, QA & Live Web Release',
    status: 'implemented',
    highlights: [
      'ระบบ ContentRegistry รองรับการเพิ่มไอเทม พืช ปลา NPC และเควสต์ผ่าน Content Pack ในอนาคต',
      'ระบบ Save Migration รองรับการอัปเดตเวอร์ชันโดยไม่สูญเสียข้อมูลเซฟเดิม',
      'ระบบเพลงพื้นหลังตามฤดูกาล (Spring/Summer/Autumn/Winter) + เสียงประกอบครบทุกกิจกรรม',
      'ทดสอบ TypeScript, Production Build และ Multiplayer Backend พร้อม Deploy ขึ้นเว็บจริง',
    ],
  },
  {
    version: '0.7.0',
    phase: 'Phase 7',
    date: '2026-11-22',
    title: 'Save/Load, Auto-Save & Backup Recovery',
    status: 'implemented',
    highlights: [
      'บันทึกข้อมูลครบทั้งตำแหน่ง เงิน กระเป๋า สกิล แปลงผัก สัตว์ ความสัมพันธ์ NPC เควสต์ และเวลา',
      'รองรับ Auto-Save ตอนนอนพัก, 3 Manual Slots, Backup Recovery และ Export/Import ไฟล์ JSON',
    ],
  },
  {
    version: '0.6.0',
    phase: 'Phase 6',
    date: '2026-11-22',
    title: 'Real-time Online Multiplayer Backend (Node.js + Socket.IO)',
    status: 'implemented',
    highlights: [
      'ระบบสมัครสมาชิก/เข้าสู่ระบบ (scrypt salted hash), สร้างห้อง/เข้าห้องด้วย Room Code (1–8 คน)',
      'ซิงก์ตำแหน่งผู้เล่นแบบ Real-time, แชตในห้อง, ส่งของขวัญให้เพื่อน และซิงก์แปลงฟาร์มร่วมกัน',
    ],
  },
  {
    version: '0.5.0',
    phase: 'Phase 5',
    date: '2026-11-22',
    title: 'Fishing Mini-Game (42 Fish) & Crystal Mine Combat',
    status: 'implemented',
    highlights: [
      'มินิเกมตกปลาแบบโต้ตอบได้จริง พร้อมปลา 42 ชนิดและปลา Legendary 5 ตัวตามฤดู/เวลา/อากาศ/พื้นที่',
      'เหมือง Crystal Mine 10 ชั้น พร้อมแร่/อัญมณี มอนสเตอร์ 3 ชนิด บอส Crystal Guardian ชั้น 10 และอาวุธ ดาบ/ธนู/คทาเวท/ชุดเกราะ',
    ],
  },
  {
    version: '0.4.0',
    phase: 'Phase 4',
    date: '2026-11-22',
    title: '20 Original NPCs, Relationships, Marriage & Quests',
    status: 'implemented',
    highlights: [
      'NPC ต้นฉบับ 20 ตัวพร้อมตารางเวลา บทสนทนาตามฤดู ระบบหัวใจ Heart Events มอบของขวัญ และแต่งงานด้วย Starlight Pendant',
      'ระบบเควสต์ครบ 7 ประเภท (Main, Side, Daily, Weekly, Seasonal, Multiplayer, Hidden) และทักษะ RPG 5 ด้าน',
    ],
  },
  {
    version: '0.3.0',
    phase: 'Phase 3',
    date: '2026-11-22',
    title: 'Farming (32 Crops), 7 Animals, Inventory, Shops & Crafting',
    status: 'implemented',
    highlights: [
      'พรวนดิน ปลูกพืช 32 ชนิด 4 ฤดู รดน้ำ ใส่ปุ๋ย เก็บเกี่ยว วางรั้ว และขายสินค้าที่ตลาดหรือกล่องส่งของ',
      'ระบบเลี้ยงสัตว์ 7 ชนิด (ไก่ เป็ด กระต่าย วัว แพะ แกะ หมู) กระเป๋า 24 ช่อง Hotbar 9 ช่อง และ Crafting',
    ],
  },
  {
    version: '0.2.0',
    phase: 'Phase 2',
    date: '2026-11-22',
    title: 'Open World 10 Zones & Seasonal Weather',
    status: 'implemented',
    highlights: [
      'โลกเปิด 10 พื้นที่: Farm, Evergreen Village, Town Market, Community Center, Enchanted Forest, Fishing Lake, Sunlit Beach, Emerald Mountain, Crystal Mine และพื้นที่ลับ Whispering Sanctuary',
    ],
  },
  {
    version: '0.1.0',
    phase: 'Phase 1',
    date: '2026-11-22',
    title: 'Game Core, Original Pixel Art Engine & Movement',
    status: 'implemented',
    highlights: [
      'Phaser 3 Pixel Art Engine, Character Creator, เดิน 8 ทิศทาง (PC + Mobile D-Pad), Collision, Y-Sorting และ Day-Night Cycle',
    ],
  },
];
