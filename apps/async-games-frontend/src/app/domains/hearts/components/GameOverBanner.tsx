import type { HeartsPlayerView, SeatIndex } from '../entities';

export interface GameOverBannerProps {
  winnerSeat: SeatIndex;
  players: HeartsPlayerView[];
  onNewGame?: () => void;
}

/** Full-screen overlay shown when the game finishes. */
export const GameOverBanner = ({
  winnerSeat,
  players,
  onNewGame,
}: GameOverBannerProps) => {
  const winner = players[winnerSeat];
  const ranked = [...players].sort((a, b) => a.totalScore - b.totalScore);

  return (
    <div
      data-testid="game-over"
      className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-950/80 backdrop-blur"
    >
      <div className="w-80 rounded-2xl border border-amber-400/40 bg-emerald-900 p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-amber-300">Game over</h2>
        <p className="mt-1 text-emerald-100">
          <span className="font-semibold">{winner?.name}</span> wins!
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {ranked.map((p) => (
            <li key={p.seat} className="flex justify-between text-emerald-50">
              <span>{p.name}</span>
              <span className="tabular-nums">{p.totalScore}</span>
            </li>
          ))}
        </ul>
        {onNewGame && (
          <button
            type="button"
            onClick={onNewGame}
            className="mt-5 rounded-full bg-amber-400 px-5 py-1.5 font-semibold text-emerald-950 hover:bg-amber-300"
          >
            New game
          </button>
        )}
      </div>
    </div>
  );
};
