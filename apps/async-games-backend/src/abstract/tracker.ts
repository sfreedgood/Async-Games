import { randomUUID } from 'crypto';
import { mkdir, rmdir } from 'fs';
import { simpleGit, CleanOptions } from 'simple-git';
import type { SimpleGit, SimpleGitOptions } from 'simple-git';
import { Player } from './player';

export class GameTracker {
  name: string;
  gameId: string;
  dirPath: string;
  gitOptions: Partial<SimpleGitOptions>;
  git: SimpleGit;
  players: Player[];
  currentPlayer: Player;
  turnNumber = 0;

  constructor(name: string, players: Player[], gameId?: string) {
    this.name = name;
    this.players = players;
    this.gameId = gameId || (randomUUID as unknown as string);
    this.currentPlayer = players[0];
    this.dirPath = `${process.cwd()}/.${this.name}/game/${gameId}`;

    this.gitOptions = { baseDir: this.dirPath, binary: 'git' };
    this.git = simpleGit(this.gitOptions).clean(CleanOptions.FORCE);
  }

  async initializeGame() {
    mkdir(this.dirPath, (err) => {
      if (err) throw err;
    });

    await this.git.init();
  }

  async commitAction() {
    const filesChanged = await this.git.diff(['--name-only']);
    // TODO add confirmation of changes
    await this.git.add(filesChanged);
    await this.git.commit(`turn${this.turnNumber}_${this.currentPlayer}`);
  }

  async nextTurn() {
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    const endOfRound: boolean = currentPlayerIndex === this.players.length;

    const nextPlayer = endOfRound
      ? this.players[0]
      : this.players[currentPlayerIndex + 1];
    const turnNumber = endOfRound ? this.turnNumber + 1 : this.turnNumber;

    const nextTurnId = `turn${turnNumber}_${nextPlayer}`;
    await this.git.checkoutLocalBranch(nextTurnId);

    this.currentPlayer = nextPlayer;
  }

  getNextPlayer = (currentPlayer: Player) => {
    const currentPlayerIndex = this.players.indexOf(currentPlayer);
    return currentPlayerIndex === this.players.length - 1
      ? this.players[0]
      : this.players[currentPlayerIndex + 1];
  };

  async deleteGame() {
    rmdir(this.dirPath, (err) => {
      if (err) throw err;
    });
  }
}
