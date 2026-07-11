import type { HeartsPlayerView, SeatIndex } from '../entities';

export interface ScoreboardProps {
  players: HeartsPlayerView[];
  currentTurn: SeatIndex;
  roundNumber: number;
  className?: string;
}

/** A compact per-seat tally of round and total scores. */
export const Scoreboard = ({
  players,
  currentTurn,
  roundNumber,
  className = '',
}: ScoreboardProps) => (
  <div
    data-testid="scoreboard"
    className={`rounded-lg border border-emerald-500/40 bg-emerald-950/80 p-3 text-xs shadow-lg ${className}`}
  >
    <div className="mb-1 font-semibold uppercase tracking-wide text-emerald-100/70">
      Round {roundNumber + 1}
    </div>
    <table className="w-full">
      <thead>
        <tr className="text-emerald-100/60">
          <th className="text-left font-normal">Player</th>
          <th className="pl-4 text-right font-normal">Total</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p) => (
          <tr
            key={p.seat}
            className={p.seat === currentTurn ? 'text-amber-300' : 'text-emerald-50'}
          >
            <td className="text-left">
              {p.seat === currentTurn ? '▶ ' : ''}
              {p.name}
            </td>
            <td className="pl-4 text-right tabular-nums">{p.totalScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
