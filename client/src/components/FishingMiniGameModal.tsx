import React, { useEffect, useRef, useState } from 'react';
import { Fish } from 'lucide-react';
import type { FishDefinition } from '@shared/index';
import { AudioSystem } from '../game/systems/AudioSystem';
import { GameState } from '../game/systems/GameStateStore';

interface FishingMiniGameModalProps {
  fish: FishDefinition;
  onFinish: (success: boolean) => void;
}

export const FishingMiniGameModal: React.FC<FishingMiniGameModalProps> = ({ fish, onFinish }) => {
  const [barPos, setBarPos] = useState(50); // 0..100
  const [fishPos, setFishPos] = useState(50);
  const [progress, setProgress] = useState(32); // 0..100
  const holdingRef = useRef(false);
  const finishedRef = useRef(false);

  const barSize = Math.max(18, 34 - fish.difficulty * 1.4);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        holdingRef.current = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'ArrowUp' || e.key === 'w') {
        holdingRef.current = false;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    let bar = 50;
    let barVel = 0;
    let fPos = 50;
    let fTarget = 50;
    let prog = 32;
    let tick = 0;

    const timer = window.setInterval(() => {
      if (finishedRef.current) return;
      tick += 1;

      // Move fish smoothly toward random targets scaled by difficulty
      if (tick % Math.max(14, 34 - fish.difficulty * 2) === 0) {
        fTarget = 10 + Math.random() * 80;
      }
      const fSpeed = 0.7 + fish.difficulty * 0.28;
      if (fPos < fTarget) fPos = Math.min(fTarget, fPos + fSpeed);
      else fPos = Math.max(fTarget, fPos - fSpeed);

      // Bar physics (hold to rise, release to sink)
      barVel += holdingRef.current ? 0.55 : -0.45;
      barVel = Math.max(-3.6, Math.min(3.6, barVel * 0.92));
      bar = Math.max(barSize / 2, Math.min(100 - barSize / 2, bar + barVel));

      const overlapping = Math.abs(bar - fPos) <= barSize / 2 + 4;
      prog = Math.max(0, Math.min(100, prog + (overlapping ? 1.35 : -0.85)));

      setBarPos(bar);
      setFishPos(fPos);
      setProgress(prog);

      if (prog >= 100) {
        finishedRef.current = true;
        window.clearInterval(timer);
        AudioSystem.playLevelUp();
        GameState.addItem(fish.id, 1);
        GameState.addSkillExp('fishing', 14 + fish.difficulty * 4);
        GameState.recordQuestObjective('fish', 1);
        GameState.toast(`🎣 จับได้ ${fish.nameTh} (${fish.rarity})! ขายได้ ${fish.sellPrice} G`, 'success');
        onFinish(true);
      } else if (prog <= 0) {
        finishedRef.current = true;
        window.clearInterval(timer);
        AudioSystem.playHit();
        GameState.toast(`ปลา ${fish.nameTh} หลุดไปเสียแล้ว! ลองใหม่อีกครั้ง`, 'warning');
        onFinish(false);
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [fish, barSize, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="wood-panel w-full max-w-sm rounded-2xl p-5 flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-sky-700 text-white px-3 py-0.5 rounded-full mb-1">
            <Fish className="w-3.5 h-3.5" />
            <span>มินิเกมตกปลา • {fish.rarity}</span>
          </div>
          <h3 className="text-base font-bold text-wood-900">ปลากำลังติดเบ็ด!</h3>
          <p className="text-xs text-wood-700">กดค้าง [Space] หรือกดปุ่มด้านล่างเพื่อให้แถบสีเขียวทับตัวปลา</p>
        </div>

        {/* Horizontal Catch Track */}
        <div className="w-full space-y-3">
          <div className="relative w-full h-12 rounded-xl bg-sky-900 border-3 border-wood-800 overflow-hidden">
            {/* Green Catch Zone */}
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-emerald-400/75 border-2 border-emerald-200 transition-none"
              style={{
                left: `${barPos - barSize / 2}%`,
                width: `${barSize}%`,
              }}
            />
            {/* Swimming Fish Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white"
              style={{ left: `${fishPos}%`, backgroundColor: fish.color }}
            >
              <span className="text-sm">🐟</span>
            </div>
          </div>

          {/* Catch Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-wood-800 mb-1">
              <span>ความคืบหน้าการดึงปลา</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-wood-900 overflow-hidden border-2 border-wood-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onPointerDown={() => {
            holdingRef.current = true;
          }}
          onPointerUp={() => {
            holdingRef.current = false;
          }}
          onPointerLeave={() => {
            holdingRef.current = false;
          }}
          className="wood-btn-primary w-full rounded-xl py-3.5 text-base font-bold select-none"
        >
          กดค้างเพื่อดึงเบ็ด (Hold to Reel)
        </button>
      </div>
    </div>
  );
};
