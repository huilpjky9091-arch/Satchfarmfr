import React from 'react';
import { ArrowLeft, Dices, Play } from 'lucide-react';
import type { CharacterAppearance } from '@shared/index';
import {
  HAIR_COLORS,
  HAIR_STYLES,
  PANTS_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
} from '../data/characterOptions';
import { renderCharacterPreviewDataUrl } from '../game/assets/PixelArtGenerator';
import { AudioSystem } from '../game/systems/AudioSystem';

interface CharacterCreatorProps {
  appearance: CharacterAppearance;
  onChange: (next: CharacterAppearance) => void;
  onBack: () => void;
  onConfirmPlay: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  appearance,
  onChange,
  onBack,
  onConfirmPlay,
}) => {
  const previewUrl = React.useMemo(() => renderCharacterPreviewDataUrl(appearance), [appearance]);

  const randomize = () => {
    AudioSystem.playClick();
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    onChange({
      ...appearance,
      skinColor: pick(SKIN_TONES).value,
      hairStyle: pick(HAIR_STYLES).value,
      hairColor: pick(HAIR_COLORS).value,
      shirtColor: pick(SHIRT_COLORS).value,
      pantsColor: pick(PANTS_COLORS).value,
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#4c8f52] to-[#2b4d2e] p-3 sm:p-6 overflow-y-auto">
      <div className="wood-panel w-full max-w-2xl rounded-2xl p-4 sm:p-6 flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-3">
          <button
            onClick={() => {
              AudioSystem.playClick();
              onBack();
            }}
            className="wood-btn rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับ</span>
          </button>
          <h2 className="font-pixel text-sm sm:text-base text-wood-800">สร้างตัวละคร</h2>
          <button
            onClick={randomize}
            className="wood-btn rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold"
          >
            <Dices className="w-4 h-4" />
            <span>สุ่ม</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Live Sprite Preview & Name Inputs */}
          <div className="md:col-span-5 flex flex-col items-center gap-3">
            <div className="w-40 h-44 rounded-xl bg-gradient-to-b from-[#89c973] to-[#5e9e49] border-4 border-wood-700 shadow-inner flex flex-col items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Character Preview"
                className="w-24 h-36 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="w-full space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-wood-800 mb-1">ชื่อผู้เล่น</label>
                <input
                  type="text"
                  maxLength={16}
                  value={appearance.name}
                  onChange={(e) => onChange({ ...appearance, name: e.target.value })}
                  placeholder="Arin"
                  className="w-full rounded-lg border-2 border-wood-600 bg-wood-50 px-3 py-1.5 text-sm font-semibold text-wood-900 focus:outline-none focus:border-meadow-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wood-800 mb-1">ชื่อฟาร์ม</label>
                <input
                  type="text"
                  maxLength={18}
                  value={appearance.farmName}
                  onChange={(e) => onChange({ ...appearance, farmName: e.target.value })}
                  placeholder="Willowbrook"
                  className="w-full rounded-lg border-2 border-wood-600 bg-wood-50 px-3 py-1.5 text-sm font-semibold text-wood-900 focus:outline-none focus:border-meadow-600"
                />
              </div>
            </div>
          </div>

          {/* Right: Appearance Pickers */}
          <div className="md:col-span-7 flex flex-col gap-3.5">
            {/* Hair Style */}
            <div>
              <label className="block text-xs font-bold text-wood-800 mb-1.5">ทรงผม</label>
              <div className="grid grid-cols-4 gap-2">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      AudioSystem.playClick();
                      onChange({ ...appearance, hairStyle: style.value });
                    }}
                    className={`rounded-lg py-1.5 text-xs font-bold border-2 transition ${
                      appearance.hairStyle === style.value
                        ? 'bg-meadow-500 text-white border-wood-800 shadow-pixel-sm'
                        : 'bg-wood-50 text-wood-800 border-wood-400 hover:bg-wood-100'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <ColorRow
              label="สีผิว"
              options={SKIN_TONES}
              selected={appearance.skinColor}
              onSelect={(v) => onChange({ ...appearance, skinColor: v })}
            />

            {/* Hair Color */}
            <ColorRow
              label="สีผม"
              options={HAIR_COLORS}
              selected={appearance.hairColor}
              onSelect={(v) => onChange({ ...appearance, hairColor: v })}
            />

            {/* Shirt Color */}
            <ColorRow
              label="สีเสื้อ"
              options={SHIRT_COLORS}
              selected={appearance.shirtColor}
              onSelect={(v) => onChange({ ...appearance, shirtColor: v })}
            />

            {/* Pants Color */}
            <ColorRow
              label="สีกางเกง"
              options={PANTS_COLORS}
              selected={appearance.pantsColor}
              onSelect={(v) => onChange({ ...appearance, pantsColor: v })}
            />
          </div>
        </div>

        <div className="pt-2 border-t-2 border-wood-400/50 flex justify-end">
          <button
            onClick={() => {
              AudioSystem.playClick();
              onConfirmPlay();
            }}
            className="wood-btn-primary rounded-xl px-6 py-3 flex items-center gap-2 text-base font-bold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>เริ่มออกเดินทางใน Evergreen Valley</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ColorRowProps {
  label: string;
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({ label, options, selected, onSelect }) => (
  <div>
    <label className="block text-xs font-bold text-wood-800 mb-1.5">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          title={opt.label}
          onClick={() => {
            AudioSystem.playClick();
            onSelect(opt.value);
          }}
          className={`w-8 h-8 rounded-lg border-2 transition-transform ${
            selected === opt.value
              ? 'border-wood-900 scale-110 ring-2 ring-amber-400'
              : 'border-wood-600/70 hover:scale-105'
          }`}
          style={{ backgroundColor: opt.value }}
        />
      ))}
    </div>
  </div>
);
