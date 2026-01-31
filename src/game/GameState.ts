export type GamePhase = 'START' | 'PLAYING' | 'END';

export class GameState {
  phase: GamePhase = 'START';
  score = 0;
  timeLeft = 45;

  setPhase(phase: GamePhase) {
    this.phase = phase;
  }
}
