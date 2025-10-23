import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';
// import { expect } from 'storybook/test';

const meta = {
  component: Table,
  title: 'Table',
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof Table>;

export const Primary = {
  args: {},
} satisfies Story;

// export const Heading = {
//   args: {},
//   play: async ({ canvas }) => {
//     await expect(canvas.getByText(/Table/gi)).toBeTruthy();
//   },
// } satisfies Story;
