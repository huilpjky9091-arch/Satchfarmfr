import React from 'react';
import { FolderOpen, Info, Play, ScrollText, Settings, Sparkles, UserRound, Users } from 'lucide-react';
import type { CharacterAppearance } from '@shared/index';
import { CURRENT_PHASE, GAME_VERSION } from '../data/version';
import { renderCharacterPreviewDataUrl } from '../game/assets/PixelArtGenerator';
import { AudioSystem } from '../game/systems/AudioSystem';

interface MainMenuProps {
  appearance: CharacterAppearance;
  onStartGame: () => void;
  onOpenLoad: () => void;
  onOpenMultiplayer: () => void;
  onOpenCreator: () => void;
  onOpenSettings: () => void;
  onOpenPatchNotes: () => void;
  onOpenCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  appearance,
  onStartGame,
  onOpenLoad,
  onOpenMultiplayer,
  onOpenCreator,
  onOpenSettings,
  onOpenPatchNotes,
  onOpenCredits,
}) => {
  const previewUrl = React.useMemo(() => renderCharacterPreviewDataUrl(appearance), [appearance]);
  const handle = (fn: () => void) => () => {
    AudioSystem.playClick();
    fn();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#6cb8e6] via-[#a7daf2] to-[#7ec468] p-4">
      <div className="pointer-events-none absolute top-10 right-12 w-20 h-20 rounded-full bg-[#fff3a6] shadow-[0_0_50px_rgba(255,243,166,0.9)] opacity-90" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 w-[65%] h-64 rounded-[100%] bg-[#5aa346] border-t-4 border-[#78c25f]" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-[70%] h-72 rounded-[100%] bg-[#478a37] border-t-4 border-[#63ad4e]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3.5 my-auto">
        <div className="wood-panel w-full rounded-xl px-5 py-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wood-700/90 px-3 py-1 text-[11px] font-semibold text-wood-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>v{GAME_VERSION} • {CURRENT_PHASE}</span>
          </div>
          <h1 className="font-pixel text-xl sm:text-2xl leading-relaxed text-wood-800 drop-shadow-[0_2px_0_rgba(255,255,255,0.65)]">
            EVERGREEN VALLEY
          </h1>
          <p className="font-pixel text-xs text-meadow-600 tracking-widest mt-1">ONLINE</p>
          <p className="text-xs sm:text-sm text-wood-700 mt-1.5 font-medium">
            2D Pixel Art Farming RPG • 10 โซน • 32 พืช • 42 ปลา • 20 NPC • Multiplayer
          </p>
        </div>

        <div className="wood-panel-dark w-full rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-14 rounded-lg bg-meadow-600/40 border-2 border-wood-400 flex items-center justify-center overflow-hidden">
              <img src={previewUrl} alt={appearance.name} className="w-8 h-12 object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div>
              <div className="text-[11px] text-wood-200">ตัวละครพร้อมออกเดินทาง</div>
              <div className="text-sm font-bold text-wood-50">{appearance.name}</div>
              <div className="text-xs text-amber-300">{appearance.farmName} Farm</div>
            </div>
          </div>
          <button onClick={handle(onOpenCreator)} className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold">
            แต่งตัว
          </button>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button onClick={handle(onStartGame)} className="wood-btn-primary w-full rounded-xl py-3 px-5 flex items-center justify-center gap-2 text-base font-bold">
            <Play className="w-5 h-5 fill-current" />
            <span>เริ่มเกมใหม่ (Start Game)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={handle(onOpenLoad)} className="wood-btn rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-sm font-bold">
              <FolderOpen className="w-4 h-4" />
              <span>โหลดเกม (Load)</span>
            </button>
            <button onClick={handle(onOpenMultiplayer)} className="wood-btn rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-sm font-bold">
              <Users className="w-4 h-4" />
              <span>Multiplayer</span>
            </button>
          </div>

          <button onClick={handle(onOpenCreator)} className="wood-btn w-full rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-bold">
            <UserRound className="w-4 h-4" />
            <span>สร้างตัวละคร (Character Creation)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={handle(onOpenSettings)} className="wood-btn rounded-xl py-2 px-2 flex items-center justify-center gap-1 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>ตั้งค่า</span>
            </button>
            <button onClick={handle(onOpenPatchNotes)} className="wood-btn rounded-xl py-2 px-2 flex items-center justify-center gap-1 text-xs font-bold">
              <ScrollText className="w-3.5 h-3.5" />
              <span>Patch</span>
            </button>
            <button onClick={handle(onOpenCredits)} className="wood-btn rounded-xl py-2 px-2 flex items-center justify-center gap-1 text-xs font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Credits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
