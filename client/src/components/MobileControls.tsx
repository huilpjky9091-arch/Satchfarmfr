import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Hand, Zap } from 'lucide-react';
import { EventBus } from '../game/systems/EventBus';

interface MobileControlsProps {
  canInteract: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ canInteract }) => {
  const dirsRef = useRef({ up: false, down: false, left: false, right: false });
  const [sprinting, setSprinting] = useState(false);
  const sprintRef = useRef(false);

  const emit = () => {
    const d = dirsRef.current;
    const dx = (d.right ? 1 : 0) - (d.left ? 1 : 0);
    const dy = (d.down ? 1 : 0) - (d.up ? 1 : 0);
    EventBus.emit('input:mobile', { dx, dy, sprinting: sprintRef.current });
  };

  const setDir = (dir: keyof typeof dirsRef.current, active: boolean) => {
    dirsRef.current[dir] = active;
    emit();
  };

  const toggleSprint = (active: boolean) => {
    sprintRef.current = active;
    setSprinting(active);
    emit();
  };

  const bindBtn = (dir: keyof typeof dirsRef.current) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDir(dir, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      setDir(dir, false);
    },
    onPointerCancel: () => setDir(dir, false),
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex items-end justify-between px-4 sm:px-6">
      {/* Virtual D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1.5 w-36 h-36">
        <div />
        <button
          {...bindBtn('up')}
          aria-label="Move Up"
          className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:opacity-100 active:scale-95"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          {...bindBtn('left')}
          aria-label="Move Left"
          className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:opacity-100 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="rounded-xl bg-wood-900/40" />
        <button
          {...bindBtn('right')}
          aria-label="Move Right"
          className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:opacity-100 active:scale-95"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div />
        <button
          {...bindBtn('down')}
          aria-label="Move Down"
          className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:opacity-100 active:scale-95"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action Buttons (Sprint + Interact) */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            toggleSprint(true);
          }}
          onPointerUp={() => toggleSprint(false)}
          onPointerCancel={() => toggleSprint(false)}
          className={`w-14 h-14 rounded-full border-3 flex flex-col items-center justify-center text-[10px] font-bold shadow-pixel ${
            sprinting
              ? 'bg-amber-400 border-wood-900 text-wood-900 scale-95'
              : 'wood-panel-dark opacity-90'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>วิ่ง</span>
        </button>

        <button
          onClick={() => EventBus.emit('interact:trigger')}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs font-bold shadow-pixel transition ${
            canInteract
              ? 'wood-btn-primary scale-105'
              : 'wood-panel-dark opacity-70'
          }`}
        >
          <Hand className="w-6 h-6" />
          <span>สำรวจ</span>
        </button>
      </div>
    </div>
  );
};
