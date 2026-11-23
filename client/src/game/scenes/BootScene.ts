import Phaser from 'phaser';
import type { CharacterAppearance, GameSettings } from '@shared/index';
import { generatePlayerTexture, generateWorldTextures } from '../assets/PixelArtGenerator';

export interface BootSceneData {
  appearance: CharacterAppearance;
  settings: GameSettings;
}

export class BootScene extends Phaser.Scene {
  private initData: BootSceneData;

  constructor(data: BootSceneData) {
    super({ key: 'BootScene' });
    this.initData = data;
  }

  create(): void {
    generateWorldTextures(this);
    generatePlayerTexture(this, this.initData.appearance);
    this.scene.start('WorldScene', this.initData);
  }
}
