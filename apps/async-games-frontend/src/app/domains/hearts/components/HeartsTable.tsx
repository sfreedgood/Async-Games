import { useEffect, useMemo, useState } from 'react';
import { FannedHand } from '../../classic-card';
import { PlayerBadge } from '../../player/components/PlayerBadge';
import {
  cardKey,
  type CardRef,
  type HeartsGameView,
  type HeartsPlayerView,
} from '../entities';
import { OpponentHand } from './OpponentHand';
import { TrickArea } from './TrickArea';
import { Scoreboard } from './Scoreboard';
import { PassPhasePanel } from './PassPhasePanel';
import { GameOverBanner } from './GameOverBanner';

const CARDS_TO_PASS = 3;

export interface HeartsTableProps {
  view: HeartsGameView;
  onPlay: (card: CardRef) => void;
  onPass: (cards: CardRef[]) => void;
  error?: string | null;
  onNewGame?: () => void;
}

const OpponentSeat = ({
  player,
  orientation,
  active,
}: {
  player: HeartsPlayerView;
  orientation: 'horizontal' | 'vertical';
  active: boolean;
}) => (
  <div
    data-testid={`opponent-seat-${player.seat}`}
    className={`flex flex-col items-center gap-1 rounded-lg border bg-emerald-950/40 p-2 ${
      active ? 'border-amber-400' : 'border-emerald-500/30'
    }`}
  >
    <span className="text-xs font-semibold text-emerald-50">{player.name}</span>
    <OpponentHand count={player.handCount} orientation={orientation} />
    <span className="text-[10px] text-emerald-100/60">
      {player.totalScore} pts
    </span>
  </div>
);

/** The full Hearts table, driven entirely by authoritative server state. */
export const HeartsTable = ({
  view,
  onPlay,
  onPass,
  error,
  onNewGame,
}: HeartsTableProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  // Reset pass selection whenever the phase or round changes.
  useEffect(() => {
    setSelected([]);
  }, [view.phase, view.roundNumber]);

  const isPassing = view.phase === 'passing';
  const isYourTurn = view.phase === 'playing' && view.currentTurn === 0;

  const legalKeys = useMemo(
    () => new Set(view.legalMoves.map(cardKey)),
    [view.legalMoves]
  );

  const handLegalKeys = isPassing
    ? new Set(view.yourHand.map(cardKey))
    : isYourTurn
    ? legalKeys
    : new Set<string>();

  const handleCardClick = (card: CardRef) => {
    const key = cardKey(card);
    if (isPassing) {
      setSelected((prev) =>
        prev.includes(key)
          ? prev.filter((k) => k !== key)
          : prev.length >= CARDS_TO_PASS
          ? prev
          : [...prev, key]
      );
    } else if (isYourTurn && legalKeys.has(key)) {
      onPlay(card);
    }
  };

  const submitPass = () => {
    const cards = view.yourHand.filter((c) => selected.includes(cardKey(c)));
    onPass(cards);
  };

  const status =
    view.phase === 'finished'
      ? 'Game over'
      : isPassing
      ? 'Select cards to pass'
      : isYourTurn
      ? 'Your turn — play a card'
      : `Waiting for ${view.players[view.currentTurn].name}`;

  return (
    <div className="relative flex h-screen flex-col bg-emerald-900 text-emerald-50">
      <Scoreboard
        className="absolute right-3 top-3 z-10"
        players={view.players}
        currentTurn={view.currentTurn}
        roundNumber={view.roundNumber}
      />

      {/* North opponent */}
      <div className="flex justify-center pt-3">
        <OpponentSeat
          player={view.players[2]}
          orientation="horizontal"
          active={view.currentTurn === 2}
        />
      </div>

      {/* West | centre | East */}
      <div className="flex flex-1 items-center justify-between px-4">
        <OpponentSeat
          player={view.players[1]}
          orientation="vertical"
          active={view.currentTurn === 1}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            data-testid="turn-status"
            className="rounded-full bg-emerald-950/60 px-4 py-1 text-sm font-semibold"
          >
            {status}
          </div>
          <TrickArea trick={view.currentTrick} players={view.players} />
          {view.heartsBroken && (
            <span className="text-xs text-red-300">♥ hearts broken</span>
          )}
        </div>
        <OpponentSeat
          player={view.players[3]}
          orientation="vertical"
          active={view.currentTurn === 3}
        />
      </div>

      {/* South — the human seat */}
      <div className="flex flex-col items-center gap-3 pb-4">
        {isPassing && (
          <PassPhasePanel
            direction={view.passDirection}
            selectedCount={selected.length}
            required={CARDS_TO_PASS}
            onSubmit={submitPass}
          />
        )}
        {error && (
          <div data-testid="move-error" className="text-sm text-red-300">
            {error}
          </div>
        )}
        <div data-testid="local-hand">
          <FannedHand
            cards={view.yourHand}
            legalKeys={handLegalKeys}
            selectedKeys={new Set(selected)}
            onCardClick={handleCardClick}
          />
        </div>
        <PlayerBadge name={view.players[0].name} isLocalPlayer />
      </div>

      {view.phase === 'finished' && view.winnerSeat !== null && (
        <GameOverBanner
          winnerSeat={view.winnerSeat}
          players={view.players}
          onNewGame={onNewGame}
        />
      )}
    </div>
  );
};
