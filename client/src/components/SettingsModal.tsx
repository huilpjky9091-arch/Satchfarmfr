import React from 'react';
import { Volume2, Clock, Gamepad2, X } from 'lucide-react';
import type { GameSettings } from '@shared/index';
import { AudioSystem } from '../game/systems/AudioSystem';

interface SettingsModalProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onChange, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="wood-panel w-full max-w-md rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-2.5">
          <h3 className="font-pixel text-sm text-wood-800">ตั้งค่าเกม (Settings)</h3>
          <button
            onClick={() => {
              AudioSystem.playClick();
              onClose();
            }}
            className="wood-btn rounded-lg p-1.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-wood-800">
            <Volume2 className="w-4 h-4 text-wood-600" />
            <span>ระบบเสียง</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-wood-700 mb-1">
              <span>เสียงประกอบ (SFX)</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onChange({ ...settings, sfxVolume: v });
                AudioSystem.setVolumes(settings.musicVolume, v);
              }}
              className="w-full accent-meadow-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-wood-700 mb-1">
              <span>เสียงเพลง (Music)</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onChange({ ...settings, musicVolume: v });
                AudioSystem.setVolumes(v, settings.sfxVolume);
              }}
              className="w-full accent-meadow-600"
            />
          </div>
        </div>

        {/* Time Scale */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-wood-800">
            <Clock className="w-4 h-4 text-wood-600" />
            <span>ความเร็วเวลาในเกม</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '1x ปกติ (~16น./วัน)', value: 1 },
              { label: '2x เร็วขึ้น', value: 2 },
              { label: '5x ทดสอบกลางวัน/คืน', value: 5 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  AudioSystem.playClick();
                  onChange({ ...settings, timeScale: opt.value });
                }}
                className={`rounded-lg px-2 py-2 text-xs font-bold border-2 ${
                  settings.timeScale === opt.value
                    ? 'bg-meadow-500 text-white border-wood-800'
                    : 'bg-wood-50 text-wood-800 border-wood-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-wood-800">
            <Gamepad2 className="w-4 h-4 text-wood-600" />
            <span>ปุ่มควบคุมบนหน้าจอ (Mobile D-Pad)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { label: 'อัตโนมัติ', value: 'auto' },
                { label: 'แสดงตลอด', value: 'always' },
                { label: 'ซ่อน', value: 'hidden' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  AudioSystem.playClick();
                  onChange({ ...settings, showMobileControls: opt.value });
                }}
                className={`rounded-lg px-2 py-2 text-xs font-bold border-2 ${
                  settings.showMobileControls === opt.value
                    ? 'bg-meadow-500 text-white border-wood-800'
                    : 'bg-wood-50 text-wood-800 border-wood-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            AudioSystem.playClick();
            onClose();
          }}
          className="wood-btn-primary w-full rounded-xl py-2.5 text-sm font-bold mt-1"
        >
          บันทึกและปิด
        </button>
      </div>
    </div>
  );
};
