import React from 'react';
import { Play, UserRound, Settings, ScrollText, Sparkles } from 'lucide-react';
import type { CharacterAppearance } from '@shared/index';
import { CURRENT_PHASE, GAME_VERSION } from '../data/version';
import { renderCharacterPreviewDataUrl } from '../game/assets/PixelArtGenerator';
import { AudioSystem } from '../game/systems/AudioSystem';

interface MainMenuProps {
  appearance: CharacterAppearance;
  onStartGame: () => void;
  onOpenCreator: () => void;
  onOpenSettings: () => void;
  onOpenPatchNotes: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  appearance,
  onStartGame,
  onOpenCreator,
  onOpenSettings,
  onOpenPatchNotes,
}) => {
  const previewUrl = React.useMemo(() => renderCharacterPreviewDataUrl(appearance), [appearance]);

  const handleClick = (fn: () => void) => () => {
    AudioSystem.playClick();
    fn();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#6cb8e6] via-[#a7daf2] to-[#7ec468] p-4">
      {/* Decorative Pixel Sun & Hills */}
      <div className="pointer-events-none absolute top-10 right-12 w-20 h-20 rounded-full bg-[#fff3a6] shadow-[0_0_50px_rgba(255,243,166,0.9)] opacity-90" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 w-[65%] h-64 rounded-[100%] bg-[#5aa346] border-t-4 border-[#78c25f]" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-[70%] h-72 rounded-[100%] bg-[#478a37] border-t-4 border-[#63ad4e]" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5">
        {/* Title Signboard */}
        <div className="wood-panel w-full rounded-xl px-6 py-5 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wood-700/90 px-3 py-1 text-xs font-semibold text-wood-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>v{GAME_VERSION} • {CURRENT_PHASE}</span>
          </div>
          <h1 className="font-pixel text-xl sm:text-2xl leading-relaxed text-wood-800 drop-shadow-[0_2px_0_rgba(255,255,255,0.65)]">
            EVERGREEN VALLEY
          </h1>
          <p className="font-pixel text-xs text-meadow-600 tracking-widest mt-1">
            ONLINE
          </p>
          <p className="text-sm text-wood-700 mt-2.5 font-medium">
            2D Pixel Art Farming RPG • เล่นได้จริงบน PC, Tablet &amp; Mobile
          </p>
        </div>

        {/* Character Badge Preview */}
        <div className="wood-panel-dark w-full rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 rounded-lg bg-meadow-600/40 border-2 border-wood-400 flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt={appearance.name}
                className="w-9 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div>
              <div className="text-xs text-wood-200">ตัวละครปัจจุบัน</div>
              <div className="text-base font-bold text-wood-50">{appearance.name}</div>
              <div className="text-xs text-amber-300">{appearance.farmName} Farm</div>
            </div>
          </div>
          <button
            onClick={handleClick(onOpenCreator)}
            className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold"
          >
            ปรับแต่ง
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleClick(onStartGame)}
            className="wood-btn-primary w-full rounded-xl py-3.5 px-5 flex items-center justify-center gap-2.5 text-lg font-bold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>เข้าสู่โลกเกม (Start Game)</span>
          </button>

          <button
            onClick={handleClick(onOpenCreator)}
            className="wood-btn w-full rounded-xl py-3 px-5 flex items-center justify-center gap-2.5 text-base font-bold"
          >
            <UserRound className="w-5 h-5" />
            <span>สร้างตัวละคร (Character Creation)</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClick(onOpenSettings)}
              className="wood-btn rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Settings className="w-4 h-4" />
              <span>ตั้งค่า</span>
            </button>
            <button
              onClick={handleClick(onOpenPatchNotes)}
              className="wood-btn rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-bold"
            >
              <ScrollText className="w-4 h-4" />
              <span>Patch Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
