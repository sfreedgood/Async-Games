import { GameTracker } from './tracker';
import { Player } from './player';
import simpleGit, { GitError } from 'simple-git';
import fs, { existsSync, writeFileSync } from 'fs';

jest.mocked('fs');
jest.mocked('simple-git');

describe('GameTracker', () => {
  let gameTracker: GameTracker;
  const gameName = `Test Game`;

  const players: Player[] = [
    new Player('player_1', 'Player1'),
    new Player('player_1', 'Player2'),
  ];

  beforeEach(() => {
    gameTracker = new GameTracker(gameName, players);
  });

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      expect(gameTracker.name).toBe(gameName);
      expect(gameTracker.players).toEqual(players);
      expect(gameTracker.turnNumber).toBe(0);
    });
  });

  describe('initializeGame', () => {
    const mkdirSpy = jest.spyOn(fs, 'mkdirSync');

    it('should create a directory for the game', async () => {
      await gameTracker.initializeGame();

      expect(mkdirSpy).toHaveBeenCalledWith(gameTracker.dirPath, {
        recursive: true,
      });

      expect(existsSync(`${gameTracker.dirPath}/.git`)).toBeTruthy();
    });
  });

  describe('commitAction', () => {
    let testFile: string;
    let addSpy: jest.SpyInstance;
    let commitSpy: jest.SpyInstance;

    beforeEach(async () => {
      testFile = `${gameTracker.dirPath}/testFile.txt`;
      await gameTracker.initializeGame();

      addSpy = jest.spyOn(gameTracker.git, 'add');
      commitSpy = jest.spyOn(gameTracker.git, 'commit');
    });

    it('should return early if no changes to the git repository', async () => {
      await gameTracker.commitAction();
      expect(commitSpy).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();

      try {
        await gameTracker.git.log({ file: testFile });
      } catch (e) {
        const error = e as GitError;
        expect(error.message).toMatch(
          "fatal: your current branch 'main' does not have any commits yet"
        );
      }
    });

    it('should commit changes to the git repository', async () => {
      writeFileSync(testFile, 'hello world');
      expect(existsSync(`${gameTracker.dirPath}/testFile.txt`)).toBeTruthy();

      await gameTracker.commitAction();

      expect(addSpy).toHaveBeenCalled();
      expect(commitSpy).toHaveBeenCalled();

      const testFileGitLog = await gameTracker.git.log({ file: testFile });
      expect(testFileGitLog.latest?.message).toBe(
        `turn${gameTracker.turnNumber}_${gameTracker.currentPlayer.playerId}`
      );
    });
  });

  describe.skip('nextTurn', () => {
    it('should increment the turn number and set the next player', async () => {
      await gameTracker.nextTurn();
      expect(gameTracker.turnNumber).toBe(1);
      expect(gameTracker.currentPlayer).toBe(players[1]); // Assuming Player2 is next

      await gameTracker.nextTurn();
      expect(gameTracker.turnNumber).toBe(2);
      expect(gameTracker.currentPlayer).toBe(players[0]); // Assuming 2 player game, going back to starting player
    });
  });

  describe.skip('getNextPlayer', () => {
    it('should return the next player in the list', () => {
      const nextPlayer = gameTracker.getNextPlayer(players[0]);
      expect(nextPlayer).toBe(players[1]);
    });
  });

  describe('deleteGame', () => {
    it('should remove the game directory', async () => {
      const rmSpy = jest.spyOn(fs, 'rmSync');

      await gameTracker.deleteGame();

      expect(rmSpy).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });

      expect(existsSync(gameTracker.dirPath)).toBeFalsy();
    });
  });
});
