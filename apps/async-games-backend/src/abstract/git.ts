import { mkdir, rmdir } from 'fs';
import { simpleGit, CleanOptions } from 'simple-git';
import type { SimpleGit, SimpleGitOptions, DiffResult } from 'simple-git';
import { TurnPhase } from '../entities/turn';

enum SupportedGames {
  MTG = 'MTG',
}

export class GameTracker {
  name: string;
  dirPath: string;
  gameType: SupportedGames;
  gitOptions: Partial<SimpleGitOptions>;
  git: SimpleGit;
  players: string[];
  currentPlayer: string;
  turnNumber = 0;
  stack?: Record<
    number,
    Record<string, Record<TurnPhase, Array<Record<string, DiffResult>>>>
  >;

  constructor(name: string, gameType = SupportedGames.MTG, players: string[]) {
    this.name = name;
    this.gameType = gameType;
    this.players = players;
    this.currentPlayer = players[0];
    this.dirPath = `${process.cwd()}/.${this.gameType.toLowerCase()}/game/${
      this.name
    }`;

    this.gitOptions = { baseDir: this.dirPath, binary: 'git' };
    this.git = simpleGit(this.gitOptions).clean(CleanOptions.FORCE);
  }

  async startGame() {
    mkdir(this.dirPath, (err) => {
      if (err) throw err;
    });

    await this.git.init();
  }

  handleStack(turnSegment: TurnPhase, player: string, response: DiffResult) {
    if (this.stack) {
      const currentStack = this.stack[this.turnNumber][player][turnSegment];
      currentStack.push({ [player]: response });
    } else {
      this.stack = {
        0: {
          [this.players[0]]: {
            firstMain: [{}],
            secondMain: [{}],
            beginning: [{}],
            combat: [{}],
            end: [{}],
          },
        },
      };
    }
  }

  async commitAction(turnSegment: TurnPhase) {
    const filesChanged = await this.git.diff(['--name-only']);
    // TODO add confirmation of changes
    await this.git.add(filesChanged);
    await this.git.commit(
      `turn${this.turnNumber}_${this.currentPlayer}_${turnSegment}`
    );
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

  async deleteGame() {
    rmdir(this.dirPath, (err) => {
      if (err) throw err;
    });
  }
}
