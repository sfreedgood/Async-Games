export type PlayerId = string;

export class Player {
  playerId: PlayerId;
  playerName: string;

  constructor(playerId: PlayerId, playerName: string) {
    this.playerId = playerId;
    this.playerName = playerName;
  }
}
