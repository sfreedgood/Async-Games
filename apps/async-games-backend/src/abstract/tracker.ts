import { randomUUID } from 'crypto';
import { simpleGit } from 'simple-git';
import type { SimpleGit, SimpleGitOptions, StatusResult } from 'simple-git';
import { Player } from './player';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { normalizeStringForPath } from '../utils/string.utils';

export const gameTrackerBaseDir = '/tmp/async_games/active_games/';

export const buildGameDir = (name: string, id: string) => {
  return `${gameTrackerBaseDir}${name
    .replaceAll(' ', '-')
    .toLowerCase()}/${id}`;
};

export class GameTracker {
  name: string;
  gameId: string;
  dirPath: string;
  gitOptions: Partial<SimpleGitOptions>;
  git: SimpleGit;
  players: Player[];
  currentPlayer: Player;
  turnNumber = 0;

  constructor(name: string, players: Player[]) {
    this.name = name;
    this.players = players;
    this.currentPlayer = players[0];

    this.gameId = normalizeStringForPath(name).concat('_', randomUUID());
    this.dirPath = buildGameDir(this.name, this.gameId);

    mkdirSync(this.dirPath, { recursive: true });
    this.gitOptions = { baseDir: this.dirPath, binary: 'git' };
    this.git = simpleGit(this.gitOptions);
  }

  async initializeGame() {
    try {
      await this.git.init();
    } catch (e) {
      console.error(e);
    }

    const gameMetaData = {
      gameId: this.gameId,
      gameName: this.name,
      players: this.players,
      created: Date.now(),
    };
    writeFileSync(
      `${this.dirPath}/metadata.json`,
      JSON.stringify(gameMetaData)
    );

    try {
      await this.commitAction();
    } catch (e) {
      console.error(e);
    }
  }

  async commitAction() {
    try {
      const status = await this.git.status();
      const diffs = this.handleDiff(status);
      if (diffs === null) return;
      // TODO add confirmation of changes
    } catch (e) {
      console.error(e);
    }

    await this.git.add('.');
    await this.git.commit(
      `turn${this.turnNumber}_${this.currentPlayer.playerId}`
    );
  }

  async nextTurn() {
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    const endOfRound: boolean = currentPlayerIndex === this.players.length;

    const nextPlayer = endOfRound
      ? this.players[0]
      : this.players[currentPlayerIndex + 1];
    const turnNumber = endOfRound ? this.turnNumber + 1 : this.turnNumber;

    const nextTurnId = `turn${turnNumber}_${nextPlayer.playerId}`;
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
    rmSync(this.dirPath, { recursive: true });
  }

  // TODO: Handle status states, implement validations.
  private handleDiff(status: StatusResult): StatusResult | null {
    const { not_added, conflicted, created, deleted, modified } = status;
    const fieldsToValidate = [
      not_added,
      conflicted,
      created,
      deleted,
      modified,
    ];
    const totalChangedFilesCount = fieldsToValidate
      .map((statusField) => statusField.length)
      .reduce((prev, curr, i, arr) => {
        return prev + curr;
      }, 0);

    if (totalChangedFilesCount === 0) return null;

    if (conflicted.length) {
      throw new Error(
        `Unable to commit changes due to conflicts in: ${conflicted.join(', ')}`
      );
      // TODO: add way for user to resolve conflicts. Use diff to show user, then let choose which version to use.
    }

    if (modified.length) {
      console.log(`Modified Files: ${modified.join(', ')}`);
      // Optional TODO: Add confirmation (using diff)
    }

    return status;
  }
}
