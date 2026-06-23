export interface OpponentHandProps {
  count: number;
  orientation?: 'horizontal' | 'vertical';
}

const backStyle = {
  backgroundColor: '#065f46',
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 4px, transparent 4px 8px)',
};

/** A fan of face-down cards representing an opponent's hidden hand. */
export const OpponentHand = ({
  count,
  orientation = 'horizontal',
}: OpponentHandProps) => {
  const vertical = orientation === 'vertical';
  return (
    <div
      aria-label={`${count} cards`}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            ...backStyle,
            marginLeft: !vertical && i ? -18 : 0,
            marginTop: vertical && i ? -28 : 0,
          }}
          className="h-12 w-8 rounded border border-emerald-200/40 shadow"
        />
      ))}
    </div>
  );
};
