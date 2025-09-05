import { Player } from './player';
import { Turn } from './turn';

describe('turn', () => {
  const playerOne = new Player('player_1', 'Player 1');
  const playerTwo = new Player('player_2', 'Player 2');
  const playerThree = new Player('player_3', 'Player 3');
  const playerFour = new Player('player_4', 'Player 4');

  const players = [playerOne, playerTwo, playerThree, playerFour];

  describe('definePlayProgression', () => {
    it('should return players in order provided if given player is first player in list', () => {
      const turn = new Turn('name', players[0], players);

      expect(JSON.stringify(turn.playProgression)).toStrictEqual(
        JSON.stringify(players)
      );
    });

    it('should wrap to the start of the list once it as reached the end, if all player positions not yet defined', () => {
      const turn = new Turn('name', playerThree, players);

      expect(JSON.stringify(turn.playProgression)).toEqual(
        JSON.stringify([playerThree, playerFour, playerOne, playerTwo])
      );
    });
  });
});
