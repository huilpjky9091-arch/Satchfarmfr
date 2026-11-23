import React, { useState } from 'react';
import { Coins, X } from 'lucide-react';
import { ANIMALS } from '../data/animals';
import { CROPS } from '../data/crops';
import { ALL_ITEMS, ITEM_BY_ID } from '../data/items';
import { AudioSystem } from '../game/systems/AudioSystem';
import { GameState } from '../game/systems/GameStateStore';

interface ShopModalProps {
  initialTab: 'seeds' | 'tools' | 'animals' | 'general';
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ initialTab, onClose }) => {
  const [tab, setTab] = useState<'seeds' | 'tools' | 'animals' | 'general'>(initialTab);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const season = GameState.worldTime.season;
  const seedItems = CROPS.filter((c) => c.seasons.includes(season)).map((c) => ITEM_BY_ID[c.seedId]);
  const gearItems = ALL_ITEMS.filter(
    (i) =>
      i.buyPrice &&
      (i.category === 'weapon' ||
        i.category === 'armor' ||
        i.category === 'consumable' ||
        i.category === 'craftable' ||
        i.category === 'gift')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div className="wood-panel w-full max-w-2xl max-h-[88vh] rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-2.5">
          <div>
            <h3 className="font-pixel text-sm text-wood-800">TOWN MARKET</h3>
            <p className="text-xs text-wood-700">ฤดูปัจจุบัน: {season} • เงินของคุณ: {GameState.stats.gold.toLocaleString()} G</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-wood-800 px-3 py-1 text-xs font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5" /> {GameState.stats.gold.toLocaleString()} G
            </span>
            <button onClick={onClose} className="wood-btn rounded-lg p-1.5" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shop Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              ['seeds', '🌱 เมล็ดพันธุ์'],
              ['tools', '⚔️ อาวุธ/ของใช้'],
              ['animals', '🐄 สัตว์เลี้ยง'],
              ['general', '💰 ขายของ'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                AudioSystem.playClick();
                setTab(id);
              }}
              className={`rounded-lg py-2 text-xs font-bold border-2 ${
                tab === id ? 'bg-meadow-500 text-white border-wood-900' : 'bg-wood-50 text-wood-800 border-wood-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {tab === 'seeds' &&
            seedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-wood-50 border-2 border-wood-300 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-wood-900">{item.nameTh}</div>
                    <div className="text-xs text-wood-700">{item.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      GameState.buyItem(item.id, 1);
                      refresh();
                    }}
                    className="wood-btn-primary rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  >
                    ซื้อ 1 ({item.buyPrice}G)
                  </button>
                  <button
                    onClick={() => {
                      GameState.buyItem(item.id, 5);
                      refresh();
                    }}
                    className="wood-btn rounded-lg px-2 py-1.5 text-xs font-bold"
                  >
                    x5
                  </button>
                </div>
              </div>
            ))}

          {tab === 'tools' &&
            gearItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-wood-50 border-2 border-wood-300 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-wood-900">{item.nameTh}</div>
                    <div className="text-xs text-wood-700">{item.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    GameState.buyItem(item.id, 1);
                    refresh();
                  }}
                  className="wood-btn-primary rounded-lg px-3 py-1.5 text-xs font-bold shrink-0"
                >
                  ซื้อ {item.buyPrice} G
                </button>
              </div>
            ))}

          {tab === 'animals' &&
            ANIMALS.map((a) => (
              <div key={a.species} className="flex items-center justify-between gap-2 rounded-xl bg-wood-50 border-2 border-wood-300 p-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border-2 border-wood-600" style={{ backgroundColor: a.color }} />
                  <div>
                    <div className="text-sm font-bold text-wood-900">{a.nameTh} ({a.name})</div>
                    <div className="text-xs text-wood-700">ผลผลิต: {a.produceNameTh} • โตใน {a.daysToMature} วัน</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    GameState.buyAnimal(a.species);
                    refresh();
                  }}
                  className="wood-btn-primary rounded-lg px-3 py-1.5 text-xs font-bold shrink-0"
                >
                  ซื้อ {a.buyPrice} G
                </button>
              </div>
            ))}

          {tab === 'general' && (
            <div className="space-y-2">
              {GameState.inventory.map((slot, idx) => {
                if (!slot) return null;
                const def = ITEM_BY_ID[slot.itemId];
                if (!def || def.sellPrice <= 0) return null;
                return (
                  <div key={`${slot.itemId}_${idx}`} className="flex items-center justify-between gap-2 rounded-xl bg-wood-50 border-2 border-wood-300 p-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{def.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-wood-900">
                          {def.nameTh} <span className="text-wood-600">x{slot.quantity}</span>
                        </div>
                        <div className="text-xs text-wood-700">ราคารับซื้อชิ้นละ {def.sellPrice} G</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          GameState.sellItem(idx, false);
                          refresh();
                        }}
                        className="wood-btn rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      >
                        ขาย 1
                      </button>
                      {slot.quantity > 1 && (
                        <button
                          onClick={() => {
                            GameState.sellItem(idx, true);
                            refresh();
                          }}
                          className="wood-btn-primary rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        >
                          ขายทั้งหมด (+{def.sellPrice * slot.quantity}G)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {GameState.inventory.every((s) => !s || (ITEM_BY_ID[s.itemId]?.sellPrice ?? 0) <= 0) && (
                <div className="text-center py-8 text-sm text-wood-700">
                  ยังไม่มีผลผลิต ปลา หรือแร่สำหรับขายในกระเป๋า
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
