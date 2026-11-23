import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

const PORT = Number(process.env.PORT ?? 3001);
const SERVER_VERSION = '1.0.0';
const MAX_PLAYERS_PER_ROOM = 8;

interface UserRecord {
  username: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface PlayerInRoom {
  id: string;
  username: string;
  appearance: Record<string, unknown>;
  zone: string;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
}

interface RoomState {
  code: string;
  hostUsername: string;
  players: Map<string, PlayerInRoom>;
  farmPlots: Map<string, Record<string, unknown>>;
  createdAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function loadUsers(): Record<string, UserRecord> {
  try {
    if (!fs.existsSync(USERS_FILE)) return {};
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')) as Record<string, UserRecord>;
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, UserRecord>): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const users = loadUsers();
const tokens = new Map<string, string>(); // token -> username
const rooms = new Map<string, RoomState>();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'evergreen-valley-online-server',
    version: SERVER_VERSION,
    activeRooms: rooms.size,
  });
});

app.post('/api/auth/register', (req, res) => {
  const username = String(req.body?.username ?? '').trim();
  const password = String(req.body?.password ?? '');
  if (username.length < 3 || username.length > 20 || password.length < 4) {
    res.status(400).json({ error: 'ชื่อผู้ใช้ต้อง 3–20 ตัวอักษร และรหัสผ่านอย่างน้อย 4 ตัว' });
    return;
  }
  const key = username.toLowerCase();
  if (users[key]) {
    res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' });
    return;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  users[key] = {
    username,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  saveUsers(users);
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, username);
  res.json({ token, username });
});

app.post('/api/auth/login', (req, res) => {
  const username = String(req.body?.username ?? '').trim();
  const password = String(req.body?.password ?? '');
  const record = users[username.toLowerCase()];
  if (!record || hashPassword(password, record.salt) !== record.passwordHash) {
    res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    return;
  }
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, record.username);
  res.json({ token, username: record.username });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

function broadcastRoomPlayers(room: RoomState): void {
  io.to(room.code).emit('room:players', Array.from(room.players.values()));
}

io.on('connection', (socket) => {
  let currentRoomCode: string | null = null;
  let currentUsername = 'Guest';

  socket.on('room:create', (payload: { token?: string; username?: string; appearance?: Record<string, unknown> }, ack) => {
    const resolvedName = (payload?.token && tokens.get(payload.token)) || payload?.username || `Farmer_${socket.id.slice(0, 4)}`;
    currentUsername = resolvedName;

    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();

    const room: RoomState = {
      code,
      hostUsername: resolvedName,
      players: new Map(),
      farmPlots: new Map(),
      createdAt: Date.now(),
    };
    rooms.set(code, room);
    currentRoomCode = code;
    socket.join(code);

    room.players.set(socket.id, {
      id: socket.id,
      username: resolvedName,
      appearance: payload?.appearance ?? {},
      zone: 'farm',
      x: 224,
      y: 192,
      direction: 'down',
      isMoving: false,
    });

    broadcastRoomPlayers(room);
    io.to(code).emit('chat:message', {
      id: `${Date.now()}_sys`,
      sender: 'System',
      text: `${resolvedName} สร้างห้องฟาร์มออนไลน์ (${code})`,
      timestamp: Date.now(),
      system: true,
    });

    ack?.({ ok: true, code, hostUsername: room.hostUsername, maxPlayers: MAX_PLAYERS_PER_ROOM });
  });

  socket.on('room:join', (payload: { code: string; token?: string; username?: string; appearance?: Record<string, unknown> }, ack) => {
    const code = String(payload?.code ?? '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      ack?.({ ok: false, error: 'ไม่พบห้องรหัสนี้' });
      return;
    }
    if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
      ack?.({ ok: false, error: `ห้องเต็มแล้ว (สูงสุด ${MAX_PLAYERS_PER_ROOM} คน)` });
      return;
    }

    const resolvedName = (payload?.token && tokens.get(payload.token)) || payload?.username || `Farmer_${socket.id.slice(0, 4)}`;
    currentUsername = resolvedName;
    currentRoomCode = code;
    socket.join(code);

    room.players.set(socket.id, {
      id: socket.id,
      username: resolvedName,
      appearance: payload?.appearance ?? {},
      zone: 'farm',
      x: 224,
      y: 192,
      direction: 'down',
      isMoving: false,
    });

    broadcastRoomPlayers(room);
    socket.emit('farm:sync', Array.from(room.farmPlots.values()));
    io.to(code).emit('chat:message', {
      id: `${Date.now()}_join`,
      sender: 'System',
      text: `${resolvedName} เข้าร่วมฟาร์มแล้ว!`,
      timestamp: Date.now(),
      system: true,
    });

    ack?.({ ok: true, code, hostUsername: room.hostUsername, maxPlayers: MAX_PLAYERS_PER_ROOM });
  });

  socket.on('player:move', (pos: { zone: string; x: number; y: number; direction: string; isMoving: boolean }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    const p = room?.players.get(socket.id);
    if (!room || !p) return;
    p.zone = pos.zone;
    p.x = pos.x;
    p.y = pos.y;
    p.direction = pos.direction;
    p.isMoving = pos.isMoving;
    socket.to(currentRoomCode).emit('room:players', Array.from(room.players.values()));
  });

  socket.on('farm:update', (plots: Record<string, unknown>[]) => {
    if (!currentRoomCode || !Array.isArray(plots)) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;
    plots.forEach((plot) => {
      if (typeof plot.key === 'string') {
        room.farmPlots.set(plot.key, plot);
      }
    });
    socket.to(currentRoomCode).emit('farm:sync', Array.from(room.farmPlots.values()));
  });

  socket.on('chat:send', (text: string) => {
    if (!currentRoomCode) return;
    const clean = String(text ?? '').trim().slice(0, 200);
    if (!clean) return;
    io.to(currentRoomCode).emit('chat:message', {
      id: `${Date.now()}_${socket.id.slice(0, 4)}`,
      sender: currentUsername,
      text: clean,
      timestamp: Date.now(),
    });
  });

  socket.on('gift:send', (payload: { targetPlayerId: string; itemId: string; quantity: number }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || !room.players.has(payload.targetPlayerId)) return;
    const qty = Math.max(1, Math.min(99, Number(payload.quantity) || 1));
    io.to(payload.targetPlayerId).emit('gift:received', {
      fromUsername: currentUsername,
      itemId: payload.itemId,
      quantity: qty,
    });
  });

  socket.on('disconnect', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;
    room.players.delete(socket.id);
    if (room.players.size === 0) {
      rooms.delete(currentRoomCode);
    } else {
      broadcastRoomPlayers(room);
      io.to(currentRoomCode).emit('chat:message', {
        id: `${Date.now()}_leave`,
        sender: 'System',
        text: `${currentUsername} ออกจากห้องแล้ว`,
        timestamp: Date.now(),
        system: true,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Evergreen Valley Server v${SERVER_VERSION}] Listening on http://localhost:${PORT}`);
});
