import { PlayingCardFace, type PlayingCardRef } from './PlayingCardFace';

export const cardKey = (card: PlayingCardRef): string =>
  `${card.name}-${card.suit}`;

export interface FannedHandProps {
  cards: PlayingCardRef[];
  /** If provided, cards whose key is absent are rendered disabled. */
  legalKeys?: Set<string>;
  /** Keys of cards currently selected (e.g. for passing). */
  selectedKeys?: Set<string>;
  onCardClick?: (card: PlayingCardRef) => void;
  /** Degrees of rotation between adjacent cards. */
  spread?: number;
  /** Horizontal overlap between adjacent cards, in pixels. */
  overlap?: number;
}

/**
 * Lays a hand out as an overlapping, slightly arced fan of face-up cards.
 * Each card fans from the bottom-centre so the hand curves like real cards.
 */
export const FannedHand = ({
  cards,
  legalKeys,
  selectedKeys,
  onCardClick,
  spread = 5,
  overlap = 56,
}: FannedHandProps) => {
  const mid = (cards.length - 1) / 2;

  return (
    <div className="flex items-end justify-center" role="list">
      {cards.map((card, i) => {
        const offset = i - mid;
        const rotation = offset * spread;
        const lift = Math.abs(offset) * 6;
        const key = cardKey(card);
        const disabled = legalKeys ? !legalKeys.has(key) : false;

        return (
          <div
            key={key}
            role="listitem"
            className="hover:z-10"
            style={{
              marginLeft: i === 0 ? 0 : -overlap,
              transform: `rotate(${rotation}deg) translateY(${lift}px)`,
              transformOrigin: 'bottom center',
            }}
          >
            <PlayingCardFace
              card={card}
              disabled={disabled}
              selected={selectedKeys?.has(key) ?? false}
              onClick={onCardClick}
            />
          </div>
        );
      })}
    </div>
  );
};
