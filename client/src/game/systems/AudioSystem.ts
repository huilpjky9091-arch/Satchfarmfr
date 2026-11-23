import type { Season } from '@shared/index';

const SEASON_MELODIES: Record<Season, number[]> = {
  Spring: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0],
  Summer: [587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 440.0],
  Autumn: [440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, 329.63],
  Winter: [392.0, 493.88, 587.33, 739.99, 587.33, 493.88, 392.0, 293.66],
};

class ProceduralAudioSystem {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.55;
  private musicVolume = 0.25;
  private lastStepTime = 0;
  private currentSeason: Season = 'Spring';
  private musicTimer: number | null = null;
  private noteIdx = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setVolumes(musicVolume: number, sfxVolume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, musicVolume));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
  }

  getVolumes(): { musicVolume: number; sfxVolume: number } {
    return { musicVolume: this.musicVolume, sfxVolume: this.sfxVolume };
  }

  setSeason(season: Season): void {
    this.currentSeason = season;
  }

  startMusic(): void {
    if (this.musicTimer !== null) return;
    this.musicTimer = window.setInterval(() => {
      if (this.musicVolume <= 0.02) return;
      if (!this.ctx || this.ctx.state !== 'running') return;
      const notes = SEASON_MELODIES[this.currentSeason];
      const freq = notes[this.noteIdx % notes.length];
      this.noteIdx++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045 * this.musicVolume, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    }, 680);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private tone(freq: number, endFreq: number, duration: number, type: OscillatorType, vol = 0.14, delay = 0): void {
    if (this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(vol * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick(): void {
    this.tone(520, 280, 0.055, 'triangle', 0.13);
  }

  playInteract(): void {
    this.tone(523.25, 523.25, 0.1, 'sine', 0.12, 0);
    this.tone(659.25, 659.25, 0.12, 'sine', 0.12, 0.06);
  }

  playTool(): void {
    this.tone(240, 110, 0.08, 'square', 0.1);
  }

  playWater(): void {
    this.tone(420, 680, 0.11, 'sine', 0.1);
  }

  playHarvest(): void {
    this.tone(587.33, 880, 0.09, 'triangle', 0.14, 0);
    this.tone(880, 1046.5, 0.11, 'triangle', 0.14, 0.07);
  }

  playCoin(): void {
    this.tone(987.77, 987.77, 0.07, 'sine', 0.12, 0);
    this.tone(1318.5, 1318.5, 0.16, 'sine', 0.13, 0.06);
  }

  playHit(): void {
    this.tone(190, 70, 0.09, 'sawtooth', 0.14);
  }

  playLevelUp(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.tone(f, f, 0.16, 'triangle', 0.14, i * 0.08);
    });
  }

  playFootstep(surface: 'grass' | 'path', sprinting: boolean): void {
    if (this.sfxVolume <= 0.01) return;
    const nowMs = performance.now();
    const interval = sprinting ? 230 : 340;
    if (nowMs - this.lastStepTime < interval) return;
    this.lastStepTime = nowMs;

    const baseFreq = surface === 'path' ? 165 : 115;
    const jitter = (Math.random() - 0.5) * 28;
    this.tone(baseFreq + jitter, 55, 0.05, surface === 'path' ? 'triangle' : 'sine', 0.07);
  }
}

export const AudioSystem = new ProceduralAudioSystem();
