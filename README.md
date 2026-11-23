# Evergreen Valley Online

2D Pixel Art Farming RPG / Life Simulation / Multiplayer — built with React, TypeScript, Phaser 3, and Tailwind CSS.

## Current Status: Phase 1 Complete (`v0.1.0`)

- **Game Engine**: Phaser 3 + Arcade Physics + crisp pixel-art rendering (`pixelArt: true`, `roundPixels: true`)
- **Original Pixel Art**: Procedural 16x16 tileset & multi-tile props (farmhouse, oak/pine trees, stone well, shipping bin, fences, wildflowers, animated pond water)
- **Character Creation**: Live pixel-art sprite customization (Name, Farm Name, Skin Tone, 4 Hair Styles, Hair/Shirt/Pants Colors)
- **Controls**: 8-directional movement (`WASD` / `Arrow Keys`), Sprint (`Shift`) with Stamina drain/regen, Interact (`E` / `Space`), and Touch Virtual D-Pad + Action buttons for Mobile & Tablet
- **World Core**: Collisions, Y-sorted depth rendering, interactable world objects with RPG dialogue box, Day-Night lighting cycle & clock, procedural Web Audio SFX

## Run Locally

```bash
npm install
npm run dev
```

## Build & Typecheck

```bash
npm run typecheck
npm run build
```

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full 10-phase development tracker.
