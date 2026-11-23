import Phaser from 'phaser';
import type { CharacterAppearance, Direction } from '@shared/index';
import { ANIMALS } from '../../data/animals';
import { NPCS } from '../../data/npcs';

function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function registerCanvas(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  scene.textures.addCanvas(key, canvas);
}

function drawHumanoidFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: Direction,
  frame: number,
  app: Pick<CharacterAppearance, 'skinColor' | 'hairStyle' | 'hairColor' | 'shirtColor' | 'pantsColor'>
): void {
  const skin = app.skinColor;
  const skinDark = shadeColor(skin, -12);
  const hair = app.hairColor;
  const hairDark = shadeColor(hair, -16);
  const hairLight = shadeColor(hair, 14);
  const shirt = app.shirtColor;
  const shirtDark = shadeColor(shirt, -15);
  const pants = app.pantsColor;
  const pantsDark = shadeColor(pants, -14);
  const outline = '#261810';
  const boot = '#4a2e1b';

  const bob = frame === 0 ? 0 : -1;
  const leftLegOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  const rightLegOff = frame === 2 ? -1 : frame === 1 ? 1 : 0;

  px(ctx, ox + 3, oy + 21, 10, 2, 'rgba(20, 16, 12, 0.35)');

  if (dir === 'down' || dir === 'up') {
    px(ctx, ox + 5, oy + 17 + leftLegOff, 3, 3, pants);
    px(ctx, ox + 5, oy + 20 + leftLegOff, 3, 2, boot);
    px(ctx, ox + 8, oy + 17 + rightLegOff, 3, 3, pantsDark);
    px(ctx, ox + 8, oy + 20 + rightLegOff, 3, 2, boot);
  } else {
    const stride = frame === 1 ? -2 : frame === 2 ? 2 : 0;
    px(ctx, ox + 6 + stride, oy + 17, 3, 3, pantsDark);
    px(ctx, ox + 6 + stride, oy + 20, 3, 2, boot);
    px(ctx, ox + 7 - stride, oy + 17, 3, 3, pants);
    px(ctx, ox + 7 - stride, oy + 20, 3, 2, boot);
  }

  px(ctx, ox + 4, oy + 11 + bob, 8, 6, shirt);
  px(ctx, ox + 4, oy + 16 + bob, 8, 1, shirtDark);
  px(ctx, ox + 3, oy + 11 + bob, 1, 6, outline);
  px(ctx, ox + 12, oy + 11 + bob, 1, 6, outline);

  const armSwing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  if (dir === 'down' || dir === 'up') {
    px(ctx, ox + 3, oy + 12 + bob + armSwing, 2, 4, shirtDark);
    px(ctx, ox + 3, oy + 15 + bob + armSwing, 2, 2, skin);
    px(ctx, ox + 11, oy + 12 + bob - armSwing, 2, 4, shirtDark);
    px(ctx, ox + 11, oy + 15 + bob - armSwing, 2, 2, skin);
  } else {
    px(ctx, ox + 6 + armSwing, oy + 12 + bob, 3, 4, shirtDark);
    px(ctx, ox + 6 + armSwing, oy + 15 + bob, 2, 2, skin);
  }

  px(ctx, ox + 4, oy + 3 + bob, 8, 8, skin);
  px(ctx, ox + 3, oy + 4 + bob, 1, 6, outline);
  px(ctx, ox + 12, oy + 4 + bob, 1, 6, outline);
  px(ctx, ox + 4, oy + 10 + bob, 8, 1, skinDark);

  if (dir === 'down') {
    px(ctx, ox + 5, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 9, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 5, oy + 7 + bob, 1, 1, '#ffffff');
    px(ctx, ox + 9, oy + 7 + bob, 1, 1, '#ffffff');
    px(ctx, ox + 4, oy + 9 + bob, 1, 1, '#e8968a');
    px(ctx, ox + 11, oy + 9 + bob, 1, 1, '#e8968a');
  } else if (dir === 'left') {
    px(ctx, ox + 5, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 5, oy + 7 + bob, 1, 1, '#ffffff');
  } else if (dir === 'right') {
    px(ctx, ox + 9, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 10, oy + 7 + bob, 1, 1, '#ffffff');
  }

  px(ctx, ox + 3, oy + 2 + bob, 10, 4, hair);
  px(ctx, ox + 4, oy + 1 + bob, 8, 2, hair);
  px(ctx, ox + 5, oy + 2 + bob, 5, 1, hairLight);

  if (app.hairStyle === 'spiky') {
    px(ctx, ox + 4, oy + 0 + bob, 2, 2, hair);
    px(ctx, ox + 7, oy + 0 + bob, 2, 2, hairLight);
    px(ctx, ox + 10, oy + 0 + bob, 2, 2, hair);
  } else if (app.hairStyle === 'long') {
    px(ctx, ox + 3, oy + 5 + bob, 2, 8, hairDark);
    px(ctx, ox + 11, oy + 5 + bob, 2, 8, hairDark);
    if (dir === 'up') {
      px(ctx, ox + 3, oy + 4 + bob, 10, 10, hair);
      px(ctx, ox + 4, oy + 12 + bob, 8, 2, hairDark);
    }
  } else if (app.hairStyle === 'bob') {
    px(ctx, ox + 2, oy + 4 + bob, 2, 6, hair);
    px(ctx, ox + 12, oy + 4 + bob, 2, 6, hair);
    if (dir === 'up') {
      px(ctx, ox + 3, oy + 4 + bob, 10, 7, hair);
    }
  } else {
    if (dir === 'up') {
      px(ctx, ox + 3, oy + 3 + bob, 10, 7, hair);
      px(ctx, ox + 4, oy + 9 + bob, 8, 1, hairDark);
    } else if (dir === 'down') {
      px(ctx, ox + 3, oy + 4 + bob, 1, 3, hairDark);
      px(ctx, ox + 12, oy + 4 + bob, 1, 3, hairDark);
    } else if (dir === 'left') {
      px(ctx, ox + 9, oy + 4 + bob, 4, 5, hairDark);
    } else {
      px(ctx, ox + 3, oy + 4 + bob, 4, 5, hairDark);
    }
  }
}

