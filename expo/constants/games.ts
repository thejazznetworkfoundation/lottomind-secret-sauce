import { GameConfig, GameType } from '@/types/lottery';

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  powerball: {
    name: 'Powerball',
    shortName: 'PB',
    mainRange: 69,
    bonusRange: 26,
    mainCount: 5,
    bonusName: 'Powerball',
    color: '#E74C3C',
  },
  megamillions: {
    name: 'Mega Millions',
    shortName: 'MM',
    mainRange: 70,
    bonusRange: 25,
    mainCount: 5,
    bonusName: 'Mega Ball',
    color: '#3498DB',
  },
};
