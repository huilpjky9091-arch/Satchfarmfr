import { io, type Socket } from 'socket.io-client';
import type { ChatMessage, FarmPlotState, RemotePlayerState } from '@shared/index';
import { EventBus } from './EventBus';
import { GameState } from './GameStateStore';

class RealMultiplayerClient {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:3001';
  private token: string | null = null;
  private username: string | null = null;
  private roomCode: string | null = null;
  private connected = false;
  private players: RemotePlayerState[] = [];
  private chatLog: ChatMessage[] = [];
  private listeners = new Set<() => void>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  getState() {
    return {
      serverUrl: this.serverUrl,
      connected: this.connected,
      username: this.username,
      roomCode: this.roomCode,
      players: this.players,
      chatLog: this.chatLog,
    };
  }

  setServerUrl(url: string): void {
    this.serverUrl = url.trim().replace(/\/+$/, '');
    this.notify();
  }

  async register(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token?: string; username?: string; error?: string };
      if (!res.ok || !data.token) return { ok: false, error: data.error ?? 'สมัครสมาชิกไม่สำเร็จ' };
      this.token = data.token;
      this.username = data.username ?? username;
      this.connectSocket();
      this.notify();
      return { ok: true };
    } catch {
      return { ok: false, error: 'ไม่สามารถเชื่อมต่อ Multiplayer Server ได้ กรุณาตรวจสอบ Server URL หรือรัน npm run server' };
    }
  }

  async login(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token?: string; username?: string; error?: string };
      if (!res.ok || !data.token) return { ok: false, error: data.error ?? 'เข้าสู่ระบบไม่สำเร็จ' };
      this.token = data.token;
      this.username = data.username ?? username;
      this.connectSocket();
      this.notify();
      return { ok: true };
    } catch {
      return { ok: false, error: 'ไม่สามารถเชื่อมต่อ Multiplayer Server ได้ กรุณาตรวจสอบ Server URL หรือรัน npm run server' };
    }
  }

  connectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    const socket = io(this.serverUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1200,
    });
    this.socket = socket;

    socket.on('connect', () => {
      this.connected = true;
      this.notify();
    });

    socket.on('disconnect', () => {
      this.connected = false;
      this.notify();
    });

    socket.on('room:players', (allPlayers: RemotePlayerState[]) => {
      this.players = allPlayers;
      const others = allPlayers.filter((p) => p.id !== socket.id);
      EventBus.emit('mp:players', others);
      this.notify();
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      this.chatLog = [...this.chatLog.slice(-49), msg];
      EventBus.emit('mp:chat', msg);
      this.notify();
    });

    socket.on('farm:sync', (plots: FarmPlotState[]) => {
      plots.forEach((p) => GameState.farmPlots.set(p.key, p));
      EventBus.emit('farm:updated', Array.from(GameState.farmPlots.values()));
    });

    socket.on('gift:received', (payload: { fromUsername: string; itemId: string; quantity: number }) => {
      GameState.addItem(payload.itemId, payload.quantity);
      GameState.toast(`🎁 ได้รับของขวัญจาก ${payload.fromUsername} (x${payload.quantity})!`, 'success');
    });
  }

  createRoom(): Promise<{ ok: boolean; code?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        this.connectSocket();
        resolve({ ok: false, error: 'กำลังเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองกดอีกครั้ง' });
        return;
      }
      this.socket.emit(
        'room:create',
        {
          token: this.token,
          username: this.username ?? GameState.appearance.name,
          appearance: GameState.appearance,
        },
        (res: { ok: boolean; code?: string; error?: string }) => {
          if (res?.ok && res.code) {
            this.roomCode = res.code;
            this.notify();
          }
          resolve(res ?? { ok: false, error: 'ไม่สามารถสร้างห้องได้' });
        }
      );
    });
  }

  joinRoom(code: string): Promise<{ ok: boolean; code?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        resolve({ ok: false, error: 'ยังไม่ได้เชื่อมต่อ Multiplayer Server' });
        return;
      }
      this.socket.emit(
        'room:join',
        {
          code,
          token: this.token,
          username: this.username ?? GameState.appearance.name,
          appearance: GameState.appearance,
        },
        (res: { ok: boolean; code?: string; error?: string }) => {
          if (res?.ok && res.code) {
            this.roomCode = res.code;
            this.notify();
          }
          resolve(res ?? { ok: false, error: 'ไม่สามารถเข้าร่วมห้องได้' });
        }
      );
    });
  }

  sendPosition(zone: string, x: number, y: number, direction: string, isMoving: boolean): void {
    if (!this.socket || !this.connected || !this.roomCode) return;
    this.socket.emit('player:move', { zone, x, y, direction, isMoving });
  }

  syncFarmPlots(plots: FarmPlotState[]): void {
    if (!this.socket || !this.connected || !this.roomCode) return;
    this.socket.emit('farm:update', plots);
  }

  sendChat(text: string): void {
    if (!this.socket || !this.connected || !this.roomCode) return;
    this.socket.emit('chat:send', text);
  }

  sendGift(targetPlayerId: string, itemId: string, quantity = 1): boolean {
    if (!this.socket || !this.connected || !this.roomCode) return false;
    if (!GameState.removeItem(itemId, quantity)) return false;
    this.socket.emit('gift:send', { targetPlayerId, itemId, quantity });
    GameState.toast('ส่งของขวัญให้เพื่อนเรียบร้อยแล้ว!', 'success');
    return true;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
    this.roomCode = null;
    this.players = [];
    EventBus.emit('mp:players', []);
    this.notify();
  }
}

export const MultiplayerClient = new RealMultiplayerClient();
