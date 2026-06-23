import { render } from '@testing-library/react';

import { HeartsTable } from './HeartsTable';
import { TrickArea } from './TrickArea';
import { Scoreboard } from './Scoreboard';
import { PassPhasePanel } from './PassPhasePanel';
import * as tableStories from './HeartsTable.stories';
import { mockGameView } from '../entities';

/**
 * Storybook snapshot tests for the Hearts table. The HeartsTable story args
 * (per phase) are rendered through Jest with the shared default args merged in,
 * guarding the full-table composition against visual regressions.
 */
type Story = { args?: Record<string, unknown> };
const defaultArgs = (tableStories.default as Story).args ?? {};

describe('HeartsTable stories', () => {
  Object.entries(tableStories).forEach(([key, value]) => {
    if (key === 'default' || key === '__esModule') return;
    if (!value || typeof value !== 'object') return;
    const story = value as Story;
    it(`matches snapshot: ${key}`, () => {
      const props = { ...defaultArgs, ...story.args } as Record<string, unknown>;
      const { container } = render(
        <HeartsTable {...(props as Parameters<typeof HeartsTable>[0])} />
      );
      expect(container).toMatchSnapshot();
    });
  });
});

describe('Hearts component snapshots', () => {
  const view = mockGameView();

  it('TrickArea', () => {
    const { container } = render(
      <TrickArea trick={view.currentTrick} players={view.players} />
    );
    expect(container).toMatchSnapshot();
  });

  it('Scoreboard', () => {
    const { container } = render(
      <Scoreboard players={view.players} currentTurn={0} roundNumber={1} />
    );
    expect(container).toMatchSnapshot();
  });

  it('PassPhasePanel', () => {
    const { container } = render(
      <PassPhasePanel
        direction="left"
        selectedCount={2}
        required={3}
        onSubmit={() => undefined}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
