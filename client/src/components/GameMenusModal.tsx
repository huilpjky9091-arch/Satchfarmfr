import React, { useEffect, useState } from 'react';
import {
  Backpack,
  CheckCircle2,
  Compass,
  Download,
  Hammer,
  Heart,
  Lock,
  Save,
  ScrollText,
  Send,
  Upload,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import type { SaveGameData, SkillType, ZoneId } from '@shared/index';
import { CRAFTING_RECIPES, ITEM_BY_ID } from '../data/items';
import { ZONE_LIST } from '../data/maps';
import { NPCS } from '../data/npcs';
import { QUESTS } from '../data/quests';
import { renderCharacterPreviewDataUrl } from '../game/assets/PixelArtGenerator';
import { AudioSystem } from '../game/systems/AudioSystem';
import { EventBus } from '../game/systems/EventBus';
import { GameState } from '../game/systems/GameStateStore';
import { MultiplayerClient } from '../game/systems/MultiplayerClient';
import { SaveSystem } from '../game/systems/SaveSystem';

export type MenuTab = 'bag' | 'craft' | 'quests' | 'social' | 'map' | 'save' | 'mp';

interface GameMenusModalProps {
  initialTab: MenuTab;
  inGame: boolean;
  onLoadSave?: (save: SaveGameData) => void;
  onClose: () => void;
}

export const GameMenusModal: React.FC<GameMenusModalProps> = ({
  initialTab,
  inGame,
  onLoadSave,
  onClose,
}) => {
  const [tab, setTab] = useState<MenuTab>(initialTab);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // Multiplayer form state
  const [mpState, setMpState] = useState(MultiplayerClient.getState());
  const [serverUrlInput, setServerUrlInput] = useState(mpState.serverUrl);
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [mpMsg, setMpMsg] = useState('');

  useEffect(() => {
    const u1 = GameState.subscribe(refresh);
    const u2 = MultiplayerClient.subscribe(() => setMpState(MultiplayerClient.getState()));
    return () => {
      u1();
      u2();
    };
  }, []);

  const tabs: { id: MenuTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'bag', label: 'กระเป๋า & สกิล', icon: <Backpack className="w-3.5 h-3.5" />, show: inGame },
    { id: 'craft', label: 'คราฟต์', icon: <Hammer className="w-3.5 h-3.5" />, show: inGame },
    { id: 'quests', label: 'เควสต์', icon: <ScrollText className="w-3.5 h-3.5" />, show: inGame },
    { id: 'social', label: 'NPC (20)', icon: <Heart className="w-3.5 h-3.5" />, show: inGame },
    { id: 'map', label: 'แผนที่โลก', icon: <Compass className="w-3.5 h-3.5" />, show: inGame },
    { id: 'save', label: 'Save / Load', icon: <Save className="w-3.5 h-3.5" />, show: true },
    { id: 'mp', label: 'Multiplayer', icon: <Users className="w-3.5 h-3.5" />, show: true },
  ];

  const handleSlotClick = (idx: number) => {
    AudioSystem.playClick();
    if (selectedSlot === null) {
      setSelectedSlot(idx);
    } else if (selectedSlot === idx) {
      GameState.consumeItem(idx);
      setSelectedSlot(null);
    } else {
      GameState.swapSlots(selectedSlot, idx);
      setSelectedSlot(null);
    }
  };

  const handleTeleport = (zone: ZoneId, locked: boolean) => {
    if (locked) {
      GameState.toast('🔒 พื้นที่ลับล็อกอยู่! ทำเควสต์สำรวจ 5 โซนหรือบูรณะ Community Center', 'warning');
      return;
    }
    AudioSystem.playInteract();
    EventBus.emit('zone:teleport', { zone });
    onClose();
  };

  const handleExportSave = (slotId: string) => {
    const data = SaveSystem.load(slotId);
    if (!data) return;
    const blob = new Blob([SaveSystem.exportSaveJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evergreen-valley-${slotId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = SaveSystem.importSaveJson(String(reader.result ?? ''), 'slot1');
      if (imported) {
        GameState.toast('นำเข้าไฟล์เซฟลง Slot 1 สำเร็จ!', 'success');
        refresh();
      } else {
        GameState.toast('ไฟล์เซฟไม่ถูกต้อง', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const skillLabels: Record<SkillType, string> = {
    farming: '🌾 Farming (ทำฟาร์ม)',
    mining: '⛏️ Mining (ขุดแร่)',
    fishing: '🎣 Fishing (ตกปลา)',
    foraging: '🌿 Foraging (เก็บของป่า)',
    combat: '⚔️ Combat (ต่อสู้)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2.5 sm:p-4 backdrop-blur-[2px]">
      <div className="wood-panel w-full max-w-3xl max-h-[90vh] rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-wood-400/50 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    AudioSystem.playClick();
                    setTab(t.id);
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border-2 flex items-center gap-1 ${
                    tab === t.id
                      ? 'bg-meadow-500 text-white border-wood-900'
                      : 'bg-wood-50 text-wood-800 border-wood-400 hover:bg-wood-100'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
          </div>
          <button onClick={onClose} className="wood-btn rounded-lg p-1.5 shrink-0" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* 1. INVENTORY & SKILLS */}
          {tab === 'bag' && inGame && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 space-y-2">
                <div className="text-xs font-bold text-wood-800">
                  กระเป๋า (24 ช่อง • แถวบนคือ Hotbar 1–9 • คลิก 2 ช่องเพื่อสลับ หรือดับเบิลคลิกเพื่อกิน/สวมเกราะ)
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {GameState.inventory.map((slot, idx) => {
                    const def = slot ? ITEM_BY_ID[slot.itemId] : undefined;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSlotClick(idx)}
                        title={def ? `${def.nameTh}: ${def.description}` : 'ช่องว่าง'}
                        className={`relative h-14 rounded-xl border-2 flex flex-col items-center justify-center p-1 transition ${
                          selectedSlot === idx
                            ? 'bg-amber-200 border-wood-900 ring-2 ring-amber-500'
                            : idx < 9
                              ? 'bg-wood-50 border-wood-600'
                              : 'bg-wood-100/80 border-wood-400'
                        }`}
                      >
                        {idx < 9 && (
                          <span className="absolute top-0.5 left-1 text-[9px] font-bold text-wood-500">
                            {idx + 1}
                          </span>
                        )}
                        {def && (
                          <>
                            <span className="text-lg leading-none">{def.icon}</span>
                            <span className="text-[9px] font-bold text-wood-900 truncate w-full text-center mt-0.5">
                              {def.nameTh}
                            </span>
                            {slot!.quantity > 1 && (
                              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold bg-wood-800 text-wood-50 rounded px-1">
                                {slot!.quantity}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-5 space-y-2.5">
                <div className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3 text-xs space-y-1">
                  <div className="font-bold text-wood-900 text-sm">
                    {GameState.appearance.name} • LV.{GameState.stats.level}
                  </div>
                  <div className="text-wood-700">
                    ⚔️ ATK: <strong>{GameState.stats.attack}</strong> • 🛡️ DEF: <strong>{GameState.stats.defense}</strong>
                  </div>
                  <div className="text-wood-700">
                    เกราะที่สวมใส่: <strong>{GameState.equippedArmorId ? ITEM_BY_ID[GameState.equippedArmorId]?.nameTh : 'ยังไม่ได้สวมใส่'}</strong>
                  </div>
                </div>

                <div className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3 space-y-2">
                  <div className="text-xs font-bold text-wood-900">ทักษะ RPG ทั้ง 5 ด้าน</div>
                  {(Object.keys(skillLabels) as SkillType[]).map((sk) => {
                    const st = GameState.stats.skills[sk];
                    return (
                      <div key={sk}>
                        <div className="flex justify-between text-[11px] font-semibold text-wood-800">
                          <span>{skillLabels[sk]}</span>
                          <span>LV.{st.level} ({st.exp}/{st.nextLevelExp})</span>
                        </div>
                        <div className="h-2 rounded-full bg-wood-200 overflow-hidden">
                          <div
                            className="h-full bg-meadow-500"
                            style={{ width: `${Math.min(100, (st.exp / st.nextLevelExp) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. CRAFTING */}
          {tab === 'craft' && inGame && (
            <div className="space-y-2">
              {CRAFTING_RECIPES.map((rec) => {
                const canCraft = rec.ingredients.every((i) => GameState.countItem(i.itemId) >= i.qty);
                return (
                  <div key={rec.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-wood-50 border-2 border-wood-300 p-3">
                    <div>
                      <div className="text-sm font-bold text-wood-900">{rec.nameTh}</div>
                      <div className="text-xs text-wood-700">{rec.description}</div>
                      <div className="flex flex-wrap gap-2 mt-1 text-[11px]">
                        {rec.ingredients.map((ing) => {
                          const have = GameState.countItem(ing.itemId);
                          const def = ITEM_BY_ID[ing.itemId];
                          return (
                            <span
                              key={ing.itemId}
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                have >= ing.qty ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {def?.icon} {def?.nameTh}: {have}/{ing.qty}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      disabled={!canCraft}
                      onClick={() => GameState.craftRecipe(rec.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold ${
                        canCraft ? 'wood-btn-primary' : 'bg-wood-300 text-wood-600 cursor-not-allowed'
                      }`}
                    >
                      คราฟต์
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. QUESTS */}
          {tab === 'quests' && inGame && (
            <div className="space-y-2">
              {QUESTS.map((q) => {
                const st = GameState.quests[q.id];
                const pct = Math.min(100, Math.round(((st?.progress ?? 0) / q.targetCount) * 100));
                return (
                  <div key={q.id} className="rounded-xl bg-wood-50 border-2 border-wood-300 p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-wood-700 text-wood-50 px-2 py-0.5 text-[10px] font-bold">
                          {q.category}
                        </span>
                        <span className="text-sm font-bold text-wood-900">{q.title}</span>
                      </div>
                      <p className="text-xs text-wood-700 mt-0.5">{q.description}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-wood-200 overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-wood-800">
                          {st?.progress ?? 0}/{q.targetCount}
                        </span>
                      </div>
                      <div className="text-[11px] text-meadow-600 font-semibold mt-1">
                        รางวัล: {q.rewardGold} G • {q.rewardExp} EXP
                        {q.rewardItemId ? ` • ${ITEM_BY_ID[q.rewardItemId]?.nameTh} x${q.rewardItemQty}` : ''}
                      </div>
                    </div>
                    {st?.claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-meadow-600">
                        <CheckCircle2 className="w-4 h-4" /> รับรางวัลแล้ว
                      </span>
                    ) : st?.completed ? (
                      <button
                        onClick={() => GameState.claimQuestReward(q.id)}
                        className="wood-btn-primary rounded-xl px-3.5 py-2 text-xs font-bold"
                      >
                        รับรางวัล!
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-wood-600">กำลังดำเนินการ</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. SOCIAL (20 NPCs) */}
          {tab === 'social' && inGame && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {NPCS.map((npc) => {
                const rel = GameState.relationships[npc.id];
                const hearts = Math.floor((rel?.points ?? 0) / 100);
                return (
                  <div key={npc.id} className="rounded-xl bg-wood-50 border-2 border-wood-300 p-2.5 flex items-center gap-3">
                    <img
                      src={renderCharacterPreviewDataUrl(npc.appearance)}
                      alt={npc.name}
                      className="w-10 h-14 object-contain bg-meadow-500/20 rounded-lg border border-wood-400 p-0.5 shrink-0"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-wood-900 truncate">{npc.name}</span>
                        {rel?.married && <span className="text-[10px] font-bold text-rose-600">💍</span>}
                        {npc.romanceable && !rel?.married && (
                          <span className="text-[10px] text-rose-500 font-semibold">♥ แต่งงานได้</span>
                        )}
                      </div>
                      <div className="text-[11px] text-wood-700 truncate">{npc.role}</div>
                      <div className="text-[10px] text-wood-600">ถิ่นประจำ: {npc.homeZone}</div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Heart
                            key={i}
                            className={`w-3 h-3 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-wood-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. WORLD MAP (10 ZONES + FAST TRAVEL) */}
          {tab === 'map' && inGame && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-wood-800">
                แผนที่ Evergreen Valley ทั้ง 10 พื้นที่ — คลิกที่โซนเพื่อเดินทางด่วน (Fast Travel) หรือเดินผ่านประตูทางออกในโลกเกม
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ZONE_LIST.map((z) => {
                  const locked = z.id === 'secret' && !GameState.unlockedSecret;
                  const isHere = GameState.currentZone === z.id;
                  return (
                    <button
                      key={z.id}
                      onClick={() => handleTeleport(z.id, locked)}
                      className={`text-left rounded-xl border-2 p-3 transition ${
                        isHere
                          ? 'bg-emerald-100 border-meadow-600'
                          : locked
                            ? 'bg-wood-200/70 border-wood-400 opacity-75'
                            : 'bg-wood-50 border-wood-400 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-wood-900">
                          {locked ? '🔒 ' : ''}{z.nameTh}
                        </span>
                        {isHere ? (
                          <span className="text-[10px] font-bold bg-meadow-600 text-white px-2 py-0.5 rounded-full">
                            อยู่ที่นี่
                          </span>
                        ) : locked ? (
                          <Lock className="w-3.5 h-3.5 text-wood-600" />
                        ) : (
                          <span className="text-[11px] font-bold text-meadow-600">เดินทาง →</span>
                        )}
                      </div>
                      <p className="text-xs text-wood-700 mt-1">{z.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. SAVE / LOAD SYSTEM */}
          {tab === 'save' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-wood-800">
                  ระบบบันทึกเกม (Auto-Save + 3 Slots + Backup + Export/Import JSON)
                </span>
                <label className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>

              {SaveSystem.listSlots().map((slot) => (
                <div key={slot.slotId} className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-wood-900 uppercase">
                      {slot.slotId === 'autosave' ? '⚡ Auto-Save' : `💾 ${slot.slotId}`}
                    </div>
                    {slot.exists ? (
                      <div className="text-xs text-wood-700">
                        {slot.playerName} ({slot.farmName}) • {slot.season} Day {slot.day}, Y{slot.year} • {slot.gold} G • v{slot.gameVersion}
                      </div>
                    ) : (
                      <div className="text-xs text-wood-500">ช่องว่าง</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {inGame && slot.slotId !== 'autosave' && (
                      <button
                        onClick={() => {
                          GameState.saveToSlot(slot.slotId);
                          GameState.toast(`บันทึกเกมลง ${slot.slotId} เรียบร้อยแล้ว!`, 'success');
                          refresh();
                        }}
                        className="wood-btn-primary rounded-lg px-3 py-1.5 text-xs font-bold"
                      >
                        บันทึก
                      </button>
                    )}
                    {slot.exists && (
                      <>
                        <button
                          onClick={() => {
                            const data = SaveSystem.load(slot.slotId);
                            if (data) {
                              onLoadSave?.(data);
                              onClose();
                            }
                          }}
                          className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold"
                        >
                          โหลด
                        </button>
                        <button
                          onClick={() => handleExportSave(slot.slotId)}
                          title="Export Backup JSON"
                          className="wood-btn rounded-lg p-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7. REAL MULTIPLAYER */}
          {tab === 'mp' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-wood-50 border-2 border-wood-400 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-wood-900">
                    <Wifi className={`w-4 h-4 ${mpState.connected ? 'text-emerald-600' : 'text-wood-500'}`} />
                    <span>
                      สถานะ: {mpState.connected ? `เชื่อมต่อแล้ว (${mpState.roomCode ? `ห้อง ${mpState.roomCode}` : 'พร้อมสร้าง/เข้าห้อง'})` : 'ยังไม่เชื่อมต่อ Server'}
                    </span>
                  </div>
                  {mpState.connected && (
                    <button
                      onClick={() => MultiplayerClient.disconnect()}
                      className="text-xs font-bold text-rose-700 underline"
                    >
                      ตัดการเชื่อมต่อ
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={serverUrlInput}
                    onChange={(e) => setServerUrlInput(e.target.value)}
                    placeholder="http://localhost:3001 หรือ URL ของ Multiplayer Server"
                    className="flex-1 rounded-lg border-2 border-wood-400 bg-white px-2.5 py-1.5 text-xs text-wood-900"
                  />
                  <button
                    onClick={() => {
                      MultiplayerClient.setServerUrl(serverUrlInput);
                      MultiplayerClient.connectSocket();
                      setMpMsg('กำลังเชื่อมต่อ Multiplayer Server...');
                    }}
                    className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold"
                  >
                    เชื่อมต่อ
                  </button>
                </div>
                <p className="text-[11px] text-wood-600">
                  เซิร์ฟเวอร์จริง (Node.js + Socket.IO) อยู่ในโฟลเดอร์ <code>server/</code> รันด้วย <code>npm run server</code> รองรับ 1–8 คน/ห้อง
                </p>
              </div>

              {mpMsg && <div className="rounded-lg bg-amber-100 border border-amber-400 px-3 py-2 text-xs font-semibold text-wood-900">{mpMsg}</div>}

              {/* Auth */}
              {!mpState.username && (
                <div className="rounded-xl bg-wood-50 border-2 border-wood-300 p-3 space-y-2">
                  <div className="text-xs font-bold text-wood-900">สมัครสมาชิก / เข้าสู่ระบบ (Authentication)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={authUser}
                      onChange={(e) => setAuthUser(e.target.value)}
                      placeholder="Username"
                      className="rounded-lg border-2 border-wood-400 bg-white px-2.5 py-1.5 text-xs text-wood-900"
                    />
                    <input
                      type="password"
                      value={authPass}
                      onChange={(e) => setAuthPass(e.target.value)}
                      placeholder="Password"
                      className="rounded-lg border-2 border-wood-400 bg-white px-2.5 py-1.5 text-xs text-wood-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        MultiplayerClient.setServerUrl(serverUrlInput);
                        const res = await MultiplayerClient.register(authUser, authPass);
                        setMpMsg(res.ok ? 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!' : res.error ?? 'ไม่สำเร็จ');
                      }}
                      className="wood-btn-primary rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      สมัครสมาชิก
                    </button>
                    <button
                      onClick={async () => {
                        MultiplayerClient.setServerUrl(serverUrlInput);
                        const res = await MultiplayerClient.login(authUser, authPass);
                        setMpMsg(res.ok ? 'เข้าสู่ระบบสำเร็จ!' : res.error ?? 'ไม่สำเร็จ');
                      }}
                      className="wood-btn rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </div>
                </div>
              )}

              {/* Create / Join Room */}
              <div className="rounded-xl bg-wood-50 border-2 border-wood-300 p-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    const res = await MultiplayerClient.createRoom();
                    setMpMsg(res.ok ? `สร้างห้องสำเร็จ! รหัสห้อง: ${res.code}` : res.error ?? 'ไม่สำเร็จ');
                  }}
                  className="wood-btn-primary rounded-lg px-3.5 py-2 text-xs font-bold"
                >
                  สร้างห้องฟาร์ม (1–8 คน)
                </button>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="กรอก Room Code"
                  maxLength={6}
                  className="w-32 rounded-lg border-2 border-wood-400 bg-white px-2.5 py-1.5 text-xs font-mono uppercase text-wood-900"
                />
                <button
                  onClick={async () => {
                    const res = await MultiplayerClient.joinRoom(joinCode);
                    setMpMsg(res.ok ? `เข้าร่วมห้อง ${res.code} สำเร็จ!` : res.error ?? 'ไม่สำเร็จ');
                  }}
                  className="wood-btn rounded-lg px-3 py-2 text-xs font-bold"
                >
                  เข้าร่วมห้อง
                </button>
              </div>

              {/* Active Room Players & Live Chat */}
              {mpState.roomCode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-wood-50 border-2 border-wood-300 p-3 space-y-1.5">
                    <div className="text-xs font-bold text-wood-900">
                      ผู้เล่นในห้อง {mpState.roomCode} ({mpState.players.length}/8)
                    </div>
                    {mpState.players.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs bg-wood-100 rounded px-2 py-1">
                        <span className="font-semibold text-wood-900">
                          {p.username} <span className="text-wood-600">({p.zone})</span>
                        </span>
                        {inGame && GameState.getSelectedSlot() && (
                          <button
                            onClick={() => {
                              const slot = GameState.getSelectedSlot();
                              if (slot) MultiplayerClient.sendGift(p.id, slot.itemId, 1);
                            }}
                            className="text-[10px] font-bold text-meadow-600 underline"
                          >
                            ส่งของที่ถืออยู่
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-wood-50 border-2 border-wood-300 p-3 flex flex-col gap-2">
                    <div className="text-xs font-bold text-wood-900">แชตในห้อง</div>
                    <div className="h-28 overflow-y-auto space-y-1 text-xs bg-white rounded border border-wood-300 p-2">
                      {mpState.chatLog.map((m) => (
                        <div key={m.id} className={m.system ? 'text-meadow-600 italic' : 'text-wood-900'}>
                          <strong>{m.sender}:</strong> {m.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chatInput.trim()) {
                            MultiplayerClient.sendChat(chatInput);
                            setChatInput('');
                          }
                        }}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 rounded border border-wood-400 bg-white px-2 py-1 text-xs text-wood-900"
                      />
                      <button
                        onClick={() => {
                          if (!chatInput.trim()) return;
                          MultiplayerClient.sendChat(chatInput);
                          setChatInput('');
                        }}
                        className="wood-btn-primary rounded px-2.5 py-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
