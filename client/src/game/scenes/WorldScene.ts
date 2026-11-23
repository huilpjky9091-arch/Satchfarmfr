import Phaser from 'phaser';
import type {
  Direction,
  GameSettings,
  InteractableInfo,
  RemotePlayerState,
  ZoneId,
} from '@shared/index';
import { CROP_BY_ID } from '../../data/crops';
import { FISH_LIST } from '../../data/fish';
import { ITEM_BY_ID } from '../../data/items';
import { ZONES } from '../../data/maps';
import { NPCS } from '../../data/npcs';
import { generatePlayerTexture } from '../assets/PixelArtGenerator';
import { AudioSystem } from '../systems/AudioSystem';
import { EventBus, type MobileInputState } from '../systems/EventBus';
import { GameState } from '../systems/GameStateStore';
import type { BootSceneData } from './BootScene';

const TILE_SIZE = 16;
const WALK_SPEED = 84;
const SPRINT_SPEED = 132;

interface WorldInteractable {
  id: string;
  info: InteractableInfo;
  x: number;
  y: number;
  radius: number;
}

interface MineOreNode {
  id: string;
  sprite: Phaser.GameObjects.Image;
  x: number;
  y: number;
  hp: number;
  dropItemId: string;
  dropQty: number;
}

interface MineMonster {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBarFill: Phaser.GameObjects.Rectangle;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  isBoss: boolean;
  lootItemId: string;
  expReward: number;
  goldReward: number;
  hitCooldown: number;
}

interface ForageNode {
  id: string;
  sprite: Phaser.GameObjects.Image;
  x: number;
  y: number;
  itemId: string;
}

interface Projectile {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  damage: number;
  lifeMs: number;
}

export class WorldScene extends Phaser.Scene {
  private settings!: GameSettings;
  private currentZone: ZoneId = 'farm';

  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerNameTag!: Phaser.GameObjects.Text;
  private colliders!: Phaser.Physics.Arcade.StaticGroup;

