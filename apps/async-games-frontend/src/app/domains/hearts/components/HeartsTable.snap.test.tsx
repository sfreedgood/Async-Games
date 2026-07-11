import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as tableStories from './HeartsTable.stories';
import * as componentStories from './HeartsComponents.stories';

const table = composeStories(tableStories);
const components = composeStories(componentStories);

describe('HeartsTable snapshots', () => {
  Object.entries(table).forEach(([name, Story]) => {
    it(`renders ${name}`, () => {
      const { asFragment } = render(<Story />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

describe('Hearts component snapshots', () => {
  Object.entries(components).forEach(([name, Story]) => {
    it(`renders ${name}`, () => {
      const { asFragment } = render(<Story />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
