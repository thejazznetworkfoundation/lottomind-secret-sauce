import { type NosyGame, type NosyGameDrawResult } from '@/utils/nosyApi';
import { type Pick3Draw, type Pick4Draw } from '@/utils/pick3pick4Api';

export type GameType = 'powerball' | 'megamillions';

export type StrategyType = 'hot' | 'cold' | 'balanced';

export interface GameConfig {
  name: string;
  shortName: string;
  mainRange: number;
  bonusRange: number;
  mainCount: number;
  bonusName: string;
  color: string;
}

export interface PredictionInsights {
  numbers: number[];
  bonusNumber: number;
  confidence: number;
  reasons: string[];
  strategy: StrategyType;
  source: 'live-ml' | 'fallback';
  generatedAt: string;
}

export interface GeneratedSet {
  id: string;
  numbers: number[];
  bonusNumber: number;
  game: GameType;
  strategy: StrategyType;
  createdAt: string;
  prediction: PredictionInsights;
}

export interface FrequencyData {
  number: number;
  frequency: number;
  normalized: number;
  recencyScore: number;
  momentumScore: number;
  pairScore: number;
  score: number;
}

export interface LiveDraw {
  id: string;
  game: GameType;
  drawDate: string;
  numbers: number[];
  bonusNumber: number;
  multiplier: number | null;
  jackpot: string | null;
  videoUrl: string | null;
  source: 'live' | 'fallback';
}

export interface PredictionContext {
  game: GameType;
  draws: LiveDraw[];
  frequencies: FrequencyData[];
  hotNumbers: number[];
  coldNumbers: number[];
  averageScore: number;
  updatedAt: string;
}

export interface LotteryApiRecord {
  draw_date: string;
  winning_numbers: string;
  multiplier?: string;
  jackpot?: string;
  video_url?: string;
}

export interface LottoContextValue {
  currentGame: GameType;
  switchGame: (game: GameType) => void;
  history: GeneratedSet[];
  generate: (strategy: StrategyType) => GeneratedSet;
  clearHistory: () => void;
  isLoading: boolean;
  liveDraws: LiveDraw[];
  liveDataError: string | null;
  isLiveDataLoading: boolean;
  hotNumbers: number[];
  coldNumbers: number[];
  frequencies: FrequencyData[];
  latestDraw: LiveDraw | null;
  pickState: string;
  setPickState: (state: string) => void;
  pick3Summary: string;
  pick4Summary: string;
  stateGames: string[];
  stateName: string;
  nosyGames: NosyGame[];
  isNosyGamesLoading: boolean;
  gameDrawResults: NosyGameDrawResult[];
  pick3Draws: Pick3Draw[];
  pick4Draws: Pick4Draw[];
  isPick3Loading: boolean;
  isPick4Loading: boolean;
}
