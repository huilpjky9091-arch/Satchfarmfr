import Phaser from 'phaser';
import type {
  CharacterAppearance,
  Direction,
  GameSettings,
  InteractableInfo,
  PlayerStats,
} from '@shared/index';
import { generatePlayerTexture } from '../assets/PixelArtGenerator';
import { AudioSystem } from '../systems/AudioSystem';
import { EventBus, type MobileInputState } from '../systems/EventBus';
import { TimeSystem } from '../systems/TimeSystem';
import type { BootSceneData } from './BootScene';

const TILE_SIZE = 16;
const MAP_COLS = 42;
const MAP_ROWS = 30;
const WALK_SPEED = 78;
const SPRINT_SPEED = 122;

interface WorldInteractable {
  id: string;
  info: InteractableInfo;
  x: number;
  y: number;
  radius: number;
}

export class WorldScene extends Phaser.Scene {
  private appearance!: CharacterAppearance;
  private settings!: GameSettings;
  private timeSystem = new TimeSystem();

  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerNameTag!: Phaser.GameObjects.Text;
  private colliders!: Phaser.Physics.Arcade.StaticGroup;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  private mobileInput: MobileInputState = { dx: 0, dy: 0, sprinting: false };
  private facing: Direction = 'down';
  private isPaused = false;
  private isDialogOpen = false;

  private stats: PlayerStats = {
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    gold: 500,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
  };

  private tileGrid: string[][] = [];
  private waterTiles: Phaser.GameObjects.Image[] = [];
  private waterAnimTimer = 0;
  private waterFrame = 0;

  private interactables: WorldInteractable[] = [];
  private nearestInteractable: WorldInteractable | null = null;
  private interactBubble!: Phaser.GameObjects.Container;
  private ambientOverlay!: Phaser.GameObjects.Rectangle;

