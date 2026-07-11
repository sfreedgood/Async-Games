import { PlayingCardFace } from '../../classic-card';
import type { HeartsPlayerView, SeatIndex, TrickView } from '../entities';

export interface TrickAreaProps {
  trick: TrickView;
  players: HeartsPlayerView[];
  /** Seat whose card wins the completed trick; that card is highlighted. */
  winnerSeat?: SeatIndex | null;
}

const SEAT_POSITION: Record<SeatIndex, string> = {
  0: 'bottom-1 left-1/2 -translate-x-1/2',
  1: 'left-1 top-1/2 -translate-y-1/2',
  2: 'top-1 left-1/2 -translate-x-1/2',
  3: 'right-1 top-1/2 -translate-y-1/2',
};

/** The centre of the table: the up-to-four cards played in the current trick. */
export const TrickArea = ({ trick, players, winnerSeat }: TrickAreaProps) => (
  <div
    data-testid="trick-area"
    className="relative mx-auto flex h-64 w-80 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950/40 shadow-inner"
  >
    {trick.plays.length === 0 && (
      <span className="text-sm uppercase tracking-wide text-emerald-100/50">
        Waiting for the lead
      </span>
    )}
    {trick.plays.map(({ seat, card }) => {
      const isWinner = winnerSeat != null && seat === winnerSeat;
      return (
        <div
          key={`${seat}-${card.name}-${card.suit}`}
          data-testid={`trick-play-${seat}`}
          className={`absolute ${SEAT_POSITION[seat]} flex scale-75 flex-col items-center ${
            isWinner ? 'z-10 scale-90 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' : ''
          }`}
        >
          <div className={isWinner ? 'rounded-lg ring-4 ring-amber-400' : ''}>
            <PlayingCardFace card={card} />
          </div>
          <span className="mt-1 rounded bg-emerald-950/70 px-1.5 text-[10px] text-emerald-100/80">
            {players[seat]?.name}
          </span>
        </div>
      );
    })}
  </div>
);