export function renderCharacterPreviewDataUrl(
  appearance: Pick<CharacterAppearance, 'skinColor' | 'hairStyle' | 'hairColor' | 'shirtColor' | 'pantsColor'>
): string {
  const [canvas, ctx] = createCanvas(16, 24);
  drawHumanoidFrame(ctx, 0, 0, 'down', 0, appearance);
  return canvas.toDataURL();
}

export function generatePlayerTexture(scene: Phaser.Scene, appearance: CharacterAppearance, sheetKey = 'player_sheet'): void {
  const frameW = 16;
  const frameH = 24;
  const [canvas, ctx] = createCanvas(frameW * 3, frameH * 4);
  const dirs: Direction[] = ['down', 'up', 'left', 'right'];

  dirs.forEach((dir, row) => {
    for (let col = 0; col < 3; col++) {
      drawHumanoidFrame(ctx, col * frameW, row * frameH, dir, col, appearance);
    }
  });

  if (scene.textures.exists(sheetKey)) {
    scene.textures.remove(sheetKey);
  }
  const tex = scene.textures.addCanvas(sheetKey, canvas);
  if (tex) {
    let idx = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        tex.add(idx, 0, col * frameW, row * frameH, frameW, frameH);
        idx++;
      }
    }
  }

  if (sheetKey === 'player_sheet') {
    dirs.forEach((dir, row) => {
      const key = `player_walk_${dir}`;
      if (scene.anims.exists(key)) scene.anims.remove(key);
      const base = row * 3;
      scene.anims.create({
        key,
        frames: [
          { key: sheetKey, frame: base + 1 },
          { key: sheetKey, frame: base },
          { key: sheetKey, frame: base + 2 },
          { key: sheetKey, frame: base },
        ],
        frameRate: 8,
        repeat: -1,
      });
    });
  }
}

