import React, { useMemo, useState } from 'react';
import { Gift, Heart, Sparkles, X } from 'lucide-react';
import { ITEM_BY_ID } from '../data/items';
import { NPC_BY_ID } from '../data/npcs';
import { renderCharacterPreviewDataUrl } from '../game/assets/PixelArtGenerator';
import { AudioSystem } from '../game/systems/AudioSystem';
import { GameState } from '../game/systems/GameStateStore';

interface NpcDialogModalProps {
  npcId: string;
  onClose: () => void;
}

export const NpcDialogModal: React.FC<NpcDialogModalProps> = ({ npcId, onClose }) => {
  const npc = NPC_BY_ID[npcId];
  const initialTalk = useMemo(() => GameState.talkToNpc(npcId), [npcId]);
  const [message, setMessage] = useState(initialTalk.dialogue);
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  if (!npc) return null;

  const rel = GameState.relationships[npcId];
  const hearts = Math.floor((rel?.points ?? 0) / 100);
  const portraitUrl = renderCharacterPreviewDataUrl(npc.appearance);

  const giftableSlots = GameState.inventory
    .map((slot, idx) => ({ slot, idx, def: slot ? ITEM_BY_ID[slot.itemId] : undefined }))
    .filter((x) => x.slot && x.def && x.def.category !== 'tool' && x.def.category !== 'weapon' && x.def.category !== 'armor');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-3 sm:p-5">
      <div className="wood-panel w-full max-w-xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-20 rounded-xl bg-meadow-600/30 border-3 border-wood-700 flex items-center justify-center shrink-0">
              <img
                src={portraitUrl}
                alt={npc.name}
                className="w-12 h-16 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-wood-900">{npc.name}</h3>
                {rel?.married && (
                  <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold">
                    💍 คู่ชีวิต
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-wood-700">{npc.role}</div>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < hearts ? 'text-rose-500 fill-rose-500' : 'text-wood-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="wood-btn rounded-lg p-1.5" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {initialTalk.heartEvent && (
          <div className="rounded-xl bg-amber-100 border-2 border-amber-500 p-3 text-xs text-wood-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
              <Sparkles className="w-4 h-4" /> Heart Event: {initialTalk.heartEvent.title}
            </div>
            <p>{initialTalk.heartEvent.text}</p>
          </div>
        )}

        <div className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3.5 text-sm text-wood-900 leading-relaxed min-h-[4.5rem]">
          {message}
        </div>

        {showGiftPicker && (
          <div className="rounded-xl bg-wood-100 border-2 border-wood-400 p-3 max-h-40 overflow-y-auto">
            <div className="text-xs font-bold text-wood-800 mb-2">เลือกไอเทมมอบเป็นของขวัญ:</div>
            <div className="flex flex-wrap gap-1.5">
              {giftableSlots.map(({ slot, def }) => (
                <button
                  key={slot!.itemId}
                  onClick={() => {
                    const reply = GameState.giveGiftToNpc(npcId, slot!.itemId);
                    setMessage(reply);
                    setShowGiftPicker(false);
                  }}
                  className="wood-btn rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1"
                >
                  <span>{def!.icon}</span>
                  <span>{def!.nameTh}</span>
                  <span className="text-wood-700">({slot!.quantity})</span>
                </button>
              ))}
              {giftableSlots.length === 0 && (
                <span className="text-xs text-wood-700">ไม่มีไอเทมสำหรับมอบเป็นของขวัญในกระเป๋า</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              AudioSystem.playClick();
              setShowGiftPicker((v) => !v);
            }}
            className="wood-btn rounded-xl px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4" />
            <span>มอบของขวัญ / ขอแต่งงาน</span>
          </button>
          <button
            onClick={() => {
              AudioSystem.playClick();
              onClose();
            }}
            className="wood-btn-primary rounded-xl px-5 py-2 text-xs sm:text-sm font-bold"
          >
            ปิดบทสนทนา
          </button>
        </div>
      </div>
    </div>
  );
};
