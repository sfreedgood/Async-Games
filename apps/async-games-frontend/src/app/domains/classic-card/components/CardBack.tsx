export interface CardBackProps {
  /** Card height/width scale relative to the standard face (1 = h-48 w-32). */
  className?: string;
}

/**
 * The back of a playing card — an emerald patterned panel matching the table
 * felt theme. Used to represent opponents' hidden cards.
 */
export const CardBack = ({ className = '' }: CardBackProps) => (
  <div
    aria-label="face-down card"
    className={`h-48 w-32 rounded-lg border border-emerald-300/40 shadow-lg ${className}`}
    style={{
      backgroundColor: '#065f46',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 6px, transparent 6px 12px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0 6px, transparent 6px 12px)',
    }}
  >
    <div className="m-2 h-[calc(100%-1rem)] rounded-md border border-emerald-200/30" />
  </div>
);
