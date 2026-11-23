import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Hand, Pickaxe, Zap } from 'lucide-react';
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
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex items-end justify-between px-3 sm:px-5">
      {/* Virtual D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32">
        <div />
        <button {...bindBtn('up')} aria-label="Up" className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:scale-95">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button {...bindBtn('left')} aria-label="Left" className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="rounded-xl bg-wood-900/35" />
        <button {...bindBtn('right')} aria-label="Right" className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:scale-95">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div />
        <button {...bindBtn('down')} aria-label="Down" className="wood-panel-dark rounded-xl flex items-center justify-center opacity-85 active:scale-95">
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action Buttons: Sprint + Use Tool + Interact */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            toggleSprint(true);
          }}
          onPointerUp={() => toggleSprint(false)}
          onPointerCancel={() => toggleSprint(false)}
          className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-[9px] font-bold shadow-pixel ${
            sprinting ? 'bg-amber-400 border-wood-900 text-wood-900' : 'wood-panel-dark opacity-90'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>วิ่ง</span>
        </button>

        <button
          onClick={() => EventBus.emit('action:use_tool')}
          className="wood-btn-primary w-14 h-14 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shadow-pixel"
        >
          <Pickaxe className="w-5 h-5" />
          <span>ใช้/ตี</span>
        </button>

        <button
          onClick={() => EventBus.emit('interact:trigger')}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shadow-pixel transition ${
            canInteract ? 'wood-btn scale-105' : 'wood-panel-dark opacity-75'
          }`}
        >
          <Hand className="w-5 h-5" />
          <span>สำรวจ</span>
        </button>
      </div>
    </div>
  );
};
