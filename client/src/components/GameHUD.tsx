import React from 'react';
import {
  Backpack,
  CloudRain,
  CloudSnow,
  Coins,
  Compass,
  Hammer,
  Heart,
  Home,
  Moon,
  Save,
  ScrollText,
  Settings,
  Sun,
  Sunset,
  Users,
  Zap,
} from 'lucide-react';
import type {
  CharacterAppearance,
  PlayerPositionSnapshot,
  PlayerStats,
  WorldTime,
} from '@shared/index';
import { ITEM_BY_ID } from '../data/items';
import { AudioSystem } from '../game/systems/AudioSystem';
import { EventBus, type ToastMessage } from '../game/systems/EventBus';
import { GameState } from '../game/systems/GameStateStore';
import type { MenuTab } from './GameMenusModal';

interface GameHUDProps {
  appearance: CharacterAppearance;
  stats: PlayerStats;
  worldTime: WorldTime;
  position: PlayerPositionSnapshot | null;
  nearbyInteractable: { id: string; title: string } | null;
  toasts: ToastMessage[];
  onOpenMenu: (tab: MenuTab) => void;
  onOpenSettings: () => void;
  onReturnMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  appearance,
  stats,
  worldTime,
  position,
  nearbyInteractable,
  toasts,
  onOpenMenu,
  onOpenSettings,
  onReturnMenu,
}) => {
  const formattedTime = `${String(worldTime.hour).padStart(2, '0')}:${String(worldTime.minute).padStart(2, '0')}`;

  const renderWeatherIcon = () => {
    if (worldTime.weather === 'Rainy' || worldTime.weather === 'Storm') return <CloudRain className="w-4 h-4 text-sky-300" />;
    if (worldTime.weather === 'Snow') return <CloudSnow className="w-4 h-4 text-blue-100" />;
    if (worldTime.dayPhase === 'Night') return <Moon className="w-4 h-4 text-indigo-200" />;
    if (worldTime.dayPhase === 'Evening') return <Sunset className="w-4 h-4 text-orange-300" />;
    return <Sun className="w-4 h-4 text-amber-300" />;
  };

  const openTab = (tab: MenuTab) => () => {
    AudioSystem.playClick();
    onOpenMenu(tab);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-2 sm:p-3.5">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        {/* Top-Left: Stats */}
        <div className="pointer-events-auto wood-panel-dark rounded-xl px-3 py-2 min-w-[165px] sm:min-w-[210px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-xs sm:text-sm text-wood-50 truncate">{appearance.name}</span>
            <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
              LV.{stats.level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-wood-900 overflow-hidden border border-wood-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
                style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold w-8 text-right">{stats.hp}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-wood-900 overflow-hidden border border-wood-700">
              <div
                className="h-full bg-gradient-to-r from-meadow-500 to-lime-400 transition-all"
                style={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold w-8 text-right">{Math.round(stats.stamina)}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-wood-700/80">
            <span className="text-wood-200 text-[10px]">ATK {stats.attack} • DEF {stats.defense}</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              {stats.gold.toLocaleString()} G
            </span>
          </div>
        </div>

        {/* Top-Center: Toast Stack */}
        <div className="hidden sm:flex flex-col items-center gap-1.5 max-w-md">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-lg border-2 ${
                t.tone === 'success'
                  ? 'bg-emerald-900/95 border-emerald-400 text-emerald-50'
                  : t.tone === 'warning'
                    ? 'bg-amber-900/95 border-amber-400 text-amber-50'
                    : 'bg-wood-900/90 border-wood-400 text-wood-50'
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>

        {/* Top-Right: Clock, Zone & Quick Menu Buttons */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="wood-panel-dark rounded-xl px-3 py-2 text-right min-w-[145px]">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-200">
              {renderWeatherIcon()}
              <span>
                {worldTime.season} D{worldTime.day} Y{worldTime.year}
              </span>
            </div>
            <div className="font-pixel text-sm text-wood-50 mt-0.5">{formattedTime}</div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-wood-200 mt-0.5">
              <Compass className="w-3 h-3 text-meadow-400 shrink-0" />
              <span className="truncate max-w-[160px]">
                {position?.zone === 'mine'
                  ? `Crystal Mine ชั้น ${position.mineFloor}`
                  : position?.zoneName ?? appearance.farmName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-1 max-w-[230px]">
            <button onClick={openTab('bag')} title="กระเป๋า & สกิล" className="wood-btn rounded-lg p-1.5"><Backpack className="w-4 h-4" /></button>
            <button onClick={openTab('craft')} title="คราฟต์" className="wood-btn rounded-lg p-1.5"><Hammer className="w-4 h-4" /></button>
            <button onClick={openTab('quests')} title="เควสต์" className="wood-btn rounded-lg p-1.5"><ScrollText className="w-4 h-4" /></button>
            <button onClick={openTab('social')} title="NPC & ความสัมพันธ์" className="wood-btn rounded-lg p-1.5"><Heart className="w-4 h-4" /></button>
            <button onClick={openTab('map')} title="แผนที่โลก (Fast Travel)" className="wood-btn rounded-lg p-1.5"><Compass className="w-4 h-4" /></button>
            <button onClick={openTab('save')} title="Save / Load" className="wood-btn rounded-lg p-1.5"><Save className="w-4 h-4" /></button>
            <button onClick={openTab('mp')} title="Multiplayer Online" className="wood-btn rounded-lg p-1.5"><Users className="w-4 h-4" /></button>
            <button onClick={() => { AudioSystem.playClick(); onOpenSettings(); }} title="ตั้งค่า" className="wood-btn rounded-lg p-1.5"><Settings className="w-4 h-4" /></button>
            <button onClick={() => { AudioSystem.playClick(); onReturnMenu(); }} title="เมนูหลัก" className="wood-btn rounded-lg p-1.5"><Home className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Nearby Prompt + 9-Slot Hotbar */}
      <div className="flex flex-col items-center gap-1.5 pb-1">
        {nearbyInteractable && (
          <button
            onClick={() => EventBus.emit('interact:trigger')}
            className="pointer-events-auto wood-panel rounded-full px-4 py-1 text-xs font-bold flex items-center gap-2 animate-bounce"
          >
            <span className="rounded bg-wood-800 text-wood-50 px-1.5 py-0.5 font-mono text-[11px]">E</span>
            <span>{nearbyInteractable.title}</span>
          </button>
        )}

        {/* 9-Slot Interactive Hotbar */}
        <div className="pointer-events-auto wood-panel-dark rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto max-w-full">
          {GameState.inventory.slice(0, 9).map((slot, idx) => {
            const def = slot ? ITEM_BY_ID[slot.itemId] : undefined;
            const active = GameState.selectedHotbarIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  AudioSystem.playClick();
                  GameState.selectHotbar(idx);
                }}
                title={def ? `${def.nameTh} — ${def.description}` : `ช่อง ${idx + 1}`}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center shrink-0 transition ${
                  active
                    ? 'bg-amber-200 border-amber-400 scale-105 text-wood-900'
                    : 'bg-wood-800/80 border-wood-600 text-wood-100 hover:bg-wood-700'
                }`}
              >
                <span className={`absolute top-0.5 left-1 text-[8px] font-bold ${active ? 'text-wood-700' : 'text-wood-400'}`}>
                  {idx + 1}
                </span>
                {def && (
                  <>
                    <span className="text-base sm:text-lg leading-none">{def.icon}</span>
                    {slot!.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold bg-wood-900 text-amber-200 rounded px-1">
                        {slot!.quantity}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2.5 rounded-full bg-wood-900/75 border border-wood-600/70 px-3.5 py-0.5 text-[11px] text-wood-100">
          <span><kbd className="font-mono font-bold text-amber-300">WASD</kbd> เดิน</span>
          <span>•</span>
          <span><kbd className="font-mono font-bold text-amber-300">Space / คลิกซ้าย</kbd> ใช้เครื่องมือ/โจมตี</span>
          <span>•</span>
          <span><kbd className="font-mono font-bold text-amber-300">E</kbd> คุย/สำรวจ/นอน</span>
          <span>•</span>
          <span><kbd className="font-mono font-bold text-amber-300">1–9</kbd> เลือกไอเทม</span>
        </div>
      </div>
    </div>
  );
};
