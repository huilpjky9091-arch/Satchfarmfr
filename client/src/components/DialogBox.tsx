import React, { useEffect, useState } from 'react';
import type { InteractableInfo } from '@shared/index';
import { AudioSystem } from '../game/systems/AudioSystem';

interface DialogBoxProps {
  dialog: InteractableInfo;
  onClose: () => void;
}

export const DialogBox: React.FC<DialogBoxProps> = ({ dialog, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    setLineIndex(0);
  }, [dialog.id]);

  const advance = React.useCallback(() => {
    AudioSystem.playClick();
    if (lineIndex + 1 < dialog.lines.length) {
      setLineIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [lineIndex, dialog.lines.length, onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, onClose]);

  const isLast = lineIndex + 1 >= dialog.lines.length;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-3 pointer-events-auto">
      <div
        onClick={advance}
        className="wood-panel w-full max-w-xl rounded-2xl p-4 sm:p-5 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block rounded-lg bg-wood-700 text-wood-50 px-3 py-0.5 text-xs sm:text-sm font-bold">
            {dialog.title}
          </span>
          <span className="text-xs font-semibold text-wood-700">
            {lineIndex + 1} / {dialog.lines.length}
          </span>
        </div>

        <p className="text-sm sm:text-base font-medium text-wood-900 leading-relaxed min-h-[3.2rem]">
          {dialog.lines[lineIndex]}
        </p>

        <div className="flex justify-end mt-2">
          <span className="text-xs font-bold text-wood-700 animate-pulse">
            {isLast ? 'กด [E] หรือแตะเพื่อปิด ▾' : 'กด [E] หรือแตะเพื่ออ่านต่อ ▸'}
          </span>
        </div>
      </div>
    </div>
  );
};
