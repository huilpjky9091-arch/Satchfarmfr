import type { PatchNote } from '@shared/index';

export const GAME_VERSION = '0.1.0';
export const CURRENT_PHASE = 'Phase 1: Game Core & Movement';

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '0.1.0',
    phase: 'Phase 1',
    date: '2026-11-22',
    title: 'Game Core, Pixel Art Engine & Movement',
    status: 'implemented',
    highlights: [
      'วางโครงสร้าง Monorepo (Client + Shared Types) รองรับการขยายระบบถึง Phase 10',
      'ระบบ Phaser 3 2D Pixel Art Engine พร้อม Procedural Original Pixel Art Sprites & Tileset',
      'ระบบสร้างตัวละคร (ชื่อ, ชื่อฟาร์ม, สีผิว, ทรงผม 4 แบบ, สีผม, สีเสื้อ, สีกางเกง) แสดงผลจริงในเกม',
      'ระบบเดิน 8 ทิศทาง + Animation 4 ทิศทาง รองรับ Keyboard (WASD/Arrows + Shift วิ่ง) และ Mobile Virtual D-Pad',
      'ระบบ Collision, Y-Sorting Depth, วัตถุที่โต้ตอบได้ (ป้ายบอกทาง, บ้านฟาร์ม, กล่องส่งของ, บ่อน้ำ)',
      'ระบบเวลา Day-Night Cycle & แสงบรรยากาศตามช่วงเวลา (เช้า/กลางวัน/เย็น/กลางคืน)',
      'ระบบเสียง Web Audio API (เสียงเดิน, เสียงปุ่ม, เสียงโต้ตอบ) พร้อมหน้าตั้งค่า',
    ],
  },
  {
    version: '0.2.0',
    phase: 'Phase 2',
    date: 'Planned',
    title: 'Open World & Multi-Zone Map System',
    status: 'planned',
    highlights: [
      'ขยายแผนที่เชื่อมต่อหลายโซน (Evergreen Village, Enchanted Forest, Fishing Lake, Beach, Mountain)',
      'ระบบ Warp/Transition ระหว่างแผนที่ และ Mini-Map',
    ],
  },
  {
    version: '0.3.0',
    phase: 'Phase 3',
    date: 'Planned',
    title: 'Farming, Crops & Inventory System',
    status: 'planned',
    highlights: [
      'ระบบพรวนดิน, ปลูกเมล็ดพันธุ์ 30+ ชนิด, รดน้ำ, ใส่ปุ๋ย, เก็บเกี่ยว และขายผลผลิต',
      'ระบบ Inventory, Hotbar เครื่องมือ, และการเลี้ยงสัตว์ 7 ชนิด',
    ],
  },
  {
    version: '0.4.0',
    phase: 'Phase 4',
    date: 'Planned',
    title: 'NPCs, Relationships & Quest System',
    status: 'planned',
    highlights: [
      'NPC 20+ ตัวพร้อมตารางกิจวัตรประจำวัน, บทสนทนาตามฤดูกาล, ของขวัญ และเควสต์',
    ],
  },
  {
    version: '0.5.0',
    phase: 'Phase 5',
    date: 'Planned',
    title: 'Fishing Mini-game, Crystal Mine & Combat',
    status: 'planned',
    highlights: [
      'มินิเกมตกปลา 40+ ชนิด และเหมืองหลายชั้นพร้อมแร่ มอนสเตอร์ และบอส',
    ],
  },
  {
    version: '0.6.0',
    phase: 'Phase 6–10',
    date: 'Planned',
    title: 'Real-time Multiplayer, Cloud Save, Patch Registry & Deployment',
    status: 'planned',
    highlights: [
      'Node.js + Socket.IO Server Authoritative Multiplayer (1-8 คน/ฟาร์ม, Room Code, แชต)',
      'ระบบ Save/Load + Auto-Save + Backup และระบบ Patch Migration',
    ],
  },
];
