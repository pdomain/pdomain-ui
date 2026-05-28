import type { Meta, StoryObj } from '@storybook/react';
import { HJDecisionCard } from './HJDecisionCard.js';
import type { HJDecisionCase } from './HJDecisionCard.js';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Stages/HyphenJoin/HJDecisionCard',
  component: HJDecisionCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HJDecisionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CASE_BASE: HJDecisionCase = {
  id: 'case-1',
  originalText: 'some-thing',
  joinProposal: 'something',
  ngrams: [3, 7, 12, 8, 5, 9, 14, 10, 6, 11],
};

const CASE_WITH_STATUS: HJDecisionCase = {
  id: 'case-2',
  originalText: 're-port',
  joinProposal: 'report',
  ngrams: [1, 4, 6, 5, 8, 7, 9, 8, 6, 10],
  status: 'undecided',
};

const CASE_NO_NGRAMS: HJDecisionCase = {
  id: 'case-3',
  originalText: 'cross-page',
  joinProposal: 'crosspage',
  status: 'cross-page',
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default state — case with n-gram sparkline, all action callbacks wired.
 * Press J/K/Y/N/F after clicking the card to exercise keyboard shortcuts.
 */
export const Default: Story = {
  args: {
    decisionCase: CASE_BASE,
    onAccept: () => console.log('accept'),
    onKeep: () => console.log('keep'),
    onFlag: () => console.log('flag'),
    onNext: () => console.log('next'),
    onPrev: () => console.log('prev'),
  },
};

/**
 * WithStatus — case with an explicit `status` so the HJStatusPill is visible.
 */
export const WithStatus: Story = {
  args: {
    decisionCase: CASE_WITH_STATUS,
    onAccept: () => console.log('accept'),
    onKeep: () => console.log('keep'),
    onFlag: () => console.log('flag'),
    onNext: () => console.log('next'),
    onPrev: () => console.log('prev'),
  },
};

/**
 * NoNgrams — case without ngrams data; sparkline is absent.
 */
export const NoNgrams: Story = {
  args: {
    decisionCase: CASE_NO_NGRAMS,
    onAccept: () => console.log('accept'),
    onKeep: () => console.log('keep'),
    onFlag: () => console.log('flag'),
    onNext: () => console.log('next'),
    onPrev: () => console.log('prev'),
  },
};

/**
 * ReadOnly — no action callbacks wired; buttons are present but no-ops.
 * Demonstrates the read-only / display-only usage of HJDecisionCard.
 */
export const ReadOnly: Story = {
  name: 'ReadOnly',
  args: {
    decisionCase: CASE_WITH_STATUS,
  },
};