export function generateWorldTextures(scene: Phaser.Scene): void {
  // Seasonal Grass Tiles
  const seasonGrass: Record<string, [string, string, string]> = {
    Spring: ['#69ad4c', '#54913b', '#84c961'],
    Summer: ['#56a343', '#428532', '#78c754'],
    Autumn: ['#c48c3d', '#a36d29', '#deb059'],
    Winter: ['#dbe9f4', '#b8d0e3', '#f2f9ff'],
  };

  Object.entries(seasonGrass).forEach(([season, [base, dark, light]]) => {
    for (let i = 0; i < 3; i++) {
      const [c, ctx] = createCanvas(16, 16);
      px(ctx, 0, 0, 16, 16, i === 1 ? shadeColor(base, -4) : base);
      px(ctx, 2 + i * 3, 3, 1, 2, dark);
      px(ctx, 3 + i * 3, 4, 1, 1, light);
      px(ctx, 11 - i * 2, 10, 1, 2, dark);
      px(ctx, 12 - i * 2, 11, 1, 1, light);
      registerCanvas(scene, `tile_grass_${season}_${i}`, c);
    }
  });

  // Beach Sand, Mine Floor, Sanctuary Grass
  {
    const [cs, ctxs] = createCanvas(16, 16);
    px(ctxs, 0, 0, 16, 16, '#e8cfa0');
    px(ctxs, 3, 4, 2, 1, '#d4b782');
    px(ctxs, 11, 11, 2, 1, '#f5e2bc');
    registerCanvas(scene, 'tile_sand', cs);

    const [cm, ctxm] = createCanvas(16, 16);
    px(ctxm, 0, 0, 16, 16, '#434652');
    px(ctxm, 2, 2, 5, 4, '#4e5261');
    px(ctxm, 9, 9, 5, 5, '#3a3d47');
    registerCanvas(scene, 'tile_mine_floor', cm);

    const [cg, ctxg] = createCanvas(16, 16);
    px(ctxg, 0, 0, 16, 16, '#3b8c7d');
    px(ctxg, 4, 5, 2, 2, '#63e6be');
    px(ctxg, 11, 11, 1, 2, '#2d6e62');
    registerCanvas(scene, 'tile_sanctuary', cg);
  }

  // Flowers
  [
    ['#f7d959', '#fff4b8'],
    ['#f28da8', '#ffd1df'],
  ].forEach(([petal, center], i) => {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#69ad4c');
    px(ctx, 4, 4, 3, 3, petal);
    px(ctx, 5, 5, 1, 1, center);
    px(ctx, 10, 10, 3, 3, petal);
    px(ctx, 11, 11, 1, 1, center);
    registerCanvas(scene, `tile_flower_${i}`, c);
  });

  // Paths & Farm Soil
  {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#c99b63');
    px(ctx, 3, 5, 2, 1, '#b3844e');
    px(ctx, 10, 3, 2, 2, '#d9b584');
    px(ctx, 7, 11, 3, 1, '#b3844e');
    registerCanvas(scene, 'tile_path_dirt', c);

    const [cs, ctxs] = createCanvas(16, 16);
    px(ctxs, 0, 0, 16, 16, '#8c887d');
    px(ctxs, 1, 1, 6, 6, '#aba69a');
    px(ctxs, 9, 1, 6, 5, '#a19c90');
    px(ctxs, 1, 9, 7, 6, '#9c978b');
    px(ctxs, 10, 8, 5, 7, '#b0ab9f');
    registerCanvas(scene, 'tile_path_stone', cs);

    const [cf, ctxf] = createCanvas(16, 16);
    px(ctxf, 0, 0, 16, 16, '#96653b');
    px(ctxf, 1, 3, 14, 2, '#82542e');
    px(ctxf, 1, 8, 14, 2, '#82542e');
    px(ctxf, 1, 13, 14, 2, '#82542e');
    registerCanvas(scene, 'tile_farm_soil', cf);

    const [ct, ctxt] = createCanvas(16, 16);
    px(ctxt, 1, 1, 14, 14, '#7d4f28');
    px(ctxt, 2, 3, 12, 2, '#633c1c');
    px(ctxt, 2, 7, 12, 2, '#633c1c');
    px(ctxt, 2, 11, 12, 2, '#633c1c');
    registerCanvas(scene, 'tile_tilled', ct);

    const [cw, ctxw] = createCanvas(16, 16);
    px(ctxw, 1, 1, 14, 14, '#4d2e14');
    px(ctxw, 2, 3, 12, 2, '#3b210c');
    px(ctxw, 2, 7, 12, 2, '#3b210c');
    px(ctxw, 2, 11, 12, 2, '#3b210c');
    registerCanvas(scene, 'tile_tilled_watered', cw);

    // Dock wood
    const [cd, ctxd] = createCanvas(16, 16);
    px(ctxd, 0, 0, 16, 16, '#8f5b31');
    px(ctxd, 0, 4, 16, 1, '#6b4120');
    px(ctxd, 0, 9, 16, 1, '#6b4120');
    px(ctxd, 0, 14, 16, 1, '#6b4120');
    registerCanvas(scene, 'tile_dock', cd);
  }

  // Water frames
  for (let f = 0; f < 2; f++) {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#3d8ec2');
    px(ctx, 2 + f * 3, 5, 5, 1, '#79c6ed');
    px(ctx, 8 - f * 2, 11, 5, 1, '#79c6ed');
    registerCanvas(scene, `tile_water_${f}`, c);
  }

  // Trees
  {
    const [c, ctx] = createCanvas(32, 44);
    px(ctx, 6, 37, 20, 5, 'rgba(20, 28, 16, 0.3)');
    px(ctx, 12, 24, 8, 16, '#6e4526');
    px(ctx, 13, 24, 3, 16, '#855632');
    px(ctx, 4, 12, 24, 15, '#2f6e32');
    px(ctx, 6, 6, 20, 18, '#3f8a3d');
    px(ctx, 8, 4, 16, 12, '#54a649');
    px(ctx, 10, 6, 6, 4, '#76c45e');
    registerCanvas(scene, 'obj_tree_oak', c);

    const [cp, ctxp] = createCanvas(32, 48);
    px(ctxp, 7, 41, 18, 5, 'rgba(20, 28, 16, 0.3)');
    px(ctxp, 13, 34, 6, 10, '#5e3b22');
    px(ctxp, 4, 28, 24, 8, '#1f5236');
    px(ctxp, 6, 21, 20, 9, '#286642');
    px(ctxp, 8, 14, 16, 9, '#317a4d');
    px(ctxp, 11, 7, 10, 9, '#3d915c');
    registerCanvas(scene, 'obj_tree_pine', cp);
  }

  // Buildings: Farmhouse, Shop Stall, Community Hall, Mine Entrance
  {
    const [c, ctx] = createCanvas(80, 76);
    px(ctx, 4, 68, 72, 6, 'rgba(20, 16, 12, 0.3)');
    px(ctx, 8, 60, 64, 10, '#7a756c');
    px(ctx, 8, 34, 64, 28, '#e3c79b');
    px(ctx, 8, 34, 4, 28, '#7a4b26');
    px(ctx, 68, 34, 4, 28, '#7a4b26');
    px(ctx, 56, 4, 10, 22, '#8a5a4e');
    for (let row = 0; row < 24; row += 2) {
      const inset = Math.max(0, 22 - row);
      px(ctx, 2 + inset, 12 + row, 76 - inset * 2, 3, row % 4 === 0 ? '#a84432' : '#c2523c');
    }
    px(ctx, 18, 44, 14, 22, '#693c1e');
    px(ctx, 20, 46, 10, 20, '#854e28');
    px(ctx, 27, 55, 2, 2, '#f2ca52');
    px(ctx, 46, 42, 16, 12, '#5c3317');
    px(ctx, 48, 44, 12, 8, '#ffe285');
    registerCanvas(scene, 'obj_farmhouse', c);

    // Market Stall (48x44)
    const [cs, ctxs] = createCanvas(48, 44);
    px(ctxs, 2, 38, 44, 5, 'rgba(20,16,12,0.3)');
    px(ctxs, 4, 24, 40, 16, '#965c2e');
    px(ctxs, 6, 26, 36, 12, '#b8763e');
    px(ctxs, 6, 10, 3, 16, '#6e401d');
    px(ctxs, 39, 10, 3, 16, '#6e401d');
    for (let x = 2; x < 46; x += 6) {
      px(ctxs, x, 4, 3, 10, '#d9483b');
      px(ctxs, x + 3, 4, 3, 10, '#f7f1e3');
    }
    registerCanvas(scene, 'obj_shop_stall', cs);

    // Community Hall (96x76)
    const [ch, ctxh] = createCanvas(96, 76);
    px(ctxh, 4, 68, 88, 6, 'rgba(20,16,12,0.3)');
    px(ctxh, 8, 32, 80, 38, '#f0dec0');
    px(ctxh, 4, 14, 88, 20, '#3a6ea5');
    px(ctxh, 12, 6, 72, 10, '#2c5480');
    px(ctxh, 38, 44, 20, 26, '#7a4b26');
    px(ctxh, 40, 46, 16, 24, '#9c6234');
    px(ctxh, 16, 42, 14, 14, '#ffe285');
    px(ctxh, 66, 42, 14, 14, '#ffe285');
    registerCanvas(scene, 'obj_community_hall', ch);

    // Mine Entrance (48x44)
    const [cm, ctxm] = createCanvas(48, 44);
    px(ctxm, 2, 10, 44, 34, '#6b6f78');
    px(ctxm, 6, 4, 36, 12, '#7d828c');
    px(ctxm, 12, 16, 24, 28, '#1a1b24');
    px(ctxm, 10, 14, 4, 30, '#7a4b26');
    px(ctxm, 34, 14, 4, 30, '#7a4b26');
    px(ctxm, 10, 14, 28, 4, '#8f592d');
    registerCanvas(scene, 'obj_mine_entrance', cm);
  }

  // Props: Shipping Bin, Signpost, Well, Fences, Rock, Bush, Ladder
  {
    const [cb, ctxb] = createCanvas(24, 22);
    px(ctxb, 2, 5, 20, 14, '#8c5529');
    px(ctxb, 4, 7, 16, 10, '#ad6d39');
    px(ctxb, 2, 3, 20, 4, '#6e401d');
    px(ctxb, 5, 5, 2, 14, '#45484f');
    px(ctxb, 17, 5, 2, 14, '#45484f');
    registerCanvas(scene, 'obj_shipping_bin', cb);

    const [cs, ctxs] = createCanvas(16, 22);
    px(ctxs, 7, 10, 2, 10, '#6b4120');
    px(ctxs, 2, 3, 12, 8, '#8a562c');
    px(ctxs, 3, 4, 10, 6, '#c48a4f');
    registerCanvas(scene, 'obj_signpost', cs);

    const [cw, ctxw] = createCanvas(32, 36);
    px(ctxw, 5, 19, 22, 13, '#7c7870');
    px(ctxw, 8, 19, 16, 4, '#2d6e99');
    px(ctxw, 7, 8, 2, 12, '#6b4120');
    px(ctxw, 23, 8, 2, 12, '#6b4120');
    px(ctxw, 3, 6, 26, 4, '#9c4330');
    px(ctxw, 6, 3, 20, 4, '#b8543d');
    registerCanvas(scene, 'obj_well', cw);

    const [fh, ctxfh] = createCanvas(16, 16);
    px(ctxfh, 0, 5, 16, 3, '#a86e3b');
    px(ctxfh, 0, 10, 16, 3, '#966031');
    px(ctxfh, 2, 2, 3, 13, '#7d4d25');
    px(ctxfh, 11, 2, 3, 13, '#7d4d25');
    registerCanvas(scene, 'obj_fence_h', fh);

    const [fv, ctxfv] = createCanvas(16, 16);
    px(ctxfv, 6, 0, 4, 16, '#8c582b');
    px(ctxfv, 5, 2, 6, 4, '#a86e3b');
    registerCanvas(scene, 'obj_fence_v', fv);

    const [cr, ctxr] = createCanvas(16, 16);
    px(ctxr, 2, 5, 12, 8, '#757a7d');
    px(ctxr, 4, 3, 8, 6, '#92989c');
    registerCanvas(scene, 'obj_rock', cr);

    const [cbu, ctxbu] = createCanvas(20, 18);
    px(ctxbu, 2, 5, 16, 10, '#2e6e31');
    px(ctxbu, 4, 3, 12, 9, '#449142');
    px(ctxbu, 6, 6, 2, 2, '#e84a5f');
    px(ctxbu, 12, 8, 2, 2, '#e84a5f');
    registerCanvas(scene, 'obj_bush', cbu);

    const [cl, ctxl] = createCanvas(16, 20);
    px(ctxl, 2, 2, 12, 16, '#1a1b24');
    px(ctxl, 4, 2, 2, 16, '#a86e3b');
    px(ctxl, 10, 2, 2, 16, '#a86e3b');
    for (let y = 4; y <= 14; y += 3) px(ctxl, 4, y, 8, 2, '#c98a4b');
    registerCanvas(scene, 'obj_ladder', cl);
  }

  // Mine Ore Nodes
  const oreNodes: [string, string][] = [
    ['ore_node_copper', '#d97742'],
    ['ore_node_iron', '#cbd5e1'],
    ['ore_node_silver', '#f1f5f9'],
    ['ore_node_gold', '#fbbf24'],
    ['ore_node_crystal', '#38bdf8'],
    ['ore_node_gem', '#c084fc'],
  ];
  oreNodes.forEach(([key, vein]) => {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 2, 4, 12, 10, '#5a5f6b');
    px(ctx, 4, 2, 8, 10, '#727885');
    px(ctx, 4, 5, 3, 3, vein);
    px(ctx, 9, 8, 3, 3, vein);
    px(ctx, 7, 4, 2, 2, '#ffffff');
    registerCanvas(scene, key, c);
  });

  // Monsters & Boss
  {
    // Slime
    const [cs, ctxs] = createCanvas(16, 16);
    px(ctxs, 3, 7, 10, 7, '#4ade80');
    px(ctxs, 4, 5, 8, 4, '#86efac');
    px(ctxs, 5, 9, 2, 2, '#14532d');
    px(ctxs, 9, 9, 2, 2, '#14532d');
    registerCanvas(scene, 'mob_slime', cs);

    // Cave Bat
    const [cb, ctxb] = createCanvas(18, 14);
    px(ctxb, 1, 4, 5, 5, '#581c87');
    px(ctxb, 12, 4, 5, 5, '#581c87');
    px(ctxb, 6, 3, 6, 7, '#7e22ce');
    px(ctxb, 7, 5, 1, 2, '#fde047');
    px(ctxb, 10, 5, 1, 2, '#fde047');
    registerCanvas(scene, 'mob_bat', cb);

    // Rock Golem
    const [cg, ctxg] = createCanvas(20, 22);
    px(ctxg, 4, 4, 12, 14, '#64748b');
    px(ctxg, 2, 8, 16, 8, '#475569');
    px(ctxg, 6, 7, 3, 2, '#f97316');
    px(ctxg, 11, 7, 3, 2, '#f97316');
    registerCanvas(scene, 'mob_golem', cg);

    // Floor 10 Boss: Crystal Guardian (32x34)
    const [cbo, ctxbo] = createCanvas(32, 34);
    px(ctxbo, 4, 6, 24, 24, '#1e3a8a');
    px(ctxbo, 8, 2, 16, 26, '#3b82f6');
    px(ctxbo, 12, 0, 8, 10, '#7dd3fc');
    px(ctxbo, 9, 12, 4, 4, '#fde047');
    px(ctxbo, 19, 12, 4, 4, '#fde047');
    px(ctxbo, 11, 20, 10, 4, '#93c5fd');
    registerCanvas(scene, 'mob_boss_guardian', cbo);
  }

  // Farm Animals (7 species)
  ANIMALS.forEach((a) => {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 2, 12, 12, 3, 'rgba(20,16,12,0.28)');
    px(ctx, 3, 5, 10, 8, a.color);
    px(ctx, 4, 3, 6, 5, a.color);
    px(ctx, 5, 6, 3, 3, a.accentColor);
    px(ctx, 4, 5, 1, 1, '#1a120b');
    px(ctx, 8, 5, 1, 1, '#1a120b');
    px(ctx, 4, 12, 2, 2, '#4a2e1b');
    px(ctx, 10, 12, 2, 2, '#4a2e1b');
    registerCanvas(scene, `animal_${a.species}`, c);
  });

  // 20 NPC Sprites
  NPCS.forEach((npc) => {
    const [c, ctx] = createCanvas(16, 24);
    drawHumanoidFrame(ctx, 0, 0, 'down', 0, npc.appearance);
    registerCanvas(scene, `npc_${npc.id}`, c);
  });

  // Forageables & Projectiles & Sparkle
  {
    const items: [string, string, string][] = [
      ['forage_wood', '#8c5529', '#b5743c'],
      ['forage_hardwood', '#5c3317', '#824b25'],
      ['forage_wild_herb', '#3b9c42', '#76d96a'],
      ['forage_glow_mushroom', '#22d3ee', '#cffafe'],
      ['forage_shell', '#f9a8d4', '#fdf2f8'],
    ];
    items.forEach(([k, c1, c2]) => {
      const [c, ctx] = createCanvas(14, 14);
      px(ctx, 3, 4, 8, 7, c1);
      px(ctx, 5, 2, 4, 5, c2);
      registerCanvas(scene, k, c);
    });

    const [pa, ctxa] = createCanvas(10, 4);
    px(ctxa, 0, 1, 8, 2, '#d9a45b');
    px(ctxa, 7, 0, 3, 4, '#e2e8f0');
    registerCanvas(scene, 'proj_arrow', pa);

    const [pm, ctxm] = createCanvas(8, 8);
    px(ctxm, 1, 1, 6, 6, '#a78bfa');
    px(ctxm, 2, 2, 4, 4, '#fef08a');
    registerCanvas(scene, 'proj_magic', pm);

    const [cp, ctxp] = createCanvas(4, 4);
    px(ctxp, 1, 0, 2, 4, '#fff4b8');
    px(ctxp, 0, 1, 4, 2, '#fff4b8');
    registerCanvas(scene, 'particle_sparkle', cp);
  }
}
