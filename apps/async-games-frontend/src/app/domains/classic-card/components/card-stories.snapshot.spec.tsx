import { ComponentType } from 'react';
import { render } from '@testing-library/react';

import { CardBack, FannedHand, PlayingCardFace } from '.';
import * as faceStories from './PlayingCardFace.stories';
import * as backStories from './CardBack.stories';
import * as fanStories from './FannedHand.stories';

/**
 * Storybook snapshot tests. The story modules only import Storybook *types*
 * (erased at compile time), so we can pull their args directly and render each
 * scenario through Jest — guarding the card components against unintended
 * visual regressions without depending on the Storybook runtime.
 */
type Story = { args?: Record<string, unknown> };

const groups: Array<{
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  stories: Record<string, unknown>;
}> = [
  {
    name: 'PlayingCardFace',
    Component: PlayingCardFace as ComponentType<Record<string, unknown>>,
    stories: faceStories,
  },
  {
    name: 'CardBack',
    Component: CardBack as ComponentType<Record<string, unknown>>,
    stories: backStories,
  },
  {
    name: 'FannedHand',
    Component: FannedHand as ComponentType<Record<string, unknown>>,
    stories: fanStories,
  },
];

groups.forEach(({ name, Component, stories }) => {
  describe(`${name} stories`, () => {
    Object.entries(stories).forEach(([key, value]) => {
      if (key === 'default' || key === '__esModule') return;
      if (!value || typeof value !== 'object') return;
      const story = value as Story;
      it(`matches snapshot: ${key}`, () => {
        const { container } = render(<Component {...(story.args ?? {})} />);
        expect(container).toMatchSnapshot();
      });
    });
  });
});
