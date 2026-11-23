# Evergreen Valley Online (`v1.0.0`)

2D Pixel Art Farming RPG / Life Simulation / Online Multiplayer — built with **React + TypeScript + Phaser 3 + Tailwind CSS + Node.js & Socket.IO**.

**Live Web Game**: https://huilpjky9091-arch.github.io/Satchfarmfr/

## Implemented Systems (Phases 1–10)

- **10 Open World Zones**: Player Farm, Evergreen Village, Town Market, Community Center, Enchanted Forest, Fishing Lake, Sunlit Beach, Emerald Mountain, Crystal Mine (10 Floors), and unlockable Whispering Sanctuary.
- **Farming & Ranching**: 32 original crops across 4 seasons (Spring/Summer/Autumn/Winter), till/water/fertilize/plant/harvest/fence, and 7 farm animals (Chicken, Duck, Rabbit, Cow, Goat, Sheep, Pig).
- **RPG, Inventory & Crafting**: Character creator, 24-slot inventory + 9-slot hotbar, 5 RPG skills (Farming, Mining, Fishing, Foraging, Combat), equipment, and crafting recipes.
- **20 Original NPCs & Quests**: Daily schedules, seasonal dialogues, loved/liked/disliked gifts, heart events, marriage (*Starlight Pendant*), and 12 quests across all 7 categories.
- **Fishing & Crystal Mine Combat**: Playable fishing mini-game with 42 fish (5 Legendaries), 10-floor mine with ores/gems, monsters, Floor 10 Boss (*Crystal Guardian*), Sword/Bow/Magic Staff & Armor.
- **Real-time Multiplayer Backend (`server/`)**: Node.js + Express + Socket.IO with salted scrypt auth, 6-char Room Codes (1–8 players), real-time player movement sync, shared farm sync, chat, and item gifting.
- **Save/Load & Patch Registry**: Auto-save, 3 manual slots, backup recovery, JSON Export/Import, `ContentRegistry`, and `migrateSaveData()`.

## Run Locally

```bash
npm install
npm run dev       # Start web client on http://localhost:5173
npm run server    # Start multiplayer Socket.IO server on http://localhost:3001
```

## Build & Verify

```bash
npm run typecheck
npm run build
```
