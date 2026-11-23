import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { GameState } from '../game/systems/GameStateStore';

interface CommunityModalProps {
  onClose: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({ onClose }) => {
  const [, setTick] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="wood-panel w-full max-w-md rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-2">
          <h3 className="font-pixel text-sm text-wood-800">COMMUNITY CENTER</h3>
          <button onClick={onClose} className="wood-btn rounded-lg p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-wood-800 leading-relaxed">
          ร่วมบริจาคทุนและทรัพยากรเพื่อฟื้นฟู Community Center ให้ครบ 2 ขั้น เพื่อปลดล็อกพื้นที่ลับ{' '}
          <strong>Whispering Sanctuary</strong> ในป่า Enchanted Forest!
        </p>

        <div className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-wood-700">ความคืบหน้าการบูรณะ</div>
            <div className="text-lg font-bold text-meadow-600">
              {GameState.communityBundlesCompleted} / 2 ขั้น
            </div>
          </div>
          {GameState.unlockedSecret ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> ปลดล็อกวิหารลับแล้ว!
            </span>
          ) : (
            <button
              onClick={() => {
                GameState.contributeCommunityBundle();
                setTick((t) => t + 1);
              }}
              className="wood-btn-primary rounded-xl px-4 py-2 text-xs font-bold"
            >
              บริจาค 250 G
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
