import React, { useRef, useState } from 'react';
import { Hand, Pickaxe, Zap } from 'lucide-react';
import { EventBus } from '../game/systems/EventBus';

interface MobileControlsProps {
  canInteract: boolean;
}

const MAX_RADIUS = 44;
const DEADZONE = 0.14;

export const MobileControls: React.FC<MobileControlsProps> = ({ canInteract }) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const sprintRef = useRef(false);
  const vecRef = useRef({ dx: 0, dy: 0 });

  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [sprintLocked, setSprintLocked] = useState(false);

  const emitInput = () => {
    EventBus.emit('input:mobile', {
      dx: vecRef.current.dx,
      dy: vecRef.current.dy,
      sprinting: sprintRef.current,
    });
  };

  const updateStickFromClient = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let rx = clientX - cx;
    let ry = clientY - cy;
    const dist = Math.hypot(rx, ry);

    if (dist > MAX_RADIUS) {
      rx = (rx / dist) * MAX_RADIUS;
      ry = (ry / dist) * MAX_RADIUS;
    }

    setKnobOffset({ x: rx, y: ry });

    const norm = Math.min(1, dist / MAX_RADIUS);
    if (norm < DEADZONE) {
      vecRef.current = { dx: 0, dy: 0 };
    } else {
      const scaled = (norm - DEADZONE) / (1 - DEADZONE);
      vecRef.current = {
        dx: (rx / Math.max(1, dist)) * scaled,
        dy: (ry / Math.max(1, dist)) * scaled,
      };
    }
    emitInput();
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setActive(false);
    setKnobOffset({ x: 0, y: 0 });
    vecRef.current = { dx: 0, dy: 0 };
    emitInput();
  };

  const handleStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(true);
    updateStickFromClient(e.clientX, e.clientY);
  };

  const handleStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateStickFromClient(e.clientX, e.clientY);
  };

  const handleStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    resetStick();
  };

  const toggleSprint = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !sprintRef.current;
    sprintRef.current = next;
    setSprintLocked(next);
    emitInput();
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex items-end justify-between px-4 sm:px-7"
      style={{ touchAction: 'none' }}
    >
      {/* 360° Smooth Analog Thumbstick */}
      <div
        ref={padRef}
        onPointerDown={handleStickDown}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickUp}
        onPointerCancel={handleStickUp}
        style={{ touchAction: 'none' }}
        aria-label="Virtual Analog Joystick"
        className={`pointer-events-auto relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex items-center justify-center transition-colors ${
          active
            ? 'bg-wood-900/65 border-amber-300/90'
            : 'bg-wood-900/45 border-wood-300/60'
        } backdrop-blur-[2px] shadow-pixel`}
      >
        {/* Subtle cardinal direction ticks */}
        <div className="pointer-events-none absolute top-2.5 w-1.5 h-1.5 rounded-full bg-wood-200/60" />
        <div className="pointer-events-none absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-wood-200/60" />
        <div className="pointer-events-none absolute left-2.5 w-1.5 h-1.5 rounded-full bg-wood-200/60" />
        <div className="pointer-events-none absolute right-2.5 w-1.5 h-1.5 rounded-full bg-wood-200/60" />

        {/* Movable Thumb Knob */}
        <div
          className={`pointer-events-none w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 shadow-lg flex items-center justify-center ${
            active
              ? 'bg-gradient-to-b from-amber-200 to-amber-400 border-wood-900'
              : 'bg-gradient-to-b from-wood-200 to-wood-400 border-wood-800 opacity-90'
          }`}
          style={{
            transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Action Buttons: Toggle Sprint + Use Tool + Interact */}
      <div className="pointer-events-auto flex items-center gap-2.5" style={{ touchAction: 'none' }}>
        <button
          onPointerDown={toggleSprint}
          style={{ touchAction: 'none' }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex flex-col items-center justify-center text-[10px] font-bold shadow-pixel transition ${
            sprintLocked
              ? 'bg-amber-400 border-wood-900 text-wood-900 scale-95 ring-2 ring-amber-200'
              : 'wood-panel-dark opacity-90'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>{sprintLocked ? 'วิ่ง: เปิด' : 'วิ่ง'}</span>
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            EventBus.emit('action:use_tool');
          }}
          style={{ touchAction: 'none' }}
          className="wood-btn-primary w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex flex-col items-center justify-center text-[11px] font-bold shadow-pixel"
        >
          <Pickaxe className="w-6 h-6" />
          <span>ใช้/ตี</span>
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            EventBus.emit('interact:trigger');
          }}
          style={{ touchAction: 'none' }}
          className={`w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex flex-col items-center justify-center text-[11px] font-bold shadow-pixel transition ${
            canInteract ? 'wood-btn scale-105 ring-2 ring-amber-200' : 'wood-panel-dark opacity-75'
          }`}
        >
          <Hand className="w-6 h-6" />
          <span>สำรวจ</span>
        </button>
      </div>
    </div>
  );
};
