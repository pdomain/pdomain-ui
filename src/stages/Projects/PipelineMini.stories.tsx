/**
 * PipelineMini Storybook stories.
 *
 * Stories:
 *   1. EmptyFirst   — 23 stages, first stage active (just started)
 *   2. Midway       — 23 stages, stage 12 active, stages 0-11 done
 *   3. Complete     — 23 stages, all done (no active)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PipelineMini } from './PipelineMini.js';
import type { PipelineMiniStage, PipelineMiniStageStatus } from './PipelineMini.js';

// ─── Stage-name catalog (matches real pdomain-* pipeline) ────────────────────

const STAGE_IDS = [
  'source',
  'scan-check',
  'deskew',
  'crop',
  'grayscale',
  'threshold',
  'ocr-detect',
  'ocr-recog',
  'word-align',
  'line-join',
  'hyphen-join',
  'validation',
  'quality-flags',
  'scannos',
  'footnotes',
  'headers',
  'page-reorder',
  'page-workbench',
  'review',
  'ready',
  'submit',
  'post-process',
  'archive',
] as const;

function makeStages(activeIdx: number | null, doneUpTo: number): PipelineMiniStage[] {
  return STAGE_IDS.map((id, i) => {
    let status: PipelineMiniStageStatus = 'pending';
    if (i < doneUpTo) status = 'done';
    if (activeIdx !== null && i === activeIdx) status = 'active';
    return { id, label: id.replace(/-/g, ' '), status };
  });
}

const meta: Meta<typeof PipelineMini> = {
  title: 'Stages/Projects/PipelineMini',
  component: PipelineMini,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof PipelineMini>;

// ── EmptyFirst ────────────────────────────────────────────────────────────────

export const EmptyFirst: Story = {
  name: 'First stage active',
  args: {
    stages: makeStages(0, 0),
    activeStageId: 'source',
  },
};

// ── Midway ────────────────────────────────────────────────────────────────────

export const Midway: Story = {
  name: 'Midway (stage 12 active)',
  args: {
    stages: makeStages(11, 11),
    activeStageId: 'word-align',
  },
};

// ── Complete ──────────────────────────────────────────────────────────────────

export const Complete: Story = {
  name: 'All stages done',
  args: {
    stages: makeStages(null, 23),
  },
};