  private zoneGroup!: Phaser.GameObjects.Group;
  private farmLayerGroup!: Phaser.GameObjects.Group;
  private animalSprites = new Map<string, { sprite: Phaser.GameObjects.Image; badge: Phaser.GameObjects.Text; vx: number; vy: number; timer: number }>();
  private remoteSprites = new Map<string, { sprite: Phaser.GameObjects.Sprite; label: Phaser.GameObjects.Text }>();

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
    action: Phaser.Input.Keyboard.Key;
  };

  private mobileInput: MobileInputState = { dx: 0, dy: 0, sprinting: false };
  private facing: Direction = 'down';
  private isPaused = false;
  private isDialogOpen = false;
  private warpCooldown = 0;
  private attackCooldown = 0;

  private tileGrid: string[][] = [];
  private waterTiles: Phaser.GameObjects.Image[] = [];
  private waterAnimTimer = 0;
  private waterFrame = 0;

  private interactables: WorldInteractable[] = [];
  private nearestInteractable: WorldInteractable | null = null;
  private interactBubble!: Phaser.GameObjects.Container;
  private tileCursor!: Phaser.GameObjects.Rectangle;
  private ambientOverlay!: Phaser.GameObjects.Rectangle;
  private weatherParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  private mineOres: MineOreNode[] = [];
  private monsters: MineMonster[] = [];
  private forageables: ForageNode[] = [];
  private projectiles: Projectile[] = [];

  private timeAccumMs = 0;
  private lastEmitTime = 0;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: BootSceneData): void {
    this.settings = data.settings;
    AudioSystem.setVolumes(data.settings.musicVolume, data.settings.sfxVolume);
    AudioSystem.setSeason(GameState.worldTime.season);
  }

  create(): void {
    this.colliders = this.physics.add.staticGroup();
    this.zoneGroup = this.add.group();
    this.farmLayerGroup = this.add.group();

    this.createPlayer();
    this.createOverlays();
    this.setupInput();
    this.bindEvents();

    this.loadZone(GameState.currentZone, GameState.playerTile.x, GameState.playerTile.y);
    AudioSystem.startMusic();
    EventBus.emit('world:time', { ...GameState.worldTime });
    EventBus.emit('world:ready');
  }

  private createPlayer(): void {
    this.playerShadow = this.add.ellipse(0, 0, 12, 5, 0x1a120b, 0.35).setDepth(1);
    this.player = this.physics.add.sprite(0, 0, 'player_sheet', 0);
    this.player.setOrigin(0.5, 0.92);
    this.player.setCollideWorldBounds(true);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(8, 6);
    body.setOffset(4, 17);

    this.physics.add.collider(this.player, this.colliders);

    this.playerNameTag = this.add
      .text(0, 0, GameState.appearance.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '7px',
        color: '#ffffff',
        stroke: '#2b1608',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(9980);
  }

  private createOverlays(): void {
    this.tileCursor = this.add
      .rectangle(0, 0, TILE_SIZE, TILE_SIZE)
      .setStrokeStyle(1, 0xfef08a, 0.85)
      .setFillStyle(0xfef08a, 0.12)
      .setDepth(50)
      .setVisible(false);

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

    this.ambientOverlay = this.add
      .rectangle(0, 0, 2400, 2400, 0x000000, 0)
      .setScrollFactor(0)
      .setOrigin(0)
      .setDepth(9500);

    this.scale.on('resize', () => this.updateCameraZoom());
  }

  private updateCameraZoom(): void {
    const w = this.scale.width;
    const zoom = w < 640 ? 2.4 : w < 1024 ? 3 : 3.4;
    this.cameras.main.setZoom(zoom);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      interact: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Number keys 1-9 for Hotbar
    for (let i = 1; i <= 9; i++) {
      const idx = i - 1;
      this.input.keyboard.on(`keydown-${i}`, () => {
        if (!this.isPaused && !this.isDialogOpen) {
          AudioSystem.playClick();
          GameState.selectHotbar(idx);
        }
      });
    }

    // Mouse/Touch click directly on canvas to use tool / attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused || this.isDialogOpen) return;
      if (pointer.event && pointer.event.target !== this.game.canvas) return;
      if (pointer.rightButtonDown()) {
        this.tryInteract();
      } else if (pointer.leftButtonDown() && !pointer.wasTouch) {
        this.useActiveTool();
      }
    });
  }

  private bindEvents(): void {
    this.unsubscribers.push(
      EventBus.on('input:mobile', (state) => {
        this.mobileInput = state;
      }),
      EventBus.on('interact:trigger', () => this.tryInteract()),
      EventBus.on('action:use_tool', () => this.useActiveTool()),
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
        AudioSystem.setVolumes(next.musicVolume, next.sfxVolume);
      }),
      EventBus.on('appearance:updated', (next) => {
        generatePlayerTexture(this, next);
        this.playerNameTag.setText(next.name);
      }),
      EventBus.on('farm:updated', () => {
        if (this.currentZone === 'farm') this.renderFarmPlots();
      }),
      EventBus.on('animals:updated', () => {
        if (this.currentZone === 'farm') this.renderAnimals();
      }),
      EventBus.on('zone:teleport', ({ zone, col, row }) => {
        const def = ZONES[zone];
        this.loadZone(zone, col ?? def.defaultSpawn.col, row ?? def.defaultSpawn.row);
      }),
      EventBus.on('mine:change_floor', (floor) => {
        GameState.mineFloor = Math.max(1, Math.min(10, floor));
        this.loadZone('mine', 15, 17);
      }),
      EventBus.on('world:refresh_zone', () => {
        this.loadZone(this.currentZone, Math.floor(this.player.x / TILE_SIZE), Math.floor(this.player.y / TILE_SIZE));
      }),
      EventBus.on('mp:players', (players) => {
        this.syncRemotePlayers(players);
      })
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      AudioSystem.stopMusic();
      this.unsubscribers.forEach((u) => u());
      this.unsubscribers = [];
    });
  }

  private clearZone(): void {
    this.zoneGroup.clear(true, true);
    this.farmLayerGroup.clear(true, true);
    this.colliders.clear(true, true);
    this.waterTiles = [];
    this.interactables = [];
    this.nearestInteractable = null;
    this.mineOres = [];
    this.monsters.forEach((m) => {
      m.sprite.destroy();
      m.hpBarBg.destroy();
      m.hpBarFill.destroy();
    });
    this.monsters = [];
    this.forageables = [];
    this.projectiles.forEach((p) => p.sprite.destroy());
    this.projectiles = [];
    this.animalSprites.forEach((a) => {
      a.sprite.destroy();
      a.badge.destroy();
    });
    this.animalSprites.clear();
    if (this.weatherParticles) {
      this.weatherParticles.destroy();
      this.weatherParticles = null;
    }
  }

  private addZoneProp(
    key: string,
    x: number,
    y: number,
    colliderW: number,
    colliderH: number,
    colliderOffsetY = 0
  ): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);
    this.zoneGroup.add(img);
    if (colliderW > 0 && colliderH > 0) {
      const box = this.add.rectangle(x, y - colliderH / 2 + colliderOffsetY, colliderW, colliderH);
      this.physics.add.existing(box, true);
      this.colliders.add(box);
      this.zoneGroup.add(box);
    }
    return img;
  }

  private loadZone(zoneId: ZoneId, spawnCol: number, spawnRow: number): void {
    this.clearZone();
    this.currentZone = zoneId;
    GameState.visitZone(zoneId);

    const def = ZONES[zoneId];
    const worldW = def.cols * TILE_SIZE;
    const worldH = def.rows * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    this.buildTerrainForZone(zoneId, def.cols, def.rows);
    this.buildObjectsForZone(zoneId, def.cols, def.rows);
    this.spawnNpcsForZone(zoneId);
    this.spawnWeatherParticles(worldW, worldH);

    if (zoneId === 'farm') {
      this.renderFarmPlots();
      this.renderAnimals();
    }

    // Position player
    this.player.setPosition(spawnCol * TILE_SIZE + 8, spawnRow * TILE_SIZE + 8);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.startFollow(this.player, true, 0.14, 0.14);
    cam.setRoundPixels(true);
    this.updateCameraZoom();
    cam.fadeIn(180, 18, 12, 8);

    this.warpCooldown = 650;
  }

  private buildTerrainForZone(zone: ZoneId, cols: number, rows: number): void {
    const season = GameState.worldTime.season;
    this.tileGrid = [];

    for (let r = 0; r < rows; r++) {
      const rowArr: string[] = [];
      for (let c = 0; c < cols; c++) {
        let key = `tile_grass_${season}_${(r * 7 + c * 13) % 3}`;

        if (zone === 'mine') {
          key = 'tile_mine_floor';
        } else if (zone === 'secret') {
          key = 'tile_sanctuary';
          if (r >= 15 && r <= 20 && c >= 6 && c <= 20) key = 'tile_water_0';
        } else if (zone === 'beach') {
          key = r >= 14 ? 'tile_water_0' : r >= 6 ? 'tile_sand' : key;
          if (c >= 15 && c <= 18 && r >= 12 && r <= 18) key = 'tile_dock';
        } else if (zone === 'lake') {
          if (r >= 11 && r <= 22 && c >= 6 && c <= 27) key = 'tile_water_0';
          if (c >= 15 && c <= 18 && r >= 8 && r <= 15) key = 'tile_dock';
          if (c >= 15 && c <= 18 && r <= 8) key = 'tile_path_dirt';
          if (r >= 11 && r <= 14 && c <= 6) key = 'tile_path_dirt';
        } else if (zone === 'farm') {
          if (r >= 19 && r <= 24 && c >= 4 && c <= 11) key = 'tile_water_0';
          if (r >= 14 && r <= 21 && c >= 15 && c <= 27) key = 'tile_farm_soil';
          if ((c >= 13 && c <= 15 && r >= 10 && r <= 14) || (r >= 11 && r <= 13 && c >= 13)) key = 'tile_path_dirt';
          if (c >= 18 && c <= 21 && (r <= 11 || r >= 22)) key = 'tile_path_dirt';
        } else if (zone === 'village' || zone === 'market' || zone === 'community') {
          if (r >= 11 && r <= 14) key = 'tile_path_stone';
          if (c >= 15 && c <= 18) key = 'tile_path_stone';
        } else if (zone === 'forest') {
          if (r >= 11 && r <= 14) key = 'tile_path_dirt';
          if (c >= 15 && c <= 18 && r <= 14) key = 'tile_path_dirt';
          if (r >= 18 && r <= 23 && c >= 10 && c <= 20) key = 'tile_water_0';
        } else if (zone === 'mountain') {
          if (c >= 15 && c <= 19 && r >= 7) key = 'tile_path_dirt';
          if (r >= 13 && r <= 19 && c >= 4 && c <= 11) key = 'tile_water_0';
        }

        rowArr.push(key);
        const img = this.add.image(c * TILE_SIZE + 8, r * TILE_SIZE + 8, key).setDepth(0);
        this.zoneGroup.add(img);

        if (key === 'tile_water_0') {
          this.waterTiles.push(img);
          const waterBox = this.add.rectangle(c * TILE_SIZE + 8, r * TILE_SIZE + 8, TILE_SIZE, TILE_SIZE);
          this.physics.add.existing(waterBox, true);
          this.colliders.add(waterBox);
          this.zoneGroup.add(waterBox);
        }
      }
      this.tileGrid.push(rowArr);
    }
  }

  private buildObjectsForZone(zone: ZoneId, cols: number, rows: number): void {
    // Render warp indicator signs at zone exits
    ZONES[zone].warps.forEach((w) => {
      const wx = (w.col + w.width / 2) * TILE_SIZE;
      const wy = (w.row + w.height / 2) * TILE_SIZE;
      const txt = this.add
        .text(wx, wy, w.label, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '7px',
          color: w.requiresSecret && !GameState.unlockedSecret ? '#fca5a5' : '#fef08a',
          backgroundColor: 'rgba(30,18,8,0.75)',
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5)
        .setDepth(500);
      this.zoneGroup.add(txt);
    });

    if (zone === 'farm') {
      // Farmhouse (Sleep & Save!)
      const hx = 14 * TILE_SIZE;
      const hy = 10 * TILE_SIZE;
      this.addZoneProp('obj_farmhouse', hx, hy, 64, 24, -4);
      this.interactables.push({
        id: 'farmhouse_sleep',
        x: hx - 12,
        y: hy + 6,
        radius: 28,
        info: {
          id: 'farmhouse_sleep',
          title: `บ้านฟาร์ม — ${GameState.appearance.farmName}`,
          lines: [
            'พักผ่อนเพื่อข้ามไปยังเช้าวันใหม่! พืชที่รดน้ำแล้วจะเติบโต สัตว์จะผลิตสินค้า และระบบจะบันทึกเกมอัตโนมัติ',
          ],
          actionType: 'sleep',
        },
      });

      // Shipping Bin
      const bx = 18 * TILE_SIZE + 8;
      const by = 10 * TILE_SIZE;
      this.addZoneProp('obj_shipping_bin', bx, by, 20, 12, -2);
      this.interactables.push({
        id: 'shipping_bin',
        x: bx,
        y: by + 4,
        radius: 26,
        info: {
          id: 'shipping_bin',
          title: 'กล่องส่งขายผลผลิต (Shipping Bin)',
          lines: ['เปิดหน้าต่างขายผลผลิต ปลา แร่ และสินค้าฟาร์มรับเงินทันที!'],
          shopType: 'general',
        },
      });

      // Well
      this.addZoneProp('obj_well', 26 * TILE_SIZE, 9 * TILE_SIZE, 22, 14, -2);

      // Scenic border trees
      for (let c = 2; c < cols - 2; c += 4) {
        if (c < 16 || c > 23) this.addZoneProp(c % 8 === 0 ? 'obj_tree_pine' : 'obj_tree_oak', c * TILE_SIZE, 3 * TILE_SIZE, 14, 10, -2);
      }
      this.addZoneProp('obj_tree_oak', 5 * TILE_SIZE, 9 * TILE_SIZE, 14, 10, -2);
      this.addZoneProp('obj_tree_pine', 32 * TILE_SIZE, 8 * TILE_SIZE, 14, 10, -2);
      this.addZoneProp('obj_tree_oak', 32 * TILE_SIZE, 20 * TILE_SIZE, 14, 10, -2);
    }

    if (zone === 'village') {
      this.addZoneProp('obj_farmhouse', 10 * TILE_SIZE, 9 * TILE_SIZE, 64, 24, -4);
      this.addZoneProp('obj_farmhouse', 24 * TILE_SIZE, 9 * TILE_SIZE, 64, 24, -4);
      this.addZoneProp('obj_well', 17 * TILE_SIZE, 13 * TILE_SIZE, 22, 14, -2);
      this.addZoneProp('obj_tree_oak', 6 * TILE_SIZE, 18 * TILE_SIZE, 14, 10, -2);
      this.addZoneProp('obj_tree_pine', 28 * TILE_SIZE, 18 * TILE_SIZE, 14, 10, -2);
    }

    if (zone === 'market') {
      const stalls: { x: number; y: number; title: string; shopType: 'seeds' | 'tools' | 'animals' | 'general' }[] = [
        { x: 10 * TILE_SIZE, y: 9 * TILE_SIZE, title: 'ร้านเมล็ดพันธุ์ของ Clara', shopType: 'seeds' },
        { x: 16 * TILE_SIZE, y: 9 * TILE_SIZE, title: 'ตลาดรับซื้อของ Bram', shopType: 'general' },
        { x: 22 * TILE_SIZE, y: 9 * TILE_SIZE, title: 'ร้านอาวุธ & อุปกรณ์ของ Rowan', shopType: 'tools' },
        { x: 28 * TILE_SIZE, y: 9 * TILE_SIZE, title: 'ฟาร์มขายสัตว์ของ Mira', shopType: 'animals' },
      ];
      stalls.forEach((s) => {
        this.addZoneProp('obj_shop_stall', s.x, s.y, 40, 16, -2);
        this.interactables.push({
          id: `shop_${s.shopType}`,
          x: s.x,
          y: s.y + 8,
          radius: 30,
          info: {
            id: `shop_${s.shopType}`,
            title: s.title,
            lines: [`ยินดีต้อนรับสู่ ${s.title}`],
            shopType: s.shopType,
          },
        });
      });
    }

    if (zone === 'community') {
      const cx = 15 * TILE_SIZE;
      const cy = 11 * TILE_SIZE;
      this.addZoneProp('obj_community_hall', cx, cy, 80, 26, -4);
      this.interactables.push({
        id: 'community_shrine',
        x: cx,
        y: cy + 10,
        radius: 32,
        info: {
          id: 'community_shrine',
          title: 'แท่นบูรณะ Community Center',
          lines: ['ร่วมบริจาคพัฒนาศูนย์กลางชุมชนเพื่อปลดล็อกวิหารลับ Whispering Sanctuary!'],
          actionType: 'community',
        },
      });
    }

    if (zone === 'forest') {
      for (let i = 0; i < 12; i++) {
        const tx = (3 + ((i * 7) % (cols - 6))) * TILE_SIZE;
        const ty = (3 + ((i * 5) % (rows - 6))) * TILE_SIZE;
        if (Math.abs(ty - 12 * TILE_SIZE) > 28) {
          this.addZoneProp(i % 2 === 0 ? 'obj_tree_pine' : 'obj_tree_oak', tx, ty, 14, 10, -2);
        }
      }
      this.spawnForageables([
        ['forage_wood', 8, 8],
        ['forage_hardwood', 24, 7],
        ['forage_wild_herb', 11, 15],
        ['forage_glow_mushroom', 25, 18],
        ['forage_glow_mushroom', 7, 17],
      ]);
    }

    if (zone === 'beach') {
      this.spawnForageables([
        ['forage_shell', 8, 10],
        ['forage_shell', 24, 11],
        ['forage_shell', 13, 12],
        ['forage_wood', 27, 9],
      ]);
    }

    if (zone === 'mountain') {
      this.addZoneProp('obj_mine_entrance', 17.5 * TILE_SIZE, 6.5 * TILE_SIZE, 36, 16, -2);
      this.addZoneProp('obj_tree_pine', 7 * TILE_SIZE, 8 * TILE_SIZE, 14, 10, -2);
      this.addZoneProp('obj_tree_pine', 27 * TILE_SIZE, 8 * TILE_SIZE, 14, 10, -2);
      this.spawnForageables([
        ['forage_wood', 10, 10],
        ['forage_wild_herb', 25, 16],
      ]);
    }

    if (zone === 'mine') {
      this.populateMineFloor(GameState.mineFloor);
    }

    if (zone === 'secret') {
      this.addZoneProp('obj_tree_oak', 8 * TILE_SIZE, 8 * TILE_SIZE, 14, 10, -2);
      this.addZoneProp('obj_tree_oak', 22 * TILE_SIZE, 8 * TILE_SIZE, 14, 10, -2);
      this.spawnForageables([
        ['forage_glow_mushroom', 10, 11],
        ['forage_glow_mushroom', 20, 11],
      ]);
    }
  }

  private spawnForageables(list: [string, number, number][]): void {
    list.forEach(([itemId, c, r], idx) => {
      const x = c * TILE_SIZE + 8;
      const y = r * TILE_SIZE + 8;
      const texKey = itemId === 'forage_wild_herb' ? 'forage_wild_herb' : itemId;
      const sprite = this.add.image(x, y, texKey).setDepth(y);
      this.zoneGroup.add(sprite);
      this.forageables.push({ id: `forage_${idx}`, sprite, x, y, itemId });
    });
  }

  private populateMineFloor(floor: number): void {
    // Ladder to descend deeper (up to Floor 10)
    if (floor < 10) {
      const lx = 15 * TILE_SIZE;
      const ly = 5 * TILE_SIZE;
      this.addZoneProp('obj_ladder', lx, ly, 12, 12, 0);
      this.interactables.push({
        id: 'mine_ladder_down',
        x: lx,
        y: ly + 4,
        radius: 26,
        info: {
          id: 'mine_ladder_down',
          title: `บันไดลงเหมืองชั้น ${floor + 1}`,
          lines: [`ลงไปยัง Crystal Mine ชั้นที่ ${floor + 1} (ยิ่งลึก แร่และอัญมณียิ่งล้ำค่า!)`],
          actionType: 'mine_descend',
        },
      });
    }

    // Spawn 10 mineable ore nodes scaled by floor
    for (let i = 0; i < 10; i++) {
      const col = 4 + ((i * 5 + floor * 3) % 22);
      const row = 7 + ((i * 3 + floor) % 10);
      const x = col * TILE_SIZE + 8;
      const y = row * TILE_SIZE + 8;

      let tex = 'ore_node_copper';
      let dropItemId = 'ore_copper';
      if (floor >= 8 && i % 3 === 0) {
        tex = 'ore_node_crystal';
        dropItemId = i % 2 === 0 ? 'ore_crystal' : 'gem_emerald';
      } else if (floor >= 5 && i % 2 === 0) {
        tex = 'ore_node_gold';
        dropItemId = i % 4 === 0 ? 'gem_ruby' : 'ore_gold';
      } else if (floor >= 3 && i % 2 === 0) {
        tex = 'ore_node_silver';
        dropItemId = i % 4 === 0 ? 'gem_amethyst' : 'ore_silver';
      } else if (floor >= 2 && i % 2 === 1) {
        tex = 'ore_node_iron';
        dropItemId = 'ore_iron';
      }

      const sprite = this.add.image(x, y, tex).setDepth(y);
      this.zoneGroup.add(sprite);
      this.mineOres.push({
        id: `ore_${floor}_${i}`,
        sprite,
        x,
        y,
        hp: 2 + Math.floor(floor / 3),
        dropItemId,
        dropQty: 1 + (floor >= 6 ? 1 : 0),
      });
    }

    // Spawn Monsters (and Floor 10 Boss!)
    const mobCount = floor === 10 ? 2 : 3 + Math.min(3, Math.floor(floor / 2));
    for (let i = 0; i < mobCount; i++) {
      const x = (6 + ((i * 6) % 18)) * TILE_SIZE;
      const y = (7 + ((i * 4) % 9)) * TILE_SIZE;
      const kind = floor >= 6 ? 'mob_golem' : floor >= 3 ? 'mob_bat' : 'mob_slime';
      this.spawnMonster(
        `mob_${floor}_${i}`,
        kind,
        kind === 'mob_golem' ? 'Rock Golem' : kind === 'mob_bat' ? 'Cave Bat' : 'Crystal Slime',
        x,
        y,
        32 + floor * 12,
        8 + floor * 2,
        kind === 'mob_bat' ? 42 : 28,
        false,
        floor >= 5 ? 'ore_crystal' : 'ore_iron',
        20 + floor * 5,
        35 + floor * 12
      );
    }

    if (floor === 10) {
      this.spawnMonster(
        'boss_crystal_guardian',
        'mob_boss_guardian',
        'BOSS: Crystal Guardian',
        15 * TILE_SIZE,
        10 * TILE_SIZE,
        260,
        26,
        34,
        true,
        'ore_starlight',
        180,
        650
      );
    }
  }

  private spawnMonster(
    id: string,
    tex: string,
    name: string,
    x: number,
    y: number,
    maxHp: number,
    damage: number,
    speed: number,
    isBoss: boolean,
    lootItemId: string,
    expReward: number,
    goldReward: number
  ): void {
    const sprite = this.physics.add.sprite(x, y, tex).setDepth(y);
    sprite.setCollideWorldBounds(true);
    const barW = isBoss ? 34 : 18;
    const hpBarBg = this.add.rectangle(x, y - (isBoss ? 22 : 13), barW, 3, 0x1f2937).setDepth(9000);
    const hpBarFill = this.add.rectangle(x, y - (isBoss ? 22 : 13), barW, 3, isBoss ? 0xef4444 : 0xf97316).setDepth(9001);
    this.monsters.push({
      id,
      sprite,
      hpBarBg,
      hpBarFill,
      name,
      hp: maxHp,
      maxHp,
      damage,
      speed,
      isBoss,
      lootItemId,
      expReward,
      goldReward,
      hitCooldown: 0,
    });
  }

  private spawnNpcsForZone(zone: ZoneId): void {
    const phase = GameState.worldTime.dayPhase;
    const slotKey = phase === 'Morning' ? 'morning' : phase === 'Day' ? 'day' : 'evening';

    NPCS.forEach((npc) => {
      const sched = npc.schedule[slotKey];
      if (sched.zone !== zone) return;
      const x = sched.tileX * TILE_SIZE + 8;
      const y = sched.tileY * TILE_SIZE + 8;
      this.addZoneProp(`npc_${npc.id}`, x, y, 12, 8, -2);
      const label = this.add
        .text(x, y - 26, npc.name, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '7px',
          color: '#fef08a',
          stroke: '#2b1608',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(9970);
      this.zoneGroup.add(label);

      this.interactables.push({
        id: `npc_${npc.id}`,
        x,
        y: y + 4,
        radius: 26,
        info: {
          id: `npc_${npc.id}`,
          title: npc.name,
          lines: [],
          npcId: npc.id,
        },
      });
    });
  }

  private renderFarmPlots(): void {
    this.farmLayerGroup.clear(true, true);

    GameState.farmPlots.forEach((plot) => {
      const x = plot.col * TILE_SIZE + 8;
      const y = plot.row * TILE_SIZE + 8;

      if (plot.decoration === 'fence') {
        const f = this.add.image(x, y + 6, 'obj_fence_h').setOrigin(0.5, 1).setDepth(y);
        this.farmLayerGroup.add(f);
        return;
      }

      if (plot.tilled) {
        const soil = this.add
          .image(x, y, plot.watered ? 'tile_tilled_watered' : 'tile_tilled')
          .setDepth(2);
        this.farmLayerGroup.add(soil);

        if (plot.fertilized) {
          const dot = this.add.circle(x + 4, y + 4, 1.5, 0xfde047).setDepth(3);
          this.farmLayerGroup.add(dot);
        }

        if (plot.cropId) {
          const crop = CROP_BY_ID[plot.cropId];
          if (crop) {
            const ratio = Math.min(1, plot.growthDays / Math.max(1, crop.growthDays));
            const colorNum = parseInt(crop.color.replace('#', ''), 16);
            const accentNum = parseInt(crop.accentColor.replace('#', ''), 16);
            if (plot.mature) {
              const stem = this.add.rectangle(x, y + 1, 6, 8, accentNum).setDepth(y + 1);
              const fruit = this.add.circle(x, y - 3, 5, colorNum).setDepth(y + 2);
              const shine = this.add.circle(x - 1.5, y - 4.5, 1.5, 0xffffff, 0.8).setDepth(y + 3);
              this.farmLayerGroup.addMultiple([stem, fruit, shine]);
            } else if (ratio >= 0.5) {
              const sprout = this.add.rectangle(x, y, 5, 6, accentNum).setDepth(y + 1);
              const bud = this.add.circle(x, y - 2, 2.5, colorNum).setDepth(y + 2);
              this.farmLayerGroup.addMultiple([sprout, bud]);
            } else if (ratio > 0) {
              const sprout = this.add.rectangle(x, y + 2, 3, 4, 0x69c95b).setDepth(y + 1);
              this.farmLayerGroup.add(sprout);
            } else {
              const seed = this.add.circle(x, y + 2, 2, 0xe6ccb2).setDepth(y + 1);
              this.farmLayerGroup.add(seed);
            }
          }
        }
      }
    });
  }

  private renderAnimals(): void {
    this.animalSprites.forEach((a) => {
      a.sprite.destroy();
      a.badge.destroy();
    });
    this.animalSprites.clear();

    GameState.animals.forEach((animal) => {
      const sprite = this.add.image(animal.x, animal.y, `animal_${animal.species}`).setDepth(animal.y);
      const badge = this.add
        .text(animal.x, animal.y - 12, animal.hasProduce ? '★' : '', {
          fontSize: '9px',
          color: '#fde047',
          stroke: '#2b1608',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(9960);
      this.animalSprites.set(animal.id, { sprite, badge, vx: 0, vy: 0, timer: Math.random() * 2000 });
    });
  }

  private spawnWeatherParticles(worldW: number, worldH: number): void {
    const w = GameState.worldTime.weather;
    if (this.currentZone === 'mine') return;

    if (w === 'Rainy' || w === 'Storm') {
      this.weatherParticles = this.add
        .particles(0, 0, 'particle_sparkle', {
          x: { min: 0, max: worldW },
          y: 0,
          lifespan: 1200,
          speedX: -35,
          speedY: 220,
          scaleX: 0.35,
          scaleY: 1.8,
          tint: 0x93c5fd,
          alpha: 0.65,
          frequency: w === 'Storm' ? 18 : 35,
          quantity: 2,
        })
        .setDepth(9400);
    } else if (w === 'Snow') {
      this.weatherParticles = this.add
        .particles(0, 0, 'particle_sparkle', {
          x: { min: 0, max: worldW },
          y: 0,
          lifespan: 4500,
          speedX: { min: -16, max: 16 },
          speedY: { min: 24, max: 45 },
          scale: { start: 0.7, end: 0.4 },
          tint: 0xffffff,
          alpha: 0.85,
          frequency: 60,
          quantity: 1,
        })
        .setDepth(9400);
    } else {
      this.weatherParticles = this.add
        .particles(0, 0, 'particle_sparkle', {
          x: { min: 16, max: worldW - 16 },
          y: { min: 16, max: worldH - 16 },
          lifespan: { min: 4000, max: 7000 },
          speedX: { min: -6, max: 6 },
          speedY: { min: -5, max: 3 },
          scale: { start: 0.4, end: 0.85 },
          alpha: { start: 0, end: 0.7 },
          frequency: 420,
          quantity: 1,
        })
        .setDepth(9000);
    }
  }

  private getTargetTile(): { col: number; row: number } {
    const baseCol = Math.floor(this.player.x / TILE_SIZE);
    const baseRow = Math.floor(this.player.y / TILE_SIZE);
    const offset: Record<Direction, [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [ox, oy] = offset[this.facing];
    return { col: baseCol + ox, row: baseRow + oy };
  }

  private useActiveTool(): void {
    if (this.isPaused || this.isDialogOpen) return;

    // 1. Check nearby forageables first
    for (let i = 0; i < this.forageables.length; i++) {
      const f = this.forageables[i];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, f.x, f.y) < 24) {
        if (GameState.addItem(f.itemId, 1)) {
          f.sprite.destroy();
          this.forageables.splice(i, 1);
          AudioSystem.playHarvest();
          GameState.addSkillExp('foraging', 10);
          GameState.toast(`เก็บ ${ITEM_BY_ID[f.itemId]?.nameTh ?? f.itemId}!`, 'success');
        }
        return;
      }
    }

    // 2. Check nearby farm animals
    if (this.currentZone === 'farm') {
      for (const animal of GameState.animals) {
        const entry = this.animalSprites.get(animal.id);
        if (entry && Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 24) {
          GameState.interactAnimal(animal.id);
          return;
        }
      }
    }

    const slot = GameState.getSelectedSlot();
    const def = slot ? ITEM_BY_ID[slot.itemId] : undefined;
    const { col, row } = this.getTargetTile();

    // 3. Harvest mature crop with any tool/hand on farm!
    if (this.currentZone === 'farm') {
      const plot = GameState.farmPlots.get(`${col},${row}`);
      if (plot?.mature) {
        GameState.harvestPlot(col, row);
        return;
      }
    }

    if (!def) return;

    // 4. Consumables
    if (def.category === 'consumable' || def.category === 'armor') {
      GameState.consumeItem(GameState.selectedHotbarIndex);
      return;
    }

    // 5. Farming tools & seeds & fertilizer & fence
    if (this.currentZone === 'farm') {
      const tileKey = this.tileGrid[row]?.[col] ?? '';
      const canFarmTile = tileKey.includes('farm_soil') || tileKey.includes('grass');

      if (def.toolType === 'hoe' && canFarmTile) {
        GameState.tillPlot(col, row);
        return;
      }
      if (def.toolType === 'watering_can') {
        GameState.waterPlot(col, row);
        return;
      }
      if (def.id === 'craft_fertilizer') {
        GameState.fertilizePlot(col, row);
        return;
      }
      if (def.id === 'craft_fence' && canFarmTile) {
        GameState.placeFence(col, row);
        return;
      }
      if (def.category === 'seed') {
        GameState.plantSeed(col, row, def.id);
        return;
      }
    }

    // 6. Fishing Rod near water
    if (def.toolType === 'fishing_rod') {
      const nearWater = this.isNearWater(col, row);
      if (!nearWater) {
        GameState.toast('หันหน้าเข้าหาน้ำเพื่อเหวี่ยงเบ็ดตกปลา!', 'info');
        return;
      }
      if (!GameState.useStamina(5)) return;
      const fish = this.pickFishForCurrentConditions();
      AudioSystem.playWater();
      this.isDialogOpen = true;
      EventBus.emit('fishing:start', { fish, zone: this.currentZone });
      return;
    }

    // 7. Pickaxe in Crystal Mine
    if (def.toolType === 'pickaxe' && this.currentZone === 'mine') {
      const hitOreIdx = this.mineOres.findIndex(
        (o) => Phaser.Math.Distance.Between(this.player.x, this.player.y, o.x, o.y) < 28
      );
      if (hitOreIdx >= 0) {
        if (!GameState.useStamina(3)) return;
        const ore = this.mineOres[hitOreIdx];
        ore.hp -= 1;
        AudioSystem.playTool();
        this.tweens.add({ targets: ore.sprite, x: ore.x + 2, yoyo: true, duration: 45 });
        if (ore.hp <= 0) {
          ore.sprite.destroy();
          this.mineOres.splice(hitOreIdx, 1);
          GameState.addItem(ore.dropItemId, ore.dropQty);
          GameState.addItem('ore_stone', 1);
          GameState.addSkillExp('mining', 14);
          GameState.recordQuestObjective('mine', 1);
          GameState.toast(`ขุดได้ ${ITEM_BY_ID[ore.dropItemId]?.nameTh ?? ore.dropItemId} x${ore.dropQty}!`, 'success');
        }
        return;
      }
    }

    // 8. Combat Weapons (Sword / Bow / Magic Staff)
    if (def.toolType === 'sword' || def.toolType === 'bow' || def.toolType === 'staff') {
      if (this.attackCooldown > 0) return;
      this.attackCooldown = def.toolType === 'sword' ? 320 : 420;
      const dmg = GameState.stats.attack;

      if (def.toolType === 'sword') {
        AudioSystem.playTool();
        const slash = this.add
          .circle(col * TILE_SIZE + 8, row * TILE_SIZE + 8, 12, 0xfef08a, 0.55)
          .setDepth(9200);
        this.time.delayedCall(110, () => slash.destroy());
        this.damageMonstersInRadius(col * TILE_SIZE + 8, row * TILE_SIZE + 8, 28, dmg);
      } else {
        if (def.toolType === 'staff' && !GameState.useStamina(4)) return;
        AudioSystem.playInteract();
        const dirs: Record<Direction, [number, number]> = {
          up: [0, -190],
          down: [0, 190],
          left: [-190, 0],
          right: [190, 0],
        };
        const [vx, vy] = dirs[this.facing];
        const projSprite = this.add
          .image(this.player.x, this.player.y - 6, def.toolType === 'bow' ? 'proj_arrow' : 'proj_magic')
          .setDepth(9200);
        this.projectiles.push({ sprite: projSprite, vx, vy, damage: dmg, lifeMs: 1100 });
      }
    }
  }

  private damageMonstersInRadius(x: number, y: number, radius: number, damage: number): void {
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (Phaser.Math.Distance.Between(x, y, m.sprite.x, m.sprite.y) <= radius + (m.isBoss ? 14 : 6)) {
        m.hp -= damage;
        AudioSystem.playHit();
        const dmgText = this.add
          .text(m.sprite.x, m.sprite.y - 16, `-${damage}`, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#fef08a',
            stroke: '#7f1d1d',
            strokeThickness: 2,
          })
          .setOrigin(0.5)
          .setDepth(9995);
        this.tweens.add({ targets: dmgText, y: dmgText.y - 12, alpha: 0, duration: 480, onComplete: () => dmgText.destroy() });

        if (m.hp <= 0) {
          m.sprite.destroy();
          m.hpBarBg.destroy();
          m.hpBarFill.destroy();
          this.monsters.splice(i, 1);
          GameState.addItem(m.lootItemId, m.isBoss ? 2 : 1);
          GameState.addGold(m.goldReward);
          GameState.addSkillExp('combat', m.expReward);
          GameState.recordQuestObjective('combat', 1);
          GameState.toast(
            m.isBoss
              ? `🏆 ปราบบอส Crystal Guardian สำเร็จ! รับ ${ITEM_BY_ID[m.lootItemId]?.nameTh} x2 + ${m.goldReward} G!`
              : `กำจัด ${m.name}! +${m.goldReward} G`,
            'success'
          );
        }
      }
    }
  }

  private isNearWater(targetCol: number, targetRow: number): boolean {
    const checks = [
      [targetCol, targetRow],
      [targetCol + 1, targetRow],
      [targetCol - 1, targetRow],
      [targetCol, targetRow + 1],
      [targetCol, targetRow - 1],
    ];
    return checks.some(([c, r]) => (this.tileGrid[r]?.[c] ?? '').includes('water'));
  }

  private pickFishForCurrentConditions() {
    const { season, weather, hour } = GameState.worldTime;
    const eligible = FISH_LIST.filter(
      (f) =>
        f.zones.includes(this.currentZone) &&
        f.seasons.includes(season) &&
        (f.weather === 'any' || f.weather.includes(weather)) &&
        hour >= f.timeRange[0] &&
        hour <= f.timeRange[1]
    );
    const pool = eligible.length ? eligible : FISH_LIST.filter((f) => f.rarity === 'Common');
    // Weighted by rarity
    const weights: Record<string, number> = {
      Common: 45,
      Uncommon: 28,
      Rare: 15,
      Epic: 8,
      Legendary: 4,
    };
    const total = pool.reduce((s, f) => s + (weights[f.rarity] ?? 10), 0);
    let roll = Math.random() * total;
    for (const f of pool) {
      roll -= weights[f.rarity] ?? 10;
      if (roll <= 0) return f;
    }
    return pool[0];
  }

  private tryInteract(): void {
    if (this.isPaused || this.isDialogOpen) return;

    // Check animals on farm
    if (this.currentZone === 'farm') {
      for (const animal of GameState.animals) {
        const entry = this.animalSprites.get(animal.id);
        if (entry && Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 26) {
          GameState.interactAnimal(animal.id);
          return;
        }
      }
    }

    if (!this.nearestInteractable) return;
    const info = this.nearestInteractable.info;
    AudioSystem.playInteract();

    if (info.npcId) {
      this.isDialogOpen = true;
      EventBus.emit('npc:open', info.npcId);
      return;
    }
    if (info.shopType) {
      this.isDialogOpen = true;
      EventBus.emit('shop:open', info.shopType);
      return;
    }
    if (info.actionType === 'sleep') {
      GameState.sleepToNextDay();
      return;
    }
    if (info.actionType === 'community') {
      this.isDialogOpen = true;
      EventBus.emit('community:open');
      return;
    }
    if (info.actionType === 'mine_descend') {
      GameState.mineFloor = Math.min(10, GameState.mineFloor + 1);
      GameState.toast(`ลงสู่ Crystal Mine ชั้น ${GameState.mineFloor}`, 'info');
      this.loadZone('mine', 15, 17);
      return;
    }

    this.isDialogOpen = true;
    EventBus.emit('interact:open', info);
  }

  private syncRemotePlayers(players: RemotePlayerState[]): void {
    const activeIds = new Set<string>();
    players.forEach((p) => {
      if (p.zone !== this.currentZone) return;
      activeIds.add(p.id);
      let entry = this.remoteSprites.get(p.id);
      if (!entry) {
        const key = `remote_${p.id}`;
        generatePlayerTexture(this, p.appearance, key);
        const sprite = this.add.sprite(p.x, p.y, key, 0).setOrigin(0.5, 0.92);
        const label = this.add
          .text(p.x, p.y - 25, p.username, {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '7px',
            color: '#93c5fd',
            stroke: '#1e293b',
            strokeThickness: 2,
          })
          .setOrigin(0.5)
          .setDepth(9980);
        entry = { sprite, label };
        this.remoteSprites.set(p.id, entry);
      }
      entry.sprite.setPosition(p.x, p.y).setDepth(p.y);
      entry.label.setPosition(p.x, p.y - 25);
    });

    this.remoteSprites.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        entry.sprite.destroy();
        entry.label.destroy();
        this.remoteSprites.delete(id);
      }
    });
  }

  update(_time: number, delta: number): void {
    // Animate water
    this.waterAnimTimer += delta;
    if (this.waterAnimTimer >= 650) {
      this.waterAnimTimer = 0;
      this.waterFrame = this.waterFrame === 0 ? 1 : 0;
      const texKey = `tile_water_${this.waterFrame}`;
      this.waterTiles.forEach((t) => t.setTexture(texKey));
    }

    if (this.warpCooldown > 0) this.warpCooldown -= delta;
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.isPaused) return;

    // Advance World Clock (1x = ~16 min/day)
    if (!this.isDialogOpen) {
      this.timeAccumMs += delta * this.settings.timeScale;
      if (this.timeAccumMs >= 900) {
        this.timeAccumMs -= 900;
        const wt = GameState.worldTime;
        wt.minute += 1;
        if (wt.minute >= 60) {
          wt.minute = 0;
          wt.hour += 1;
          if (wt.hour >= 24) {
            GameState.sleepToNextDay();
          }
        }
        wt.dayPhase = wt.hour < 10 ? 'Morning' : wt.hour < 17 ? 'Day' : wt.hour < 20 ? 'Evening' : 'Night';
        EventBus.emit('world:time', { ...wt });
      }
    }

    // Day-Night Lighting Overlay
    this.updateAmbientLighting();

    if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.tryInteract();
    }
    if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.action)) {
      this.useActiveTool();
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.isDialogOpen) {
      body.setVelocity(0, 0);
      this.stopWalkAnim();
      return;
    }

    // Movement Input (Keyboard + Smooth 360° Analog Joystick)
    let dx = this.mobileInput.dx;
    let dy = this.mobileInput.dy;
    if (this.cursors && this.keys) {
      if (this.cursors.left.isDown || this.keys.left.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.keys.right.isDown) dx += 1;
      if (this.cursors.up.isDown || this.keys.up.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.keys.down.isDown) dy += 1;
    }

    const len = Math.hypot(dx, dy);
    const isMoving = len > 0.08;
    const wantsSprint = Boolean(this.keys?.shift.isDown) || this.mobileInput.sprinting;
    const isSprinting = isMoving && wantsSprint && GameState.stats.stamina > 2;

    const dtSec = delta / 1000;
    let staminaChanged = false;
    if (isSprinting) {
      GameState.stats.stamina = Math.max(0, GameState.stats.stamina - 12 * dtSec);
      staminaChanged = true;
    } else if (GameState.stats.stamina < GameState.stats.maxStamina) {
      const regenRate = isMoving ? 5 : 12;
      GameState.stats.stamina = Math.min(GameState.stats.maxStamina, GameState.stats.stamina + regenRate * dtSec);
      staminaChanged = true;
    }

    const accel = Math.min(1, delta * 0.022);
    if (isMoving) {
      const nx = dx / len;
      const ny = dy / len;
      const analogMag = Math.min(1, len);
      const maxSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
      const targetVx = nx * maxSpeed * analogMag;
      const targetVy = ny * maxSpeed * analogMag;

      const curVx = Phaser.Math.Linear(body.velocity.x, targetVx, accel);
      const curVy = Phaser.Math.Linear(body.velocity.y, targetVy, accel);
      body.setVelocity(curVx, curVy);

      this.facing = Math.abs(nx) > Math.abs(ny) ? (nx < 0 ? 'left' : 'right') : ny < 0 ? 'up' : 'down';
      const animKey = `player_walk_${this.facing}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.anims.play(animKey, true);
      }
      this.player.anims.timeScale = (isSprinting ? 1.4 : 1) * Math.max(0.55, analogMag);

      const tx = Math.floor(this.player.x / TILE_SIZE);
      const ty = Math.floor(this.player.y / TILE_SIZE);
      const tk = this.tileGrid[ty]?.[tx] ?? '';
      AudioSystem.playFootstep(tk.includes('path') || tk.includes('mine') ? 'path' : 'grass', isSprinting);

      // Subtle sprint dust puff at feet
      if (isSprinting && Math.random() < 0.28) {
        const puff = this.add
          .circle(this.player.x + (Math.random() - 0.5) * 6, this.player.y + 1, 2, 0xfef3c7, 0.65)
          .setDepth(this.player.y - 2);
        this.tweens.add({
          targets: puff,
          y: puff.y - 4,
          alpha: 0,
          scale: 1.7,
          duration: 260,
          onComplete: () => puff.destroy(),
        });
      }
    } else {
      // Smooth deceleration stop
      const decel = Math.min(1, delta * 0.028);
      const nextVx = Phaser.Math.Linear(body.velocity.x, 0, decel);
      const nextVy = Phaser.Math.Linear(body.velocity.y, 0, decel);
      if (Math.hypot(nextVx, nextVy) < 4) {
        body.setVelocity(0, 0);
      } else {
        body.setVelocity(nextVx, nextVy);
      }
      this.stopWalkAnim();
    }

    // Y-Sort & cursor
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y + 1).setDepth(this.player.y - 1);
    this.playerNameTag.setPosition(this.player.x, this.player.y - 25);

    const target = this.getTargetTile();
    this.tileCursor.setPosition(target.col * TILE_SIZE + 8, target.row * TILE_SIZE + 8).setVisible(this.currentZone === 'farm');

    // Update Animals wandering on farm
    if (this.currentZone === 'farm') {
      this.animalSprites.forEach((entry, id) => {
        entry.timer -= delta;
        if (entry.timer <= 0) {
          entry.timer = 1500 + Math.random() * 2500;
          const move = Math.random() < 0.6;
          entry.vx = move ? (Math.random() - 0.5) * 24 : 0;
          entry.vy = move ? (Math.random() - 0.5) * 24 : 0;
        }
        entry.sprite.x = Phaser.Math.Clamp(entry.sprite.x + entry.vx * (delta / 1000), 6 * TILE_SIZE, 28 * TILE_SIZE);
        entry.sprite.y = Phaser.Math.Clamp(entry.sprite.y + entry.vy * (delta / 1000), 12 * TILE_SIZE, 22 * TILE_SIZE);
        entry.sprite.setDepth(entry.sprite.y);
        entry.badge.setPosition(entry.sprite.x, entry.sprite.y - 12);
        const st = GameState.animals.find((a) => a.id === id);
        if (st) {
          st.x = entry.sprite.x;
          st.y = entry.sprite.y;
        }
      });
    }

    // Update Projectiles & Mine Monsters
    this.updateProjectiles(delta);
    this.updateMonsters(delta);

    // Check Physical Warps
    this.checkWarps();
    this.updateNearbyInteractable();

    // Emit Position Snapshot
    const now = performance.now();
    if (now - this.lastEmitTime > 120) {
      this.lastEmitTime = now;
      const tileX = Math.floor(this.player.x / TILE_SIZE);
      const tileY = Math.floor(this.player.y / TILE_SIZE);
      GameState.playerTile = { x: tileX, y: tileY };
      EventBus.emit('player:position', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        tileX,
        tileY,
        zone: this.currentZone,
        zoneName: ZONES[this.currentZone].nameTh,
        direction: this.facing,
        isMoving,
        isSprinting,
        mineFloor: GameState.mineFloor,
      });
      if (staminaChanged) {
        EventBus.emit('player:stats', { ...GameState.stats, stamina: Math.round(GameState.stats.stamina) });
      }
    }
  }

  private updateProjectiles(delta: number): void {
    const dt = delta / 1000;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.lifeMs -= delta;

      let hit = false;
      for (const m of this.monsters) {
        if (Phaser.Math.Distance.Between(p.sprite.x, p.sprite.y, m.sprite.x, m.sprite.y) < (m.isBoss ? 18 : 12)) {
          this.damageMonstersInRadius(p.sprite.x, p.sprite.y, 16, p.damage);
          hit = true;
          break;
        }
      }
      if (hit || p.lifeMs <= 0) {
        p.sprite.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateMonsters(delta: number): void {
    this.monsters.forEach((m) => {
      if (m.hitCooldown > 0) m.hitCooldown -= delta;
      const dist = Phaser.Math.Distance.Between(m.sprite.x, m.sprite.y, this.player.x, this.player.y);
      const mb = m.sprite.body as Phaser.Physics.Arcade.Body;
      if (dist < 130 && dist > 12) {
        const angle = Phaser.Math.Angle.Between(m.sprite.x, m.sprite.y, this.player.x, this.player.y);
        mb.setVelocity(Math.cos(angle) * m.speed, Math.sin(angle) * m.speed);
      } else {
        mb.setVelocity(0, 0);
      }

      if (dist < (m.isBoss ? 22 : 14) && m.hitCooldown <= 0) {
        m.hitCooldown = 950;
        GameState.takeDamage(m.damage);
      }

      m.sprite.setDepth(m.sprite.y);
      const barY = m.sprite.y - (m.isBoss ? 22 : 13);
      const barW = m.isBoss ? 34 : 18;
      m.hpBarBg.setPosition(m.sprite.x, barY);
      m.hpBarFill.setPosition(m.sprite.x, barY).setDisplaySize(Math.max(0, (m.hp / m.maxHp) * barW), 3);
    });
  }

  private checkWarps(): void {
    if (this.warpCooldown > 0) return;
    const pCol = Math.floor(this.player.x / TILE_SIZE);
    const pRow = Math.floor(this.player.y / TILE_SIZE);

    for (const w of ZONES[this.currentZone].warps) {
      if (pCol >= w.col && pCol < w.col + w.width && pRow >= w.row && pRow < w.row + w.height) {
        if (w.requiresSecret && !GameState.unlockedSecret) {
          this.warpCooldown = 1200;
          GameState.toast('🔒 พื้นที่ลับ Whispering Sanctuary ล็อกอยู่! สำรวจ 5 โซนหรือบูรณะ Community Center เพื่อปลดล็อก', 'warning');
          return;
        }
        this.loadZone(w.targetZone, w.targetCol, w.targetRow);
        return;
      }
    }
  }

  private updateAmbientLighting(): void {
    if (this.currentZone === 'mine') {
      this.ambientOverlay.setFillStyle(0x0f172a, 0.25);
      return;
    }
    const t = GameState.worldTime.hour + GameState.worldTime.minute / 60;
    if (t >= 6 && t < 8.5) {
      const f = 1 - (t - 6) / 2.5;
      this.ambientOverlay.setFillStyle(0xffb36b, 0.14 * f);
    } else if (t >= 8.5 && t < 16.5) {
      this.ambientOverlay.setFillStyle(0x000000, 0);
    } else if (t >= 16.5 && t < 19.5) {
      const f = (t - 16.5) / 3;
      this.ambientOverlay.setFillStyle(0xd96b27, 0.22 * f);
    } else {
      const f = Math.min(1, (t - 19.5) / 2.5);
      this.ambientOverlay.setFillStyle(0x162447, 0.22 + 0.25 * f);
    }
  }

  private stopWalkAnim(): void {
    this.player.anims.stop();
    const idleFrames: Record<Direction, number> = { down: 0, up: 3, left: 6, right: 9 };
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
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      EventBus.emit('interact:nearby', closest ? { id: closest.id, title: closest.info.title } : null);
    }
    if (closest) {
      const bob = Math.sin(performance.now() / 220) * 2;
      this.interactBubble.setPosition(closest.x, closest.y - 26 + bob).setVisible(true);
    } else {
      this.interactBubble.setVisible(false);
    }
  }
}
