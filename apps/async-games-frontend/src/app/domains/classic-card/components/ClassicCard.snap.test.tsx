import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './ClassicCard.stories';

// Reuse the Storybook stories as the source of truth for component props.
const { ClassicPlayingCard, Joker } = composeStories(stories);

describe('ClassicCard snapshots', () => {
  it('renders the 2 of clubs', () => {
    const { asFragment } = render(<ClassicPlayingCard />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the Joker', () => {
    const { asFragment } = render(<Joker />);
    expect(asFragment()).toMatchSnapshot();
  });
});
