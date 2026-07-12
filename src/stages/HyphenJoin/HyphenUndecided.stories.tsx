import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { HyphenUndecided } from './HyphenUndecided.js';
import type { HJDecisionCase } from './HJDecisionCard.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CASES: HJDecisionCase[] = [
  {
    id: 'case-1',
    originalText: 'after-wards',
    joinProposal: 'afterwards',
    status: 'undecided',
    ngrams: [12, 18, 24, 21, 30, 28, 35],
  },
  {
    id: 'case-2',
    originalText: 'cross-bar',
    joinProposal: 'crossbar',
    status: 'flagged',
  },
  {
    id: 'case-3',
    originalText: 'to-day',
    joinProposal: 'today',
    status: 'undecided',
  },
  {
    id: 'case-4',
    originalText: 'some-where',
    joinProposal: 'somewhere',
  },
  {
    id: 'case-5',
    originalText: 'be-fore',
    joinProposal: 'before',
    status: 'undecided',
    ngrams: [5, 8, 10, 9, 12, 15],
  },
  {
    id: 'case-6',
    originalText: 'every-where',
    joinProposal: 'everywhere',
    status: 'undecided',
  },
  {
    id: 'case-7',
    originalText: 'never-theless',
    joinProposal: 'nevertheless',
    status: 'flagged',
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof HyphenUndecided> = {
  title: 'Stages/HyphenJoin/HyphenUndecided',
  component: HyphenUndecided,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSelect: fn(),
    onDecide: {
      onAccept: fn(),
      onKeep: fn(),
      onFlag: fn(),
      onNext: fn(),
      onPrev: fn(),
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HyphenUndecided>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Empty queue — no undecided cases remain.
 * Sidebar is blank; right pane shows the "No case selected" placeholder.
 */
export const EmptyQueue: Story = {
  name: 'EmptyQueue',
  args: {
    cases: [],
  },
};

/**
 * Many cases in the queue, none selected yet.
 * Sidebar lists all 7 cases with status pills where applicable.
 * Right pane shows "No case selected" placeholder.
 */
export const ManyCases: Story = {
  name: 'ManyCases',
  args: {
    cases: CASES,
  },
};

/**
 * One case selected — case-3 "to-day → today".
 * Sidebar highlights the active row; right pane shows HJDecisionCard.
 */
export const ItemSelected: Story = {
  name: 'ItemSelected',
  args: {
    cases: CASES,
    selectedId: 'case-3',
  },
};
