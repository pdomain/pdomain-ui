/**
 * CropCard Storybook stories.
 *
 * Covers:
 *   1. SmallNoFlags — density='s', clean page, no flags
 *   2. MediumWithFlags — density='m', 3 flags (overflow to +1)
 *   3. LargeFiveFlags — density='l', 5 flags (4 shown + +1 overflow)
 *   4. WithBbox — shows the bbox overlay rectangle on the thumbnail
 *   5. Selected — selected=true drives aria-pressed + data-selected
 *   6. Interactive — onSelect handler logs to Actions panel
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { CropCard } from './CropCard.js';
import type { CropPage, CropFlagKind } from './CropCard.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// 1×1 grey PNG placeholder for thumbnail
const THUMB_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=';

const ALL_FLAGS: CropFlagKind[] = ['overCrop', 'underCrop', 'deskewFail', 'edgeNoise'];

const makePage = (overrides: Partial<CropPage> = {}): CropPage => ({
  id: 'p1',
  pageNumber: 7,
  thumbnailUrl: THUMB_PNG,
  status: 'clean',
  flags: [],
  ...overrides,
});

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof CropCard> = {
  title: 'Stages/Crop/CropCard',
  component: CropCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CropCard>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/** SmallNoFlags: density='s', no flags, clean status. Only count badge area (empty). */
export const SmallNoFlags: Story = {
  args: {
    page: makePage({ pageNumber: 1, status: 'clean' }),
    density: 's',
  },
};

/** MediumWithFlags: density='m', 3 flags — 2 chips shown, +1 overflow. */
export const MediumWithFlags: Story = {
  args: {
    page: makePage({
      pageNumber: 12,
      status: 'flagged',
      flags: ['overCrop', 'deskewFail', 'edgeNoise'],
    }),
    density: 'm',
  },
};

/** LargeFiveFlags: density='l', 5 flags — 4 chips shown, +1 overflow. */
export const LargeFiveFlags: Story = {
  args: {
    page: makePage({
      pageNumber: 23,
      status: 'flagged',
      flags: [...ALL_FLAGS, 'overCrop'],
    }),
    density: 'l',
  },
};

/** WithBbox: bbox overlay rectangle visible on the thumbnail image. */
export const WithBbox: Story = {
  args: {
    page: makePage({
      pageNumber: 8,
      status: 'reviewed',
      flags: ['underCrop'],
      bbox: { bbox: [0.05, 0.1, 0.9, 0.8] },
    }),
    density: 'l',
  },
};

/** Selected: shows selected state (aria-pressed + data-selected). */
export const Selected: Story = {
  args: {
    page: makePage({ pageNumber: 3, status: 'clean' }),
    density: 'm',
    selected: true,
  },
};

/** Interactive: all densities side-by-side, onSelect fires Actions panel. */
export const Interactive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      {(['s', 'm', 'l'] as const).map((density) => (
        <div key={density} style={{ textAlign: 'center' }}>
          <CropCard
            {...args}
            page={makePage({
              id: `p-${density}`,
              pageNumber: 4,
              status: 'flagged',
              flags: ['overCrop', 'deskewFail', 'edgeNoise'],
            })}
            density={density}
          />
          <small style={{ display: 'block', marginTop: '0.25rem' }}>density={density}</small>
        </div>
      ))}
    </div>
  ),
  args: {
    selected: false,
  },
};
