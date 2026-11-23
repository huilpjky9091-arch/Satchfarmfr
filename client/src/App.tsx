import React, { useEffect, useState } from 'react';
import type {
  CharacterAppearance,
  FishDefinition,
  GameSettings,
  InteractableInfo,
  PlayerPositionSnapshot,
  PlayerStats,
  SaveGameData,
  WorldTime,
} from '@shared/index';
import { CharacterCreator } from './components/CharacterCreator';
import { CommunityModal } from './components/CommunityModal';
import { DialogBox } from './components/DialogBox';
import { FishingMiniGameModal } from './components/FishingMiniGameModal';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameMenusModal, type MenuTab } from './components/GameMenusModal';
import { MainMenu } from './components/MainMenu';
import { MobileControls } from './components/MobileControls';
import { NpcDialogModal } from './components/NpcDialogModal';
import { PatchNotesModal } from './components/PatchNotesModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { DEFAULT_APPEARANCE } from './data/characterOptions';
import { ContentRegistry } from './data/ContentRegistry';
import { GAME_VERSION } from './data/version';
import { EventBus, type ToastMessage } from './game/systems/EventBus';
import { GameState } from './game/systems/GameStateStore';
import { MultiplayerClient } from './game/systems/MultiplayerClient';

type ScreenMode = 'menu' | 'creator' | 'playing';

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.25,
  sfxVolume: 0.6,
  timeScale: 1,
  showMobileControls: 'auto',
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenMode>('menu');
  const [appearance, setAppearance] = useState<CharacterAppearance>(DEFAULT_APPEARANCE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const [activeMenuTab, setActiveMenuTab] = useState<MenuTab | null>(null);
  const [activeShop, setActiveShop] = useState<'seeds' | 'tools' | 'animals' | 'general' | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [activeFishing, setActiveFishing] = useState<FishDefinition | null>(null);

  const [stats, setStats] = useState<PlayerStats>(() => {
    GameState.initNewGame(DEFAULT_APPEARANCE);
    return { ...GameState.stats };
  });
  const [worldTime, setWorldTime] = useState<WorldTime>(() => ({ ...GameState.worldTime }));
  const [position, setPosition] = useState<PlayerPositionSnapshot | null>(null);
  const [nearbyInteractable, setNearbyInteractable] = useState<{ id: string; title: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<InteractableInfo | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [, setHudTick] = useState(0);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    const unsubs = [
      GameState.subscribe(() => {
        setStats({ ...GameState.stats, skills: { ...GameState.stats.skills } });
        setHudTick((t) => t + 1);
      }),
      EventBus.on('world:time', setWorldTime),
      EventBus.on('player:position', (pos) => {
        setPosition(pos);
        MultiplayerClient.sendPosition(pos.zone, pos.x, pos.y, pos.direction, pos.isMoving);
      }),
      EventBus.on('farm:updated', (plots) => {
        MultiplayerClient.syncFarmPlots(plots);
      }),
      EventBus.on('interact:nearby', setNearbyInteractable),
      EventBus.on('interact:open', setActiveDialog),
      EventBus.on('shop:open', setActiveShop),
      EventBus.on('npc:open', setActiveNpcId),
      EventBus.on('community:open', () => setShowCommunity(true)),
      EventBus.on('fishing:start', ({ fish }) => setActiveFishing(fish)),
      EventBus.on('world:toast', (msg) => {
        setToasts((prev) => [...prev.slice(-3), msg]);
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== msg.id));
        }, 3800);
      }),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    EventBus.emit('settings:updated', settings);
  }, [settings]);

  const anyModalOpen = Boolean(
    showSettings || showPatchNotes || showCredits || activeMenuTab || activeShop || activeNpcId || showCommunity || activeFishing
  );

  useEffect(() => {
    EventBus.emit('game:pause', anyModalOpen);
  }, [anyModalOpen]);

  const startFreshGame = (customAppearance = appearance) => {
    const clean = {
      ...customAppearance,
      name: customAppearance.name.trim() || 'Arin',
      farmName: customAppearance.farmName.trim() || 'Willowbrook',
    };
    setAppearance(clean);
    GameState.initNewGame(clean);
    setWorldTime({ ...GameState.worldTime });
    setStats({ ...GameState.stats });
    setScreen('playing');
  };

  const handleLoadSave = (save: SaveGameData) => {
    GameState.loadFromSave(save);
    setAppearance(save.appearance);
    setWorldTime({ ...GameState.worldTime });
    setStats({ ...GameState.stats });
    if (screen === 'playing') {
      EventBus.emit('appearance:updated', save.appearance);
      EventBus.emit('zone:teleport', { zone: save.currentZone, col: save.playerTile.x, row: save.playerTile.y });
    } else {
      setScreen('playing');
    }
    GameState.toast(`โหลดเซฟของ ${save.appearance.name} สำเร็จ!`, 'success');
  };

  const closeOverlayAndResume = () => {
    setActiveDialog(null);
    setActiveShop(null);
    setActiveNpcId(null);
    setShowCommunity(false);
    setActiveFishing(null);
    EventBus.emit('interact:closed');
  };

  const shouldShowMobileControls =
    settings.showMobileControls === 'always' ||
    (settings.showMobileControls === 'auto' && isTouchDevice);

  const registrySummary = ContentRegistry.getSummary();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {screen === 'menu' && (
        <MainMenu
          appearance={appearance}
          onStartGame={() => startFreshGame(appearance)}
          onOpenLoad={() => setActiveMenuTab('save')}
          onOpenMultiplayer={() => setActiveMenuTab('mp')}
          onOpenCreator={() => setScreen('creator')}
          onOpenSettings={() => setShowSettings(true)}
          onOpenPatchNotes={() => setShowPatchNotes(true)}
          onOpenCredits={() => setShowCredits(true)}
        />
      )}

      {screen === 'creator' && (
        <CharacterCreator
          appearance={appearance}
          onChange={setAppearance}
          onBack={() => setScreen('menu')}
          onConfirmPlay={() => startFreshGame(appearance)}
        />
      )}

      {screen === 'playing' && (
        <>
          <GameCanvas appearance={appearance} settings={settings} />
          <GameHUD
            appearance={appearance}
            stats={stats}
            worldTime={worldTime}
            position={position}
            nearbyInteractable={activeDialog || anyModalOpen ? null : nearbyInteractable}
            toasts={toasts}
            onOpenMenu={(tab) => setActiveMenuTab(tab)}
            onOpenSettings={() => setShowSettings(true)}
            onReturnMenu={() => {
              GameState.saveToSlot('autosave');
              closeOverlayAndResume();
              setScreen('menu');
            }}
          />
          {shouldShowMobileControls && !activeDialog && !anyModalOpen && (
            <MobileControls canInteract={Boolean(nearbyInteractable)} />
          )}
          {activeDialog && <DialogBox dialog={activeDialog} onClose={closeOverlayAndResume} />}
          {activeShop && <ShopModal initialTab={activeShop} onClose={closeOverlayAndResume} />}
          {activeNpcId && <NpcDialogModal npcId={activeNpcId} onClose={closeOverlayAndResume} />}
          {showCommunity && <CommunityModal onClose={closeOverlayAndResume} />}
          {activeFishing && (
            <FishingMiniGameModal fish={activeFishing} onFinish={() => closeOverlayAndResume()} />
          )}
        </>
      )}

      {activeMenuTab && (
        <GameMenusModal
          initialTab={activeMenuTab}
          inGame={screen === 'playing'}
          onLoadSave={handleLoadSave}
          onClose={() => setActiveMenuTab(null)}
        />
      )}

      {showSettings && (
        <SettingsModal settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}

      {showPatchNotes && <PatchNotesModal onClose={() => setShowPatchNotes(false)} />}

      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="wood-panel w-full max-w-md rounded-2xl p-5 space-y-3 text-center">
            <h3 className="font-pixel text-sm text-wood-800">EVERGREEN VALLEY ONLINE</h3>
            <p className="text-xs font-bold text-meadow-600">Version {GAME_VERSION} • Original Web RPG</p>
            <p className="text-xs text-wood-800 leading-relaxed">
              พัฒนาด้วย React + TypeScript + Phaser 3 + Tailwind CSS + Node.js &amp; Socket.IO
              ภาพ Pixel Art และเสียงประกอบทั้งหมดสร้างขึ้นใหม่แบบ Procedural 100%
            </p>
            <div className="rounded-xl bg-wood-50 border border-wood-400 p-2.5 text-[11px] text-wood-800">
              Content Registry: {registrySummary.items} Items • {registrySummary.crops} Crops •{' '}
              {registrySummary.fish} Fish • {registrySummary.npcs} NPCs • {registrySummary.quests} Quests
            </div>
            <button onClick={() => setShowCredits(false)} className="wood-btn-primary w-full rounded-xl py-2 text-sm font-bold">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
