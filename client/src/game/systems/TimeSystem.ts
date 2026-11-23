import type { Season, WeatherType, WorldTime } from '@shared/index';

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

export class TimeSystem {
  private seasonIndex = 0;
  private day = 1;
  private year = 1;
  private hour = 7;
  private minute = 0;
  private weather: WeatherType = 'Sunny';
  private timeScale = 1;
  private accumulatorMs = 0;

  // At 1x scale: 10 in-game minutes = 9 real seconds => 18 in-game hours (6:00-24:00) ≈ 16.2 real minutes
  private readonly baseMsPerGameMinute = 900;

  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.5, Math.min(10, scale));
  }

  update(deltaMs: number): boolean {
    this.accumulatorMs += deltaMs * this.timeScale;
    let changed = false;

    while (this.accumulatorMs >= this.baseMsPerGameMinute) {
      this.accumulatorMs -= this.baseMsPerGameMinute;
      this.minute += 1;
      if (this.minute >= 60) {
        this.minute = 0;
        this.hour += 1;
        if (this.hour >= 24) {
          this.hour = 6;
          this.advanceDay();
        }
      }
      changed = true;
    }

    return changed;
  }

  private advanceDay(): void {
    this.day += 1;
    if (this.day > 28) {
      this.day = 1;
      this.seasonIndex = (this.seasonIndex + 1) % SEASONS.length;
      if (this.seasonIndex === 0) {
        this.year += 1;
      }
    }
    this.rollWeather();
  }

  private rollWeather(): void {
    const season = SEASONS[this.seasonIndex];
    const r = Math.random();
    if (season === 'Winter') {
      this.weather = r < 0.55 ? 'Snow' : r < 0.85 ? 'Sunny' : 'Fog';
    } else if (season === 'Summer') {
      this.weather = r < 0.7 ? 'Sunny' : r < 0.9 ? 'Rainy' : 'Storm';
    } else {
      this.weather = r < 0.65 ? 'Sunny' : r < 0.9 ? 'Rainy' : 'Fog';
    }
  }

  getDayPhase(): WorldTime['dayPhase'] {
    if (this.hour < 10) return 'Morning';
    if (this.hour < 17) return 'Day';
    if (this.hour < 20) return 'Evening';
    return 'Night';
  }

  getAmbientOverlay(): { color: number; alpha: number } {
    const t = this.hour + this.minute / 60;
    if (t >= 6 && t < 8.5) {
      // Warm dawn glow
      const factor = 1 - (t - 6) / 2.5;
      return { color: 0xffb36b, alpha: 0.14 * factor };
    }
    if (t >= 8.5 && t < 16.5) {
      return { color: 0x000000, alpha: 0 };
    }
    if (t >= 16.5 && t < 19.5) {
      // Golden hour sunset
      const factor = (t - 16.5) / 3;
      return { color: 0xd96b27, alpha: 0.22 * factor };
    }
    // Cozy twilight / night blue
    const factor = Math.min(1, (t - 19.5) / 2.5);
    return { color: 0x162447, alpha: 0.22 + 0.26 * factor };
  }

  getSnapshot(): WorldTime {
    return {
      season: SEASONS[this.seasonIndex],
      day: this.day,
      year: this.year,
      hour: this.hour,
      minute: this.minute,
      weather: this.weather,
      dayPhase: this.getDayPhase(),
    };
  }
}
