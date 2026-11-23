import Phaser from 'phaser';
import type { CharacterAppearance, Direction } from '@shared/index';

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

function drawPlayerFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: Direction,
  frame: number, // 0 idle, 1 left step, 2 right step
  app: CharacterAppearance
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

  // Ground shadow
  px(ctx, ox + 3, oy + 21, 10, 2, 'rgba(20, 16, 12, 0.35)');

  // Boots & Legs
  if (dir === 'down' || dir === 'up') {
    // Left leg
    px(ctx, ox + 5, oy + 17 + leftLegOff, 3, 3, pants);
    px(ctx, ox + 5, oy + 20 + leftLegOff, 3, 2, boot);
    // Right leg
    px(ctx, ox + 8, oy + 17 + rightLegOff, 3, 3, pantsDark);
    px(ctx, ox + 8, oy + 20 + rightLegOff, 3, 2, boot);
  } else {
    // Side legs
    const stride = frame === 1 ? -2 : frame === 2 ? 2 : 0;
    px(ctx, ox + 6 + stride, oy + 17, 3, 3, pantsDark);
    px(ctx, ox + 6 + stride, oy + 20, 3, 2, boot);
    px(ctx, ox + 7 - stride, oy + 17, 3, 3, pants);
    px(ctx, ox + 7 - stride, oy + 20, 3, 2, boot);
  }

  // Torso / Shirt
  px(ctx, ox + 4, oy + 11 + bob, 8, 6, shirt);
  px(ctx, ox + 4, oy + 16 + bob, 8, 1, shirtDark);
  px(ctx, ox + 3, oy + 11 + bob, 1, 6, outline);
  px(ctx, ox + 12, oy + 11 + bob, 1, 6, outline);

  // Arms
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

  // Head
  px(ctx, ox + 4, oy + 3 + bob, 8, 8, skin);
  px(ctx, ox + 3, oy + 4 + bob, 1, 6, outline);
  px(ctx, ox + 12, oy + 4 + bob, 1, 6, outline);
  px(ctx, ox + 4, oy + 10 + bob, 8, 1, skinDark);

  // Eyes / Face
  if (dir === 'down') {
    px(ctx, ox + 5, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 9, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 5, oy + 7 + bob, 1, 1, '#ffffff');
    px(ctx, ox + 9, oy + 7 + bob, 1, 1, '#ffffff');
    // Rosy cheeks
    px(ctx, ox + 4, oy + 9 + bob, 1, 1, '#e8968a');
    px(ctx, ox + 11, oy + 9 + bob, 1, 1, '#e8968a');
  } else if (dir === 'left') {
    px(ctx, ox + 5, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 5, oy + 7 + bob, 1, 1, '#ffffff');
  } else if (dir === 'right') {
    px(ctx, ox + 9, oy + 7 + bob, 2, 2, '#1f1612');
    px(ctx, ox + 10, oy + 7 + bob, 1, 1, '#ffffff');
  }

  // Hair base cap
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
    // Classic
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

export function renderCharacterPreviewDataUrl(appearance: CharacterAppearance): string {
  const [canvas, ctx] = createCanvas(16, 24);
  drawPlayerFrame(ctx, 0, 0, 'down', 0, appearance);
  return canvas.toDataURL();
}

export function generatePlayerTexture(scene: Phaser.Scene, appearance: CharacterAppearance): void {
  const frameW = 16;
  const frameH = 24;
  const [canvas, ctx] = createCanvas(frameW * 3, frameH * 4);
  const dirs: Direction[] = ['down', 'up', 'left', 'right'];

  dirs.forEach((dir, row) => {
    for (let col = 0; col < 3; col++) {
      drawPlayerFrame(ctx, col * frameW, row * frameH, dir, col, appearance);
    }
  });

  if (scene.textures.exists('player_sheet')) {
    scene.textures.remove('player_sheet');
  }
  const tex = scene.textures.addCanvas('player_sheet', canvas);
  if (tex) {
    let idx = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        tex.add(idx, 0, col * frameW, row * frameH, frameW, frameH);
        idx++;
      }
    }
  }

  // Register or refresh walk animations
  dirs.forEach((dir, row) => {
    const key = `player_walk_${dir}`;
    if (scene.anims.exists(key)) {
      scene.anims.remove(key);
    }
    const base = row * 3;
    scene.anims.create({
      key,
      frames: [
        { key: 'player_sheet', frame: base + 1 },
        { key: 'player_sheet', frame: base },
        { key: 'player_sheet', frame: base + 2 },
        { key: 'player_sheet', frame: base },
      ],
      frameRate: 8,
      repeat: -1,
    });
  });
}

