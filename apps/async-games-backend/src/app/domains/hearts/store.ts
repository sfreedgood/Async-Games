import { Injectable, NotFoundException } from '@nestjs/common';
import type { HeartsGame } from './hearts.entity';

/**
 * In-memory game store. A singleton Map of gameId -> game state.
 *
 * This deliberately avoids the git-backed GameTracker (which writes to /tmp and
 * shells out to git) so that game state stays deterministic and fast for tests.
 * Persistence/auth/eviction are deferred to a future iteration.
 */
@Injectable()
export class HeartsStore {
  private readonly games = new Map<string, HeartsGame>();

  save(game: HeartsGame): HeartsGame {
    this.games.set(game.gameId, game);
    return game;
  }

  get(gameId: string): HeartsGame {
    const game = this.games.get(gameId);
    if (!game) {
      throw new NotFoundException(`Game '${gameId}' not found`);
    }
    return game;
  }

  delete(gameId: string): void {
    this.games.delete(gameId);
  }
}
