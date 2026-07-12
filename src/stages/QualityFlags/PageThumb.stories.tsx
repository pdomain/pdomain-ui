import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { PageThumb } from './PageThumb.js';

const meta: Meta<typeof PageThumb> = {
  title: 'Stages/QualityFlags/PageThumb',
  component: PageThumb,
  parameters: {
    layout: 'centered',
  },
  args: {
    page: {
      id: 'p001',
      number: 12,
      thumbnailUrl: 'https://placehold.co/120x160/1e293b/94a3b8?text=p12',
    },
    flags: [],
    onSelect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof PageThumb>;

/** No quality flags — clean page thumbnail. */
export const Clean: Story = {
  args: {
    flags: [],
    selected: false,
  },
};

/** Three flag pills overlaid in the top-right corner. */
export const MultipleFlags: Story = {
  args: {
    flags: [
      { id: 'f1', label: 'blurry', kind: 'blurry' },
      { id: 'f2', label: 'skew', kind: 'skew' },
      { id: 'f3', label: 'dark', kind: 'dark' },
    ],
    selected: false,
  },
};

/** Selected state — visible selection border driven by tokens. */
export const Selected: Story = {
  args: {
    flags: [{ id: 'f1', label: 'blurry', kind: 'blurry' }],
    selected: true,
  },
};
