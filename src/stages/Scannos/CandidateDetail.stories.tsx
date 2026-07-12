/**
 * CandidateDetail Storybook stories (Phase 2 M7).
 *
 * Covers:
 *   1. FewContexts      — candidate with 2 contexts, confidence shown
 *   2. ManyContexts     — candidate with 5 contexts, "Show all 5" link visible
 *   3. NoConfidence     — candidate without a confidence score
 */

import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { CandidateDetail } from './CandidateDetail.js';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof CandidateDetail> = {
  title: 'Stages/Scannos/CandidateDetail',
  component: CandidateDetail,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onPromote: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CandidateDetail>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * FewContexts: 2 evidence contexts (≤ 3), confidence badge shown.
 * No "Show all" link should appear.
 */
export const FewContexts: Story = {
  args: {
    candidate: {
      id: 'cand-1',
      token: 'tbe',
      suggested: 'the',
      ruleId: 'common-typos-en',
      confidence: 0.87,
    },
    contexts: [
      { id: 'ctx-1', pageId: 'p.047', snippet: 'with a tbe pale gold of morning sun' },
      { id: 'ctx-2', pageId: 'p.048', snippet: 'her tbe habit of arriving early' },
    ],
  },
};

/**
 * ManyContexts: 5 evidence contexts — only first 3 are shown,
 * plus a "Show all 5" link.
 */
export const ManyContexts: Story = {
  args: {
    candidate: {
      id: 'cand-2',
      token: 'arid',
      suggested: 'and',
      ruleId: 'ocr-similar-glyphs',
      confidence: 0.72,
    },
    contexts: [
      { id: 'ctx-1', pageId: 'p.010', snippet: 'bread arid butter' },
      { id: 'ctx-2', pageId: 'p.023', snippet: 'salt arid pepper' },
      { id: 'ctx-3', pageId: 'p.031', snippet: 'men arid women' },
      { id: 'ctx-4', pageId: 'p.044', snippet: 'night arid day' },
      { id: 'ctx-5', pageId: 'p.057', snippet: 'black arid white' },
    ],
  },
};

/**
 * NoConfidence: candidate without a confidence score.
 * Only the token and suggestion are displayed; no percentage badge.
 */
export const NoConfidence: Story = {
  args: {
    candidate: {
      id: 'cand-3',
      token: 'colour',
      suggested: 'color',
    },
    contexts: [
      { id: 'ctx-1', pageId: 'p.011', snippet: 'the colour of the sky' },
      { id: 'ctx-2', pageId: 'p.019', snippet: 'a deep colour filled the room' },
      { id: 'ctx-3', pageId: 'p.022', snippet: 'she chose the colour carefully' },
    ],
  },
};