export function generateWorldTextures(scene: Phaser.Scene): void {
  // 1. Grass tiles (3 variants)
  const grassShades = ['#69ad4c', '#63a647', '#6eb250'];
  grassShades.forEach((base, i) => {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, base);
    // Subtle blades
    px(ctx, 2 + i * 3, 3, 1, 2, '#54913b');
    px(ctx, 3 + i * 3, 4, 1, 1, '#84c961');
    px(ctx, 11 - i * 2, 10, 1, 2, '#54913b');
    px(ctx, 12 - i * 2, 11, 1, 1, '#84c961');
    px(ctx, 6, 13 - i * 2, 2, 1, '#5d9e42');
    registerCanvas(scene, `tile_grass_${i}`, c);
  });

  // 2. Flower grass tiles
  [
    ['#f7d959', '#fff4b8'],
    ['#f28da8', '#ffd1df'],
  ].forEach(([petal, center], i) => {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#69ad4c');
    // Flower 1
    px(ctx, 4, 4, 3, 3, petal);
    px(ctx, 5, 5, 1, 1, center);
    px(ctx, 5, 7, 1, 2, '#41782d');
    // Flower 2
    px(ctx, 10, 10, 3, 3, petal);
    px(ctx, 11, 11, 1, 1, center);
    px(ctx, 11, 13, 1, 2, '#41782d');
    registerCanvas(scene, `tile_flower_${i}`, c);
  });

  // 3. Dirt Path
  {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#c99b63');
    px(ctx, 0, 0, 16, 1, '#d6ad78');
    px(ctx, 3, 5, 2, 1, '#b3844e');
    px(ctx, 10, 3, 2, 2, '#d9b584');
    px(ctx, 7, 11, 3, 1, '#b3844e');
    px(ctx, 12, 12, 2, 1, '#a67744');
    registerCanvas(scene, 'tile_path_dirt', c);
  }

  // 4. Stone Path
  {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#8c887d');
    px(ctx, 1, 1, 6, 6, '#aba69a');
    px(ctx, 9, 1, 6, 5, '#a19c90');
    px(ctx, 1, 9, 7, 6, '#9c978b');
    px(ctx, 10, 8, 5, 7, '#b0ab9f');
    px(ctx, 2, 2, 4, 1, '#c4bfb4');
    px(ctx, 10, 2, 4, 1, '#bab5aa');
    registerCanvas(scene, 'tile_path_stone', c);
  }

  // 5. Farm Soil Plot (cleared soil ready for Phase 3 farming)
  {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#96653b');
    px(ctx, 1, 2, 14, 2, '#82542e');
    px(ctx, 1, 7, 14, 2, '#82542e');
    px(ctx, 1, 12, 14, 2, '#82542e');
    px(ctx, 3, 4, 2, 1, '#a87447');
    px(ctx, 10, 9, 3, 1, '#a87447');
    registerCanvas(scene, 'tile_farm_soil', c);
  }

  // 6. Water tiles (2 shimmer frames)
  for (let f = 0; f < 2; f++) {
    const [c, ctx] = createCanvas(16, 16);
    px(ctx, 0, 0, 16, 16, '#3d8ec2');
    px(ctx, 0, 0, 16, 2, '#4ba0d4');
    px(ctx, 2 + f * 3, 5, 5, 1, '#79c6ed');
    px(ctx, 8 - f * 2, 11, 5, 1, '#79c6ed');
    px(ctx, 4, 13, 3, 1, '#2f76a6');
    registerCanvas(scene, `tile_water_${f}`, c);
  }

  // 7. Oak Tree (32x44)
  {
    const [c, ctx] = createCanvas(32, 44);
    // Shadow
    px(ctx, 6, 37, 20, 5, 'rgba(20, 28, 16, 0.3)');
    // Trunk
    px(ctx, 12, 24, 8, 16, '#6e4526');
    px(ctx, 13, 24, 3, 16, '#855632');
    px(ctx, 11, 38, 10, 2, '#57351c');
    // Canopy layers
    px(ctx, 4, 12, 24, 15, '#2f6e32');
    px(ctx, 2, 15, 28, 10, '#2f6e32');
    px(ctx, 6, 6, 20, 18, '#3f8a3d');
    px(ctx, 4, 10, 24, 12, '#3f8a3d');
    px(ctx, 8, 4, 16, 12, '#54a649');
    // Highlights
    px(ctx, 10, 6, 6, 4, '#76c45e');
    px(ctx, 17, 9, 5, 3, '#76c45e');
    px(ctx, 7, 13, 4, 3, '#54a649');
    registerCanvas(scene, 'obj_tree_oak', c);
  }

  // 8. Pine Tree (32x48)
  {
    const [c, ctx] = createCanvas(32, 48);
    px(ctx, 7, 41, 18, 5, 'rgba(20, 28, 16, 0.3)');
    px(ctx, 13, 34, 6, 10, '#5e3b22');
    // Layered triangles
    px(ctx, 4, 28, 24, 8, '#1f5236');
    px(ctx, 6, 21, 20, 9, '#286642');
    px(ctx, 8, 14, 16, 9, '#317a4d');
    px(ctx, 11, 7, 10, 9, '#3d915c');
    px(ctx, 14, 3, 4, 5, '#4da86d');
    registerCanvas(scene, 'obj_tree_pine', c);
  }

  // 9. Cozy Farmhouse (80x76)
  {
    const [c, ctx] = createCanvas(80, 76);
    // Ground shadow
    px(ctx, 4, 68, 72, 6, 'rgba(20, 16, 12, 0.3)');
    // Stone foundation
    px(ctx, 8, 60, 64, 10, '#7a756c');
    px(ctx, 10, 62, 60, 6, '#948e84');
    // Timber Walls
    px(ctx, 8, 34, 64, 28, '#e3c79b');
    px(ctx, 8, 34, 4, 28, '#7a4b26');
    px(ctx, 68, 34, 4, 28, '#7a4b26');
    px(ctx, 38, 34, 4, 28, '#8c582e');
    px(ctx, 8, 34, 64, 3, '#6e4220');
    // Chimney
    px(ctx, 56, 4, 10, 22, '#8a5a4e');
    px(ctx, 55, 4, 12, 3, '#6b4238');
    // Roof (terracotta shingles)
    for (let row = 0; row < 24; row += 2) {
      const inset = Math.max(0, 22 - row);
      px(ctx, 2 + inset, 12 + row, 76 - inset * 2, 3, row % 4 === 0 ? '#a84432' : '#c2523c');
    }
    px(ctx, 2, 34, 76, 3, '#7a2d20');
    // Front Door
    px(ctx, 18, 44, 14, 22, '#693c1e');
    px(ctx, 20, 46, 10, 20, '#854e28');
    px(ctx, 27, 55, 2, 2, '#f2ca52');
    // Porch step
    px(ctx, 15, 66, 20, 4, '#a66b3c');
    // Warm glowing windows
    px(ctx, 46, 42, 16, 12, '#5c3317');
    px(ctx, 48, 44, 12, 8, '#ffe285');
    px(ctx, 53, 44, 2, 8, '#5c3317');
    px(ctx, 48, 47, 12, 2, '#5c3317');
    // Window flower box
    px(ctx, 45, 54, 18, 4, '#7a4b26');
    px(ctx, 47, 52, 3, 2, '#e85d75');
    px(ctx, 52, 52, 3, 2, '#f7d959');
    px(ctx, 57, 52, 3, 2, '#e85d75');
    registerCanvas(scene, 'obj_farmhouse', c);
  }

  // 10. Shipping Bin (24x22)
  {
    const [c, ctx] = createCanvas(24, 22);
    px(ctx, 2, 17, 20, 4, 'rgba(20, 16, 12, 0.3)');
    px(ctx, 2, 5, 20, 14, '#8c5529');
    px(ctx, 4, 7, 16, 10, '#ad6d39');
    px(ctx, 2, 3, 20, 4, '#6e401d');
    px(ctx, 3, 4, 18, 2, '#c28148');
    // Iron bands
    px(ctx, 5, 5, 2, 14, '#45484f');
    px(ctx, 17, 5, 2, 14, '#45484f');
    registerCanvas(scene, 'obj_shipping_bin', c);
  }

  // 11. Signpost (16x22)
  {
    const [c, ctx] = createCanvas(16, 22);
    px(ctx, 4, 18, 8, 3, 'rgba(20, 16, 12, 0.3)');
    px(ctx, 7, 10, 2, 10, '#6b4120');
    px(ctx, 2, 3, 12, 8, '#8a562c');
    px(ctx, 3, 4, 10, 6, '#c48a4f');
    px(ctx, 4, 5, 8, 1, '#5e3618');
    px(ctx, 4, 7, 6, 1, '#5e3618');
    registerCanvas(scene, 'obj_signpost', c);
  }

  // 12. Stone Well (32x36)
  {
    const [c, ctx] = createCanvas(32, 36);
    px(ctx, 4, 30, 24, 5, 'rgba(20, 16, 12, 0.3)');
    // Stone base
    px(ctx, 5, 19, 22, 13, '#7c7870');
    px(ctx, 7, 21, 18, 9, '#99948b');
    px(ctx, 8, 19, 16, 4, '#2d6e99');
    // Wooden roof posts
    px(ctx, 7, 8, 2, 12, '#6b4120');
    px(ctx, 23, 8, 2, 12, '#6b4120');
    // Roof
    px(ctx, 3, 6, 26, 4, '#9c4330');
    px(ctx, 6, 3, 20, 4, '#b8543d');
    px(ctx, 10, 1, 12, 3, '#c96249');
    registerCanvas(scene, 'obj_well', c);
  }

  // 13. Fences
  {
    const [ch, ctxh] = createCanvas(16, 16);
    px(ctxh, 0, 5, 16, 3, '#a86e3b');
    px(ctxh, 0, 10, 16, 3, '#966031');
    px(ctxh, 2, 2, 3, 13, '#7d4d25');
    px(ctxh, 11, 2, 3, 13, '#7d4d25');
    registerCanvas(scene, 'obj_fence_h', ch);

    const [cv, ctxv] = createCanvas(16, 16);
    px(ctxv, 6, 0, 4, 16, '#8c582b');
    px(ctxv, 5, 2, 6, 4, '#a86e3b');
    px(ctxv, 5, 10, 6, 4, '#a86e3b');
    registerCanvas(scene, 'obj_fence_v', cv);
  }

  // 14. Rock & Bush
  {
    const [cr, ctxr] = createCanvas(16, 16);
    px(ctxr, 2, 11, 12, 4, 'rgba(20,16,12,0.28)');
    px(ctxr, 2, 5, 12, 8, '#757a7d');
    px(ctxr, 4, 3, 8, 6, '#92989c');
    px(ctxr, 5, 4, 4, 2, '#b4babe');
    registerCanvas(scene, 'obj_rock', cr);

    const [cb, ctxb] = createCanvas(20, 18);
    px(ctxb, 2, 13, 16, 4, 'rgba(20,16,12,0.28)');
    px(ctxb, 2, 5, 16, 10, '#2e6e31');
    px(ctxb, 4, 3, 12, 9, '#449142');
    px(ctxb, 6, 6, 2, 2, '#e84a5f');
    px(ctxb, 12, 8, 2, 2, '#e84a5f');
    registerCanvas(scene, 'obj_bush', cb);
  }

  // 15. Firefly / Pollen particle
  {
    const [cp, ctxp] = createCanvas(4, 4);
    px(ctxp, 1, 0, 2, 4, '#fff4b8');
    px(ctxp, 0, 1, 4, 2, '#fff4b8');
    px(ctxp, 1, 1, 2, 2, '#ffffff');
    registerCanvas(scene, 'particle_sparkle', cp);
  }
}
