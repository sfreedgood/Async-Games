import type { ClassicCardName, ClassicCardSuit } from '../entities/card';

export interface PlayingCardRef {
  name: ClassicCardName;
  suit: ClassicCardSuit;
}

export interface PlayingCardFaceProps {
  card: PlayingCardRef;
  /** Dims the card and blocks clicks (e.g. an illegal move). */
  disabled?: boolean;
  /** Raises the card to show it is picked (e.g. during the pass phase). */
  selected?: boolean;
  onClick?: (card: PlayingCardRef) => void;
}

const SUIT_GLYPH: Record<ClassicCardSuit, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
};

const isRedSuit = (suit: ClassicCardSuit): boolean =>
  suit === 'heart' || suit === 'diamond';

const FACE_RANKS = new Set<ClassicCardName>(['J', 'Q', 'K']);

/**
 * Pip coordinates (percent of the card face) for number cards. Pips in the
 * bottom half (y > 50) are rendered rotated 180° as on a real card.
 */
const PIP_LAYOUTS: Partial<Record<ClassicCardName, Array<[number, number]>>> = {
  '2': [[50, 18], [50, 82]],
  '3': [[50, 18], [50, 50], [50, 82]],
  '4': [[30, 18], [70, 18], [30, 82], [70, 82]],
  '5': [[30, 18], [70, 18], [50, 50], [30, 82], [70, 82]],
  '6': [[30, 18], [70, 18], [30, 50], [70, 50], [30, 82], [70, 82]],
  '7': [[30, 18], [70, 18], [50, 34], [30, 50], [70, 50], [30, 82], [70, 82]],
  '8': [[30, 18], [70, 18], [50, 34], [30, 50], [70, 50], [50, 66], [30, 82], [70, 82]],
  '9': [
    [30, 16], [70, 16], [30, 39], [70, 39], [50, 50],
    [30, 61], [70, 61], [30, 84], [70, 84],
  ],
  '10': [
    [30, 16], [70, 16], [50, 28], [30, 39], [70, 39],
    [30, 61], [70, 61], [50, 72], [30, 84], [70, 84],
  ],
};

const cornerIndex = (
  card: PlayingCardRef,
  glyph: string,
  position: 'tl' | 'br'
) => (
  <div
    className={`absolute flex flex-col items-center leading-none ${
      position === 'tl' ? 'top-1 left-1.5' : 'bottom-1 right-1.5 rotate-180'
    }`}
  >
    <span className="text-base font-bold">{card.name}</span>
    <span className="text-base">{glyph}</span>
  </div>
);

const CenterContent = ({
  card,
  glyph,
}: {
  card: PlayingCardRef;
  glyph: string;
}) => {
  if (card.name === 'A') {
    return (
      <span className="absolute inset-0 flex items-center justify-center text-5xl">
        {glyph}
      </span>
    );
  }

  if (FACE_RANKS.has(card.name)) {
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-md border-2 border-current px-3 py-1 text-3xl font-semibold">
          {card.name}
          <span className="ml-0.5 text-2xl align-middle">{glyph}</span>
        </span>
      </span>
    );
  }

  const pips = PIP_LAYOUTS[card.name] ?? [];
  return (
    <>
      {pips.map(([x, y], i) => (
        <span
          key={`${x}-${y}-${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-xl"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) ${y > 50 ? 'rotate(180deg)' : ''}`,
          }}
        >
          {glyph}
        </span>
      ))}
    </>
  );
};

/**
 * A CSS/Unicode-drawn standard playing-card face: corner rank+suit indices,
 * a canonical center pip layout for number cards, and a framed letter for
 * face cards. Red for hearts/diamonds, near-black for spades/clubs.
 */
export const PlayingCardFace = ({
  card,
  disabled = false,
  selected = false,
  onClick,
}: PlayingCardFaceProps) => {
  const glyph = SUIT_GLYPH[card.suit];
  const colorClass = isRedSuit(card.suit) ? 'text-red-600' : 'text-neutral-900';
  const interactive = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      aria-label={`${card.name} of ${card.suit}`}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={interactive ? () => onClick?.(card) : undefined}
      className={[
        'relative h-48 w-32 select-none rounded-lg border border-gray-300 bg-white shadow-lg',
        colorClass,
        'transition-transform duration-150',
        selected ? '-translate-y-4 ring-2 ring-amber-400' : '',
        interactive ? 'cursor-pointer hover:-translate-y-2' : '',
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {cornerIndex(card, glyph, 'tl')}
      <CenterContent card={card} glyph={glyph} />
      {cornerIndex(card, glyph, 'br')}
    </button>
  );
};
