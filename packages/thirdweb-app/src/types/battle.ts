export interface BeastCard {
  id: number;
  name: string;
  image: string;
  dodge: number;
  health: number;
  maxHealth: number;
  attack: string;
  type: string;
  element: string;
}

export interface Player {
  id: string;
  cards: BeastCard[];
  currentBeast: BeastCard | null;
  availableCards: number[];
}

export interface Room {
  code: string;
  status: 'waiting' | 'ready' | 'playing' | 'completed';
  player1_address: string;
  player2_address: string | null;
  player1_health: number;
  player2_health: number | null;
  player1_atk_min: number;
  player1_atk_max: number;
  player2_atk_min: number | null;
  player2_atk_max: number | null;
  current_turn: string | null;
}

export interface BattleState {
  player1_health: number;
  player2_health: number;
  current_turn: string | null;
  battle_log: string[];
} 