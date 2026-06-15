/**
 * ArtifactViewer Storybook stories.
 *
 * Required stories per §6.3:
 *   1. View — plain image, no overlay
 *   2. SplitMode — draggable vertical split
 *   3. IllustMode — two illustration bboxes highlighted
 *   4. WordsMode — word-level bboxes with confidence
 *   5. RotateMode — rotation handle overlay
 *   6. NarrowContainer — 320px wide (mobile-ish context)
 *   7. LargeImage — 4000×5000px source dimensions (scale stress test)
 *   8. WithViewportToolbar — controlled zoom and fit controls
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ZoomFitMode } from '../../viewport/index.js';
import { ArtifactViewer } from './ArtifactViewer.js';
import type { IllustBbox, WordBbox } from './ArtifactViewer.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Blank white PNG (1x1) as placeholder image
const BLANK_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

const WORD_BBOXES: WordBbox[] = [
  { id: 'w1', bbox: [0.11, 0.08, 0.12, 0.018], confidence: 0.98 },
  { id: 'w2', bbox: [0.25, 0.08, 0.08, 0.018], confidence: 0.95 },
  { id: 'w3', bbox: [0.35, 0.08, 0.1, 0.018], confidence: 0.87 },
  { id: 'w4', bbox: [0.11, 0.11, 0.15, 0.018], confidence: 0.92 },
  { id: 'w5', bbox: [0.28, 0.11, 0.09, 0.018], confidence: 0.76 },
  { id: 'w6', bbox: [0.4, 0.11, 0.11, 0.018], confidence: 0.45 },
  { id: 'w7', bbox: [0.11, 0.14, 0.07, 0.018], confidence: 0.99 },
  { id: 'w8', bbox: [0.2, 0.14, 0.13, 0.018], confidence: 0.93 },
  { id: 'w9', bbox: [0.4, 0.36, 0.09, 0.018], confidence: 0.31, selected: true },
];

const ILLUST_BBOXES: IllustBbox[] = [
  { id: 'ill1', bbox: [0.2, 0.24, 0.6, 0.38], label: 'plate image' },
  { id: 'ill2', bbox: [0.55, 0.68, 0.35, 0.14], label: 'caption' },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ArtifactViewer> = {
  title: 'Stages/PageWorkbench/ArtifactViewer',
  component: ArtifactViewer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ArtifactViewer>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * 1. View — plain image, no overlay.
 */
export const View: Story = {
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'view',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * 2. SplitMode — draggable vertical split line.
 * Uses a controlled splitX so the story shows a visible line.
 */
function SplitModeStory(args: React.ComponentProps<typeof ArtifactViewer>) {
  const [splitX, setSplitX] = useState(0.5);
  return (
    <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      <ArtifactViewer {...args} splitProposal={{ splitX, onSplitXChange: setSplitX }} />
    </div>
  );
}

export const SplitMode: Story = {
  render: (args) => <SplitModeStory {...args} />,
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'split',
  },
};

/**
 * 3. IllustMode — two illustration bboxes highlighted.
 */
export const IllustMode: Story = {
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'illust',
    illustBboxes: ILLUST_BBOXES,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * 4. WordsMode — word-level bboxes with confidence pips.
 * Selected word shown in mismatch color.
 */
export const WordsMode: Story = {
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'words',
    wordBboxes: WORD_BBOXES,
    onWordClick: (id: string) => {
      console.info('word clicked:', id);
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * 5. RotateMode — rotation handle overlay.
 */
function RotateModeStory(args: React.ComponentProps<typeof ArtifactViewer>) {
  const [deg, setDeg] = useState(0);
  return (
    <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ink-3)' }}>
        Rotation: {deg.toFixed(1)}&deg;
      </div>
      <ArtifactViewer {...args} rotationDeg={deg} onRotationChange={setDeg} />
    </div>
  );
}

export const RotateMode: Story = {
  render: (args) => <RotateModeStory {...args} />,
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'rotate',
    rotationDeg: 0,
  },
};

/**
 * 6. NarrowContainer — 320px wide (mobile-ish context).
 */
export const NarrowContainer: Story = {
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'view',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 320,
          height: 500,
          display: 'flex',
          flexDirection: 'column',
          border: '1px dashed var(--border-2)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/**
 * 7. LargeImage — 4000×5000px source dimensions (scale stress test).
 */
export const LargeImage: Story = {
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 4000,
    pageHeight: 5000,
    overlayMode: 'view',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * 8. WithViewportToolbar — controlled zoom and fit controls.
 */
function WithViewportToolbarStory(args: React.ComponentProps<typeof ArtifactViewer>) {
  const [zoom, setZoom] = useState(args.zoom ?? 1);
  const [fitMode, setFitMode] = useState<ZoomFitMode>(args.fitMode ?? 'none');

  return (
    <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <ArtifactViewer
        {...args}
        zoom={zoom}
        onZoomChange={setZoom}
        fitMode={fitMode}
        onFitModeChange={setFitMode}
        showViewportToolbar
      />
    </div>
  );
}

export const WithViewportToolbar: Story = {
  render: (args) => <WithViewportToolbarStory {...args} />,
  args: {
    imageSrc: BLANK_PNG,
    pageWidth: 2400,
    pageHeight: 3200,
    overlayMode: 'view',
    zoom: 1,
    fitMode: 'none',
    showViewportToolbar: true,
  },
};
