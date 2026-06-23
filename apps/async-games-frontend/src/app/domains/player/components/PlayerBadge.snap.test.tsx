import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './PlayerBadge.stories';

// Reuse the Storybook stories as the source of truth for component props.
const { PrimaryPlayer, OtherPlayer } = composeStories(stories);

describe('PlayerBadge snapshots', () => {
  it('renders the local (primary) player', () => {
    const { asFragment } = render(<PrimaryPlayer />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders another player', () => {
    const { asFragment } = render(<OtherPlayer />);
    expect(asFragment()).toMatchSnapshot();
  });
});
