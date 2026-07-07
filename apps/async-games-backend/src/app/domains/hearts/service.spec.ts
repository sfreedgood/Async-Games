import { Test } from '@nestjs/testing';
import { HeartsService } from './service';
import { HeartsStore } from './store';
import type { HeartsGameView } from './hearts.view';

describe('HeartsService', () => {
  let service: HeartsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HeartsService, HeartsStore],
    }).compile();
    service = moduleRef.get(HeartsService);
  });

  const create = (seed = 2024): HeartsGameView =>
    service.createGame('You', seed);

  describe('createGame', () => {
    it('deals a 13-card hand to the human and opens the passing phase', () => {
      const view = create();
      expect(view.phase).toBe('passing');
      expect(view.yourHand).toHaveLength(13);
      expect(view.players).toHaveLength(4);
      expect(view.players[0].isBot).toBe(false);
      expect(view.players.slice(1).every((p) => p.isBot)).toBe(true);
    });

    it('is deterministic for a given seed', () => {
      expect(create(5).yourHand).toEqual(create(5).yourHand);
    });
  });

  describe('pass then play', () => {
    it('advances bots and returns control to the human on their turn', () => {
      const created = create();
      const passed = service.passCards(
        created.gameId,
        0,
        created.yourHand.slice(0, 3)
      );
      expect(passed.phase).toBe('playing');
      expect(passed.currentTurn).toBe(0);
      expect(passed.legalMoves.length).toBeGreaterThan(0);

      const before = passed.players[0].handCount;
      const afterPlay = service.playCard(
        passed.gameId,
        0,
        passed.legalMoves[0]
      );
      expect(afterPlay.players[0].handCount).toBe(before - 1);
    });
  });

  describe('full game', () => {
    it('plays to completion with a declared winner reaching 100', () => {
      let view = create(777);
      for (let i = 0; i < 20000 && view.phase !== 'finished'; i++) {
        if (view.phase === 'passing') {
          view = service.passCards(view.gameId, 0, view.yourHand.slice(0, 3));
        } else if (view.awaitingTrickAck) {
          view = service.advanceTrick(view.gameId);
        } else {
          expect(view.legalMoves.length).toBeGreaterThan(0);
          view = service.playCard(view.gameId, 0, view.legalMoves[0]);
        }
      }
      expect(view.phase).toBe('finished');
      expect(view.winnerSeat).not.toBeNull();
      expect(
        view.players.some((p) => p.totalScore >= 100)
      ).toBe(true);
    });
  });

  describe('trick acknowledgement', () => {
    it('pauses on a completed trick and resolves it on advance', () => {
      let view = create(777);
      if (view.phase === 'passing') {
        view = service.passCards(view.gameId, 0, view.yourHand.slice(0, 3));
      }
      // The first human play after passing always completes a trick (all four
      // seats act), so the game pauses awaiting acknowledgement.
      view = service.playCard(view.gameId, 0, view.legalMoves[0]);
      expect(view.awaitingTrickAck).toBe(true);
      expect(view.currentTrick.plays).toHaveLength(4);
      expect(view.legalMoves).toHaveLength(0);
      expect(view.pendingTrickWinner).not.toBeNull();

      const resumed = service.advanceTrick(view.gameId);
      expect(resumed.awaitingTrickAck).toBe(false);
      expect(resumed.currentTrick.plays.length).toBeLessThan(4);
    });

    it('rejects advancing when no trick is complete', () => {
      const view = create();
      expect(() => service.advanceTrick(view.gameId)).toThrow();
    });
  });

  describe('getGame / deleteGame', () => {
    it('retrieves a stored game and removes it on delete', () => {
      const created = create();
      expect(service.getGame(created.gameId).gameId).toBe(created.gameId);
      service.deleteGame(created.gameId);
      expect(() => service.getGame(created.gameId)).toThrow();
    });
  });
});
