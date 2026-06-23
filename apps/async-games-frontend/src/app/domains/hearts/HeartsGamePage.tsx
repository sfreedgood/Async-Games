import { useState } from 'react';
import { HeartsTable } from './components';
import { useHeartsGame } from './hooks';

/**
 * Top-level Hearts screen: creates a game against three bots and renders the
 * authoritative table. "New game" remounts the hook to deal a fresh game.
 */
export const HeartsGamePage = () => {
  const [gameKey, setGameKey] = useState(0);
  return <HeartsGameInstance key={gameKey} onNewGame={() => setGameKey((k) => k + 1)} />;
};

const HeartsGameInstance = ({ onNewGame }: { onNewGame: () => void }) => {
  const { view, loading, error, playCard, passCards } = useHeartsGame('You');

  if (loading || !view) {
    return (
      <div className="flex h-screen items-center justify-center bg-emerald-900 text-emerald-100">
        {error ?? 'Dealing…'}
      </div>
    );
  }

  return (
    <HeartsTable
      view={view}
      onPlay={playCard}
      onPass={passCards}
      error={error}
      onNewGame={onNewGame}
    />
  );
};

export default HeartsGamePage;
