import React, { useEffect, useState } from 'react';
import type {
  CharacterAppearance,
  GameSettings,
  InteractableInfo,
  PlayerPositionSnapshot,
  PlayerStats,
  WorldTime,
} from '@shared/index';
import { CharacterCreator } from './components/CharacterCreator';
import { DialogBox } from './components/DialogBox';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { MobileControls } from './components/MobileControls';
import { PatchNotesModal } from './components/PatchNotesModal';
import { SettingsModal } from './components/SettingsModal';
import { DEFAULT_APPEARANCE } from './data/characterOptions';
import { EventBus } from './game/systems/EventBus';

type ScreenMode = 'menu' | 'creator' | 'playing';

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.35,
  sfxVolume: 0.6,
  timeScale: 1,
  showMobileControls: 'auto',
};

const INITIAL_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  stamina: 100,
  maxStamina: 100,
  gold: 500,
  level: 1,
  exp: 0,
  nextLevelExp: 100,
};

const INITIAL_TIME: WorldTime = {
  season: 'Spring',
  day: 1,
  year: 1,
  hour: 7,
  minute: 0,
  weather: 'Sunny',
  dayPhase: 'Morning',
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenMode>('menu');
  const [appearance, setAppearance] = useState<CharacterAppearance>(DEFAULT_APPEARANCE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);

  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [worldTime, setWorldTime] = useState<WorldTime>(INITIAL_TIME);
  const [position, setPosition] = useState<PlayerPositionSnapshot | null>(null);
  const [nearbyInteractable, setNearbyInteractable] = useState<{ id: string; title: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<InteractableInfo | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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
      EventBus.on('player:stats', setStats),
      EventBus.on('world:time', setWorldTime),
      EventBus.on('player:position', setPosition),
      EventBus.on('interact:nearby', setNearbyInteractable),
      EventBus.on('interact:open', setActiveDialog),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    EventBus.emit('settings:updated', settings);
  }, [settings]);

  useEffect(() => {
    EventBus.emit('game:pause', showSettings || showPatchNotes);
  }, [showSettings, showPatchNotes]);

  const handleCloseDialog = () => {
    setActiveDialog(null);
    EventBus.emit('interact:closed');
  };

  const shouldShowMobileControls =
    settings.showMobileControls === 'always' ||
    (settings.showMobileControls === 'auto' && isTouchDevice);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {screen === 'menu' && (
        <MainMenu
          appearance={appearance}
          onStartGame={() => setScreen('playing')}
          onOpenCreator={() => setScreen('creator')}
          onOpenSettings={() => setShowSettings(true)}
          onOpenPatchNotes={() => setShowPatchNotes(true)}
        />
      )}

      {screen === 'creator' && (
        <CharacterCreator
          appearance={appearance}
          onChange={setAppearance}
          onBack={() => setScreen('menu')}
          onConfirmPlay={() => {
            const cleanName = appearance.name.trim() || 'Arin';
            const cleanFarm = appearance.farmName.trim() || 'Willowbrook';
            setAppearance({ ...appearance, name: cleanName, farmName: cleanFarm });
            setScreen('playing');
          }}
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
            nearbyInteractable={activeDialog ? null : nearbyInteractable}
            onOpenSettings={() => setShowSettings(true)}
            onOpenPatchNotes={() => setShowPatchNotes(true)}
            onReturnMenu={() => {
              setActiveDialog(null);
              setNearbyInteractable(null);
              setScreen('menu');
            }}
          />
          {shouldShowMobileControls && !activeDialog && (
            <MobileControls canInteract={Boolean(nearbyInteractable)} />
          )}
          {activeDialog && <DialogBox dialog={activeDialog} onClose={handleCloseDialog} />}
        </>
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPatchNotes && <PatchNotesModal onClose={() => setShowPatchNotes(false)} />}
    </div>
  );
};

export default App;
