import { Player } from './player';
import { GameTracker } from './tracker';

export type PlayProgression = Player[]; // replace with player

export class Turn extends GameTracker {
  player: Player;
  playProgression: PlayProgression;

  constructor(gameName: string, player: Player, players: Player[]) {
    super(gameName, players);
    this.player = player;
    this.playProgression = this.definePlayProgression();
  }

  definePlayProgression = () => {
    // Mimic clockwise table behavior
    const playerIndex = this.players.indexOf(this.player);

    const followingPlayers = this.players.slice(playerIndex);
    const priorPlayers = this.players.slice(0, playerIndex);

    return [...followingPlayers, ...priorPlayers];
  };

  notifyPlayer() {
    // Notification logic (ex. email, maybe push depending on env)
  }
}
