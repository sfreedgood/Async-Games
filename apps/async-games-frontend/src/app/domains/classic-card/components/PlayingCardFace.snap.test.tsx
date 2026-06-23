import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './PlayingCardFace.stories';

// Reuse the Storybook stories as the source of truth for component props.
const composed = composeStories(stories);

describe('PlayingCardFace snapshots', () => {
  Object.entries(composed).forEach(([name, Story]) => {
    it(`renders ${name}`, () => {
      const { asFragment } = render(<Story />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
