class ProceduralAudioSystem {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.55;
  private musicVolume = 0.35;
  private lastStepTime = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  playClick(): void {
    if (this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.055);

    gain.gain.setValueAtTime(0.14 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playInteract(): void {
    if (this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.13);
    });
  }

  playFootstep(surface: 'grass' | 'path', sprinting: boolean): void {
    if (this.sfxVolume <= 0.01) return;
    const nowMs = performance.now();
    const interval = sprinting ? 230 : 340;
    if (nowMs - this.lastStepTime < interval) return;
    this.lastStepTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = surface === 'path' ? 165 : 115;
    const jitter = (Math.random() - 0.5) * 28;
    osc.type = surface === 'path' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq + jitter, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

    gain.gain.setValueAtTime(0.07 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const AudioSystem = new ProceduralAudioSystem();
