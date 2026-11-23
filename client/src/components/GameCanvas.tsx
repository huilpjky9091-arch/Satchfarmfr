import React, { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import type { CharacterAppearance, GameSettings } from '@shared/index';
import { createEvergreenGame } from '../game/config';

interface GameCanvasProps {
  appearance: CharacterAppearance;
  settings: GameSettings;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ appearance, settings }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    gameRef.current = createEvergreenGame(containerRef.current, appearance, settings);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // Mount Phaser once when entering the world; live updates flow through EventBus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};
