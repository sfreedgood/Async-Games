import { useCallback, useEffect, useRef, useState } from 'react';
import { getData, postData } from '../../../../api';
import type { CardRef, HeartsGameView } from '../entities';

const VIEWER_SEAT = 0;

interface UseHeartsGame {
  view: HeartsGameView | null;
  loading: boolean;
  error: string | null;
  playCard: (card: CardRef) => Promise<void>;
  passCards: (cards: CardRef[]) => Promise<void>;
}

/**
 * Creates a Hearts game on mount and drives it from authoritative server state.
 * Every move POSTs to the backend and replaces local state with the returned
 * view (already advanced through the bots). On a rejected move (e.g. a desync
 * 422) it re-fetches the canonical state.
 */
export const useHeartsGame = (humanName: string, seed?: number): UseHeartsGame => {
  const [view, setView] = useState<HeartsGameView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invocation creating two games.
    if (createdRef.current) return;
    createdRef.current = true;

    postData<HeartsGameView>('/hearts/games', { humanName, seed })
      .then((created) => setView(created))
      .catch(() => setError('Could not start a new game.'))
      .finally(() => setLoading(false));
  }, [humanName, seed]);

  const refetch = useCallback(async (gameId: string) => {
    const fresh = await getData<HeartsGameView>(`/hearts/games/${gameId}`);
    if (fresh) setView(fresh as HeartsGameView);
  }, []);

  const mutate = useCallback(
    async (path: string, body: unknown) => {
      if (!view) return;
      setError(null);
      try {
        const next = await postData<HeartsGameView>(
          `/hearts/games/${view.gameId}/${path}`,
          body
        );
        setView(next);
      } catch {
        setError('That move was not allowed.');
        await refetch(view.gameId);
      }
    },
    [view, refetch]
  );

  const playCard = useCallback(
    (card: CardRef) => mutate('play', { seat: VIEWER_SEAT, card }),
    [mutate]
  );

  const passCards = useCallback(
    (cards: CardRef[]) => mutate('pass', { seat: VIEWER_SEAT, cards }),
    [mutate]
  );

  return { view, loading, error, playCard, passCards };
};