  private lastEmitTime = 0;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: BootSceneData): void {
    this.appearance = data.appearance;
    this.settings = data.settings;
    this.timeSystem.setTimeScale(data.settings.timeScale);
    AudioSystem.setVolumes(data.settings.musicVolume, data.settings.sfxVolume);
  }

  create(): void {
    const worldW = MAP_COLS * TILE_SIZE;
    const worldH = MAP_ROWS * TILE_SIZE;

    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.colliders = this.physics.add.staticGroup();

    this.buildTerrain();
    this.buildWorldObjects();
    this.createPlayer();
    this.createAmbientParticles(worldW, worldH);
    this.createLightingOverlay();
    this.setupCamera(worldW, worldH);
    this.setupInput();
    this.bindEvents();

    // Emit initial snapshots to React HUD
    EventBus.emit('player:stats', { ...this.stats });
    EventBus.emit('world:time', this.timeSystem.getSnapshot());
    EventBus.emit('world:ready');
  }

  private buildTerrain(): void {
    this.tileGrid = [];

    for (let row = 0; row < MAP_ROWS; row++) {
      const rowArr: string[] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        let key = `tile_grass_${(row * 7 + col * 13) % 3}`;

        // Wildflowers scattered naturally
        if ((row * 31 + col * 17) % 29 === 0 && row > 2 && row < MAP_ROWS - 2 && col > 2 && col < MAP_COLS - 2) {
          key = `tile_flower_${(row + col) % 2}`;
        }

        // Whispering Pond (South-West)
        if (row >= 19 && row <= 25 && col >= 5 && col <= 13) {
          const isCorner =
            (row === 19 || row === 25) && (col === 5 || col === 13);
          if (!isCorner) {
            key = 'tile_water_0';
          }
        }

        // Cleared Farm Soil Plot (Center-South)
        if (row >= 15 && row <= 21 && col >= 17 && col <= 26) {
          key = 'tile_farm_soil';
        }

        // Dirt paths connecting Farmhouse -> Farm Plot -> Pond
        if (
          (col >= 13 && col <= 15 && row >= 10 && row <= 18) ||
          (row >= 12 && row <= 13 && col >= 13 && col <= 32) ||
          (col >= 21 && col <= 22 && row >= 12 && row <= 14)
        ) {
          key = 'tile_path_dirt';
        }

        // Cobblestone road heading East toward Evergreen Village
        if (row >= 12 && row <= 14 && col >= 32 && col < MAP_COLS) {
          key = 'tile_path_stone';
        }

        // Forest trail heading North
        if (col >= 24 && col <= 26 && row >= 0 && row <= 12) {
          key = 'tile_path_dirt';
        }

        rowArr.push(key);
        const img = this.add.image(col * TILE_SIZE + 8, row * TILE_SIZE + 8, key).setDepth(0);

        if (key === 'tile_water_0') {
          this.waterTiles.push(img);
          // Add water collision box
          const waterZone = this.add.rectangle(col * TILE_SIZE + 8, row * TILE_SIZE + 8, TILE_SIZE, TILE_SIZE);
          this.physics.add.existing(waterZone, true);
          this.colliders.add(waterZone);
        }
      }
      this.tileGrid.push(rowArr);
    }
  }

  private addProp(
    key: string,
    x: number,
    y: number,
    colliderW: number,
    colliderH: number,
    colliderOffsetY = 0
  ): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, key);
    img.setOrigin(0.5, 1);
    img.setDepth(y);

    if (colliderW > 0 && colliderH > 0) {
      const box = this.add.rectangle(x, y - colliderH / 2 + colliderOffsetY, colliderW, colliderH);
      this.physics.add.existing(box, true);
      this.colliders.add(box);
    }
    return img;
  }

  private buildWorldObjects(): void {
    const farmTitle = `${this.appearance.farmName} Farm`;

    // Cozy Farmhouse (North-West of farm center)
    const houseX = 14 * TILE_SIZE;
    const houseY = 10 * TILE_SIZE + 8;
    this.addProp('obj_farmhouse', houseX, houseY, 64, 24, -4);
    this.interactables.push({
      id: 'farmhouse',
      x: houseX - 12,
      y: houseY + 6,
      radius: 28,
      info: {
        id: 'farmhouse',
        title: `บ้านฟาร์ม — ${farmTitle}`,
        lines: [
          `ยินดีต้อนรับกลับบ้าน, ${this.appearance.name}! กลิ่นไม้สนอุ่น ๆ ลอยออกมาจากเตาผิง`,
          'ใน Phase 7 คุณจะสามารถเข้านอนที่นี่เพื่อบันทึกเกม (Save) และฟื้นฟูพลังงานเต็มร้อยสำหรับวันใหม่',
        ],
      },
    });

    // Shipping Bin next to Farmhouse
    const binX = 18 * TILE_SIZE + 8;
    const binY = 10 * TILE_SIZE + 6;
    this.addProp('obj_shipping_bin', binX, binY, 20, 12, -2);
    this.interactables.push({
      id: 'shipping_bin',
      x: binX,
      y: binY + 4,
      radius: 24,
      info: {
        id: 'shipping_bin',
        title: 'กล่องส่งผลผลิต (Shipping Bin)',
        lines: [
          'พ่อค้าจากหมู่บ้าน Evergreen Village จะมารับผลผลิตจากกล่องนี้ทุกค่ำคืน',
          'ระบบปลูกพืช เก็บเกี่ยว และขายผลผลิตจะเปิดใช้งานเต็มรูปแบบใน Phase 3!',
        ],
      },
    });

    // Stone Well near farm square
    const wellX = 29 * TILE_SIZE;
    const wellY = 10 * TILE_SIZE + 6;
    this.addProp('obj_well', wellX, wellY, 22, 14, -2);
    this.interactables.push({
      id: 'well',
      x: wellX,
      y: wellY + 4,
      radius: 26,
      info: {
        id: 'well',
        title: 'บ่อน้ำหินโบราณ',
        lines: [
          'น้ำแร่ใสเย็นจากตาน้ำใต้ภูเขา Evergreen... เมื่อก้มมองลงไปเห็นเงาสะท้อนของท้องฟ้า',
          'ใช้เติมน้ำลงบัวรดน้ำได้เมื่อระบบทำฟาร์มเปิดใช้งานใน Phase 3',
        ],
      },
    });

    // Farm Plot Fence perimeter (leaving top & left entrances open)
    for (let col = 16; col <= 27; col++) {
      if (col !== 21 && col !== 22) {
        this.addProp('obj_fence_h', col * TILE_SIZE + 8, 15 * TILE_SIZE, 16, 8, -2);
      }
      this.addProp('obj_fence_h', col * TILE_SIZE + 8, 22 * TILE_SIZE + 8, 16, 8, -2);
    }
    for (let row = 15; row <= 21; row++) {
      this.addProp('obj_fence_v', 16 * TILE_SIZE + 8, row * TILE_SIZE + 14, 8, 16, -2);
      this.addProp('obj_fence_v', 27 * TILE_SIZE + 8, row * TILE_SIZE + 14, 8, 16, -2);
    }

    // Signpost 1: Farm Welcome Sign
    const signFarmX = 16 * TILE_SIZE;
    const signFarmY = 12 * TILE_SIZE;
    this.addProp('obj_signpost', signFarmX, signFarmY, 10, 8, -2);
    this.interactables.push({
      id: 'sign_farm',
      x: signFarmX,
      y: signFarmY + 4,
      radius: 24,
      info: {
        id: 'sign_farm',
        title: `ป้ายประจำฟาร์ม ${farmTitle}`,
        lines: [
          `← บึงน้ำกระซิบ (Whispering Pond)  |  → หมู่บ้าน Evergreen Village`,
          `↑ เส้นทางสู่ป่าลึกลับ (Enchanted Forest)`,
          'กด Shift ค้างไว้เพื่อวิ่ง (Sprint) หรือใช้ปุ่มบนหน้าจอสำหรับมือถือ',
        ],
      },
    });

    // Signpost 2: East Gate toward Evergreen Village
    const signEastX = 38 * TILE_SIZE;
    const signEastY = 12 * TILE_SIZE;
    this.addProp('obj_signpost', signEastX, signEastY, 10, 8, -2);
    this.interactables.push({
      id: 'sign_village',
      x: signEastX,
      y: signEastY + 4,
      radius: 24,
      info: {
        id: 'sign_village',
        title: 'เส้นทางสู่หมู่บ้าน Evergreen Village',
        lines: [
          'ข้างหน้าคือหมู่บ้าน Evergreen Village, ตลาดกลางเมือง และ Community Center',
          'โซนแผนที่เปิดกว้างและการเดินทางข้ามพื้นที่กำลังสร้างใน Phase 2!',
        ],
      },
    });

    // Signpost 3: North Forest Trail
    const signNorthX = 23 * TILE_SIZE;
    const signNorthY = 4 * TILE_SIZE;
    this.addProp('obj_signpost', signNorthX, signNorthY, 10, 8, -2);
    this.interactables.push({
      id: 'sign_forest',
      x: signNorthX,
      y: signNorthY + 4,
      radius: 24,
      info: {
        id: 'sign_forest',
        title: 'ทางเข้าป่าลึกลับ (Enchanted Forest)',
        lines: [
          'ได้ยินเสียงนกร้องและลมเย็นพัดผ่านยอดสนสูง...',
          'พื้นที่ป่าลึกลับและภูเขาแร่ Crystal Mine จะเปิดให้สำรวจใน Phase 2 และ Phase 5',
        ],
      },
    });

    // Border & Scenic Trees (Oak & Pine)
    const treeCoords: [number, number, 'obj_tree_oak' | 'obj_tree_pine'][] = [
      // Top border forest
      [2, 3, 'obj_tree_pine'], [5, 2, 'obj_tree_oak'], [8, 3, 'obj_tree_pine'],
      [11, 2, 'obj_tree_oak'], [19, 3, 'obj_tree_pine'], [21, 2, 'obj_tree_oak'],
      [28, 3, 'obj_tree_pine'], [31, 2, 'obj_tree_oak'], [34, 3, 'obj_tree_pine'],
      [37, 2, 'obj_tree_oak'], [40, 3, 'obj_tree_pine'],
      // Left border
      [2, 7, 'obj_tree_oak'], [3, 11, 'obj_tree_pine'], [2, 15, 'obj_tree_oak'],
      [2, 20, 'obj_tree_pine'], [3, 26, 'obj_tree_oak'], [7, 28, 'obj_tree_pine'],
      // Bottom border
      [12, 28, 'obj_tree_oak'], [16, 27, 'obj_tree_pine'], [20, 28, 'obj_tree_oak'],
      [25, 27, 'obj_tree_pine'], [30, 28, 'obj_tree_oak'], [35, 27, 'obj_tree_pine'],
      [39, 28, 'obj_tree_oak'],
      // Right grove
      [36, 8, 'obj_tree_oak'], [39, 9, 'obj_tree_pine'], [34, 18, 'obj_tree_oak'],
      [38, 20, 'obj_tree_pine'], [32, 23, 'obj_tree_oak'],
      // Scenic farm accents
      [8, 8, 'obj_tree_oak'], [6, 13, 'obj_tree_pine'],
    ];

    treeCoords.forEach(([col, row, type]) => {
      this.addProp(type, col * TILE_SIZE + 8, row * TILE_SIZE + 12, 14, 10, -2);
    });

    // Rocks & Berry Bushes
    const rocks: [number, number][] = [
      [10, 16], [15, 25], [30, 16], [33, 8], [21, 6], [37, 24],
    ];
    rocks.forEach(([c, r]) => {
      this.addProp('obj_rock', c * TILE_SIZE + 8, r * TILE_SIZE + 12, 12, 8, -2);
    });

    const bushes: [number, number][] = [
      [9, 10], [10, 11], [15, 19], [28, 19], [31, 11], [27, 6], [6, 17],
    ];
    bushes.forEach(([c, r]) => {
      this.addProp('obj_bush', c * TILE_SIZE + 8, r * TILE_SIZE + 12, 14, 8, -2);
    });

    // Floating interaction prompt bubble
    const bubbleBg = this.add.rectangle(0, 0, 22, 14, 0x2b1608, 0.9);
    bubbleBg.setStrokeStyle(1, 0xf8e6c1);
    const bubbleText = this.add
      .text(0, 0, 'E', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#fdf6e7',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.interactBubble = this.add.container(0, 0, [bubbleBg, bubbleText]).setDepth(9990).setVisible(false);
  }

  private createPlayer(): void {
    const startX = 14 * TILE_SIZE;
    const startY = 12 * TILE_SIZE + 8;

    this.playerShadow = this.add.ellipse(startX, startY + 2, 12, 5, 0x1a120b, 0.35).setDepth(1);

    this.player = this.physics.add.sprite(startX, startY, 'player_sheet', 0);
    this.player.setOrigin(0.5, 0.92);
    this.player.setCollideWorldBounds(true);

    // Compact foot hitbox for smooth navigation around trees and fences
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 7);
    body.setOffset(3, 16);

    this.physics.add.collider(this.player, this.colliders);

    this.playerNameTag = this.add
      .text(startX, startY - 24, this.appearance.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '7px',
        color: '#ffffff',
        stroke: '#2b1608',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(9980);
  }

  private createAmbientParticles(worldW: number, worldH: number): void {
    this.add
      .particles(0, 0, 'particle_sparkle', {
        x: { min: 16, max: worldW - 16 },
        y: { min: 16, max: worldH - 16 },
        lifespan: { min: 4000, max: 7500 },
        speedX: { min: -6, max: 8 },
        speedY: { min: -5, max: 3 },
        scale: { start: 0.4, end: 0.9 },
        alpha: { start: 0, end: 0.75, ease: 'Sine.easeInOut' },
        frequency: 420,
        quantity: 1,
      })
      .setDepth(9000);
  }

  private createLightingOverlay(): void {
    this.ambientOverlay = this.add
      .rectangle(0, 0, 2000, 2000, 0x000000, 0)
      .setScrollFactor(0)
      .setOrigin(0)
      .setDepth(9500);
  }

  private setupCamera(worldW: number, worldH: number): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    this.updateCameraZoom();

    this.scale.on('resize', () => {
      this.updateCameraZoom();
    });
  }

  private updateCameraZoom(): void {
    const w = this.scale.width;
    const zoom = w < 640 ? 2.5 : w < 1024 ? 3 : 3.5;
    this.cameras.main.setZoom(zoom);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      interact: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  private bindEvents(): void {
    this.unsubscribers.push(
      EventBus.on('input:mobile', (state) => {
        this.mobileInput = state;
      }),
      EventBus.on('interact:trigger', () => {
        this.tryInteract();
      }),
      EventBus.on('interact:closed', () => {
        this.isDialogOpen = false;
      }),
      EventBus.on('game:pause', (paused) => {
        this.isPaused = paused;
        if (paused && this.player?.body) {
          (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
      }),
      EventBus.on('settings:updated', (next) => {
        this.settings = next;
        this.timeSystem.setTimeScale(next.timeScale);
        AudioSystem.setVolumes(next.musicVolume, next.sfxVolume);
      }),
      EventBus.on('appearance:updated', (next) => {
        this.appearance = next;
        generatePlayerTexture(this, next);
        this.playerNameTag.setText(next.name);
      })
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribers.forEach((unsub) => unsub());
      this.unsubscribers = [];
    });
  }

  private tryInteract(): void {
    if (this.isPaused || this.isDialogOpen) return;
    if (!this.nearestInteractable) return;

    AudioSystem.playInteract();
    this.isDialogOpen = true;
    EventBus.emit('interact:open', this.nearestInteractable.info);
  }

  private getZoneName(tileX: number, tileY: number): string {
    if (tileX >= 33) return 'East Road (to Evergreen Village)';
    if (tileY <= 5 && tileX >= 22 && tileX <= 28) return 'North Woods Trail';
    if (tileX <= 14 && tileY >= 18) return 'Whispering Pond';
    return `${this.appearance.farmName} Farm`;
  }

  update(_time: number, delta: number): void {
    // Animate shimmering water even while idle
    this.waterAnimTimer += delta;
    if (this.waterAnimTimer >= 650) {
      this.waterAnimTimer = 0;
      this.waterFrame = this.waterFrame === 0 ? 1 : 0;
      const texKey = `tile_water_${this.waterFrame}`;
      this.waterTiles.forEach((tile) => tile.setTexture(texKey));
    }

    if (this.isPaused) return;

    // Advance World Clock & Ambient Day-Night lighting
    if (!this.isDialogOpen && this.timeSystem.update(delta)) {
      EventBus.emit('world:time', this.timeSystem.getSnapshot());
    }
    const overlay = this.timeSystem.getAmbientOverlay();
    this.ambientOverlay.setFillStyle(overlay.color, overlay.alpha);

    // Handle interact hotkey
    if (
      this.wasd &&
      (Phaser.Input.Keyboard.JustDown(this.wasd.interact) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.space))
    ) {
      this.tryInteract();
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.isDialogOpen) {
      body.setVelocity(0, 0);
      this.stopWalkAnim();
      return;
    }

    // Gather movement input (Keyboard + Mobile)
    let dx = this.mobileInput.dx;
    let dy = this.mobileInput.dy;

    if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.left.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.wasd.right.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wasd.up.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.wasd.down.isDown) dy += 1;
    }

    const len = Math.hypot(dx, dy);
    const isMoving = len > 0.1;

    const wantsSprint =
      Boolean(this.wasd?.shift.isDown) || this.mobileInput.sprinting;
    const isSprinting = isMoving && wantsSprint && this.stats.stamina > 2;

    // Stamina drain / regen
    const dtSec = delta / 1000;
    let staminaChanged = false;
    if (isSprinting) {
      this.stats.stamina = Math.max(0, this.stats.stamina - 16 * dtSec);
      staminaChanged = true;
    } else if (this.stats.stamina < this.stats.maxStamina) {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 11 * dtSec);
      staminaChanged = true;
    }

    if (isMoving) {
      const nx = dx / len;
      const ny = dy / len;
      const speed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
      body.setVelocity(nx * speed, ny * speed);

      // Update facing direction
      if (Math.abs(nx) > Math.abs(ny)) {
        this.facing = nx < 0 ? 'left' : 'right';
      } else {
        this.facing = ny < 0 ? 'up' : 'down';
      }

      const animKey = `player_walk_${this.facing}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.anims.play(animKey, true);
      }
      this.player.anims.timeScale = isSprinting ? 1.45 : 1;

      // Surface footstep SFX
      const tx = Math.floor(this.player.x / TILE_SIZE);
      const ty = Math.floor(this.player.y / TILE_SIZE);
      const tileKey = this.tileGrid[ty]?.[tx] ?? 'tile_grass_0';
      const surface = tileKey.includes('path') ? 'path' : 'grass';
      AudioSystem.playFootstep(surface, isSprinting);
    } else {
      body.setVelocity(0, 0);
      this.stopWalkAnim();
    }

    // Y-Sort depth & attachments
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y + 1).setDepth(this.player.y - 1);
    this.playerNameTag.setPosition(this.player.x, this.player.y - 25);

    // Check nearby interactables
    this.updateNearbyInteractable();

    // Throttled HUD updates
    const now = performance.now();
    if (now - this.lastEmitTime > 120) {
      this.lastEmitTime = now;
      const tileX = Math.floor(this.player.x / TILE_SIZE);
      const tileY = Math.floor(this.player.y / TILE_SIZE);
      EventBus.emit('player:position', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        tileX,
        tileY,
        zone: this.getZoneName(tileX, tileY),
        direction: this.facing,
        isMoving,
        isSprinting,
      });
      if (staminaChanged) {
        EventBus.emit('player:stats', {
          ...this.stats,
          stamina: Math.round(this.stats.stamina),
        });
      }
    }
  }

  private stopWalkAnim(): void {
    this.player.anims.stop();
    const idleFrames: Record<Direction, number> = {
      down: 0,
      up: 3,
      left: 6,
      right: 9,
    };
    this.player.setFrame(idleFrames[this.facing]);
  }

  private updateNearbyInteractable(): void {
    let closest: WorldInteractable | null = null;
    let bestDist = Infinity;

    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (dist <= item.radius && dist < bestDist) {
        bestDist = dist;
        closest = item;
      }
    }

    if (closest?.info.id !== this.nearestInteractable?.info.id) {
      this.nearestInteractable = closest;
      EventBus.emit(
        'interact:nearby',
        closest ? { id: closest.info.id, title: closest.info.title } : null
      );
    }

    if (closest) {
      const bob = Math.sin(performance.now() / 220) * 2;
      this.interactBubble.setPosition(closest.x, closest.y - 26 + bob).setVisible(true);
    } else {
      this.interactBubble.setVisible(false);
    }
  }
}
