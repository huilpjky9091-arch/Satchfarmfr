import React from 'react';
import { CheckCircle2, Clock3, X } from 'lucide-react';
import { GAME_VERSION, PATCH_NOTES } from '../data/version';
import { AudioSystem } from '../game/systems/AudioSystem';

interface PatchNotesModalProps {
  onClose: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="wood-panel w-full max-w-xl max-h-[85vh] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-2.5">
          <div>
            <h3 className="font-pixel text-sm text-wood-800">PATCH NOTES &amp; ROADMAP</h3>
            <p className="text-xs text-wood-700 mt-0.5">Current Build: v{GAME_VERSION}</p>
          </div>
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

        <div className="overflow-y-auto space-y-3 pr-1">
          {PATCH_NOTES.map((note) => (
            <div
              key={note.version}
              className={`rounded-xl border-2 p-3.5 ${
                note.status === 'implemented'
                  ? 'bg-wood-50 border-meadow-600'
                  : 'bg-wood-100/70 border-wood-400/70 opacity-85'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[11px] bg-wood-700 text-wood-50 px-2 py-0.5 rounded">
                    v{note.version}
                  </span>
                  <span className="text-xs font-bold text-wood-700">{note.phase}</span>
                </div>
                {note.status === 'implemented' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-meadow-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมเล่นแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-wood-600">
                    <Clock3 className="w-3.5 h-3.5" /> แผนพัฒนาถัดไป
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-wood-900 mb-1.5">{note.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-wood-800">
                {note.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
