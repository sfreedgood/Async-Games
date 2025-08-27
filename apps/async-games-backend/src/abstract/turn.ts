import { Player, PlayerId } from './player';
import { GameTracker } from './tracker';

export type PlayProgression = PlayerId[]; // replace with player

export class Turn extends GameTracker {
  player: Player;
  playProgression: PlayProgression;

  constructor(
    gameName: string,
    player: Player,
    players: Player[],
    gameId?: string
  ) {
    super(gameName, players, gameId);
    this.player = player;
    this.playProgression = this.definePlayProgression();
  }

  definePlayProgression = () => {
    const startingPlayer = this.player;
    // Mimic clockwise table behavior
    return this.players.flatMap((player) => {
      const priorPlayers = new Set<PlayerId>();
      const followingPlayers = new Set<PlayerId>();

      if (this.players.indexOf(startingPlayer) >= this.players.indexOf(player))
        followingPlayers.add(player.playerId);
      if (this.players.indexOf(startingPlayer) < this.players.indexOf(player))
        priorPlayers.add(player.playerId);

      return [...followingPlayers, ...priorPlayers];
    });
  };

  notifyPlayer() {
    // Notification logic (ex. email, maybe push depending on env)
  }
}
