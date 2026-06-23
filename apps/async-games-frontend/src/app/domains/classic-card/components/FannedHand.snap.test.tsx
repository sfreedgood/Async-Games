import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './FannedHand.stories';

const composed = composeStories(stories);

describe('FannedHand snapshots', () => {
  Object.entries(composed).forEach(([name, Story]) => {
    it(`renders ${name}`, () => {
      const { asFragment } = render(<Story />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
