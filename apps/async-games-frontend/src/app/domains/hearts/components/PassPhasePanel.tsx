import { PASS_DIRECTION_LABEL, type PassDirection } from '../entities';

export interface PassPhasePanelProps {
  direction: PassDirection;
  selectedCount: number;
  required: number;
  onSubmit: () => void;
}

/** Prompt + submit control for the 3-card pass phase. */
export const PassPhasePanel = ({
  direction,
  selectedCount,
  required,
  onSubmit,
}: PassPhasePanelProps) => {
  const ready = selectedCount === required;
  return (
    <div
      data-testid="pass-panel"
      className="flex items-center gap-3 rounded-full border border-amber-400/40 bg-emerald-950/70 px-4 py-2 shadow-lg"
    >
      <span className="text-sm font-semibold text-amber-200">
        {PASS_DIRECTION_LABEL[direction]} — pick {required} cards
      </span>
      <span className="text-xs text-emerald-100/70">
        {selectedCount}/{required} selected
      </span>
      <button
        type="button"
        data-testid="pass-button"
        disabled={!ready}
        onClick={onSubmit}
        className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
          ready
            ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300'
            : 'cursor-not-allowed bg-emerald-800/60 text-emerald-100/40'
        }`}
      >
        Pass cards
      </button>
    </div>
  );
};
