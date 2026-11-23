import React from 'react';
import {
  CloudRain,
  CloudSnow,
  Coins,
  Compass,
  Heart,
  Home,
  Settings,
  Sun,
  Sunset,
  Moon,
  Zap,
  ScrollText,
} from 'lucide-react';
import type {
  CharacterAppearance,
  PlayerPositionSnapshot,
  PlayerStats,
  WorldTime,
} from '@shared/index';
import { AudioSystem } from '../game/systems/AudioSystem';
import { EventBus } from '../game/systems/EventBus';

interface GameHUDProps {
  appearance: CharacterAppearance;
  stats: PlayerStats;
  worldTime: WorldTime;
  position: PlayerPositionSnapshot | null;
  nearbyInteractable: { id: string; title: string } | null;
  onOpenSettings: () => void;
  onOpenPatchNotes: () => void;
  onReturnMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  appearance,
  stats,
  worldTime,
  position,
  nearbyInteractable,
  onOpenSettings,
  onOpenPatchNotes,
  onReturnMenu,
}) => {
  const formattedTime = `${String(worldTime.hour).padStart(2, '0')}:${String(
    worldTime.minute
  ).padStart(2, '0')}`;

  const renderWeatherIcon = () => {
    if (worldTime.weather === 'Rainy' || worldTime.weather === 'Storm') {
      return <CloudRain className="w-4 h-4 text-sky-300" />;
    }
    if (worldTime.weather === 'Snow') {
      return <CloudSnow className="w-4 h-4 text-blue-100" />;
    }
    if (worldTime.dayPhase === 'Night') return <Moon className="w-4 h-4 text-indigo-200" />;
    if (worldTime.dayPhase === 'Evening') return <Sunset className="w-4 h-4 text-orange-300" />;
    return <Sun className="w-4 h-4 text-amber-300" />;
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-4">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        {/* Top-Left: Character Status */}
        <div className="pointer-events-auto wood-panel-dark rounded-xl px-3 py-2.5 min-w-[170px] sm:min-w-[215px]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-xs sm:text-sm text-wood-50 truncate">
              {appearance.name}
            </span>
            <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
              LV.{stats.level}
            </span>
          </div>

          {/* HP Bar */}
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
            <div className="flex-1 h-2.5 rounded-full bg-wood-900 overflow-hidden border border-wood-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-150"
                style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold w-8 text-right">{stats.hp}</span>
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
            <div className="flex-1 h-2.5 rounded-full bg-wood-900 overflow-hidden border border-wood-700">
              <div
                className="h-full bg-gradient-to-r from-meadow-500 to-lime-400 transition-all duration-100"
                style={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold w-8 text-right">{stats.stamina}</span>
          </div>

          {/* Gold */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-wood-700/80">
            <span className="text-wood-200 text-[11px]">{appearance.farmName}</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              {stats.gold.toLocaleString()} G
            </span>
          </div>
        </div>

        {/* Top-Right: Clock, Season, Weather & Menu Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="wood-panel-dark rounded-xl px-3 py-2 text-right min-w-[145px]">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-200">
              {renderWeatherIcon()}
              <span>
                {worldTime.season} Day {worldTime.day}, Y{worldTime.year}
              </span>
            </div>
            <div className="font-pixel text-sm sm:text-base text-wood-50 mt-0.5">
              {formattedTime}
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-wood-200 mt-0.5">
              <Compass className="w-3 h-3 text-meadow-400 shrink-0" />
              <span className="truncate max-w-[160px]">
                {position?.zone ?? `${appearance.farmName} Farm`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                AudioSystem.playClick();
                onOpenPatchNotes();
              }}
              title="Patch Notes"
              className="wood-btn rounded-lg p-2"
            >
              <ScrollText className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                AudioSystem.playClick();
                onOpenSettings();
              }}
              title="Settings"
              className="wood-btn rounded-lg p-2"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                AudioSystem.playClick();
                onReturnMenu();
              }}
              title="Main Menu"
              className="wood-btn rounded-lg p-2"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Nearby Interact Prompt & Controls Bar */}
      <div className="flex flex-col items-center gap-2 pb-1">
        {nearbyInteractable && (
          <button
            onClick={() => EventBus.emit('interact:trigger')}
            className="pointer-events-auto wood-panel rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce"
          >
            <span className="rounded bg-wood-800 text-wood-50 px-1.5 py-0.5 font-mono text-xs">
              E
            </span>
            <span>สำรวจ: {nearbyInteractable.title}</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-3 rounded-full bg-wood-900/75 border border-wood-600/70 px-4 py-1 text-xs text-wood-100 backdrop-blur-sm">
          <span>
            <kbd className="font-mono font-bold text-amber-300">WASD / Arrows</kbd> เดิน
          </span>
          <span>•</span>
          <span>
            <kbd className="font-mono font-bold text-amber-300">Shift</kbd> วิ่ง (Sprint)
          </span>
          <span>•</span>
          <span>
            <kbd className="font-mono font-bold text-amber-300">E / Space</kbd> สำรวจ
          </span>
          {position && (
            <>
              <span>•</span>
              <span className="font-mono text-[11px] text-wood-200">
                Tile ({position.tileX}, {position.tileY})
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
