
export interface Mosquito {
  id: number;
  x: number;
  y: number;
  isSwatted: boolean;
  spawnTime: number; 
}

export enum GameStatus {
  Idle = 'idle',
  Setup = 'setup', // New state for name/difficulty input
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export enum DifficultyLevel {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
}

export interface Boss {
  id: number;
  x: number;
  y: number;
  isVisible: boolean;
  isScolding: boolean;
  scoldStartTime: number;
  scoldEndTime: number;
  clickedAway: boolean;
  slideDirection: 'left' | 'right';
}
