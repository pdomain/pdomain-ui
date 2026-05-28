import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Thumbnail } from './Thumbnail.js';

const PLACEHOLDER = 'https://placehold.co/120x160/1a1a2e/a0a0c0?text=Page';

const meta: Meta<typeof Thumbnail> = {
  title: 'Primitives/Thumbnail',
  component: Thumbnail,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    imageUrl: PLACEHOLDER,
    imageAlt: 'Page thumbnail',
    density: 'm',
  },
};
export default meta;

type Story = StoryObj<typeof Thumbnail>;

// ─── Minimal ──────────────────────────────────────────────────────────────────

export const Minimal: Story = {};

// ─── WithPageNumber ───────────────────────────────────────────────────────────

export const WithPageNumber: Story = {
  args: {
    pageNumber: '7',
  },
};

// ─── WithStatus ───────────────────────────────────────────────────────────────

export const WithStatus: Story = {
  args: {
    pageNumber: '3',
    statusSlot: (
      <span
        data-status="flagged"
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--fuzzy)',
        }}
      />
    ),
  },
};

// ─── Selected ────────────────────────────────────────────────────────────────

export const Selected: Story = {
  args: {
    pageNumber: '5',
    selected: true,
  },
};

// ─── Interactive ─────────────────────────────────────────────────────────────

function InteractiveThumbnail(): React.ReactElement {
  const [sel, setSel] = React.useState(false);
  return (
    <Thumbnail
      imageUrl={PLACEHOLDER}
      imageAlt="Page thumbnail"
      pageNumber="12"
      selected={sel}
      onClick={() => setSel((v) => !v)}
      onClickLabel="Open page 12"
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveThumbnail />,
};

// ─── FullSlots ────────────────────────────────────────────────────────────────

export const FullSlots: Story = {
  args: {
    pageNumber: '9',
    overlayTopLeft: <input type="checkbox" aria-label="Select page 9" defaultChecked />,
    overlayTopRight: (
      <span
        style={{
          fontSize: '10px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-1)',
          borderRadius: '3px',
          padding: '1px 4px',
          color: 'var(--ink-2)',
        }}
      >
        cover
      </span>
    ),
    overlayBottomLeft: (
      <span
        style={{
          fontSize: '10px',
          background: 'var(--fuzzy)',
          borderRadius: '3px',
          padding: '1px 4px',
          color: 'var(--bg-page)',
        }}
      >
        flagged
      </span>
    ),
    overlayBottomRight: (
      <span
        style={{
          fontSize: '10px',
          color: 'var(--ink-3)',
        }}
      >
        ~2s
      </span>
    ),
    imageOverlay: (
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <rect
          x="10%"
          y="10%"
          width="80%"
          height="80%"
          fill="none"
          stroke="var(--ocr)"
          strokeWidth="2"
        />
      </svg>
    ),
    footer: (
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          borderTop: '1px solid var(--border-1)',
        }}
      >
        <button
          type="button"
          style={{
            flex: 1,
            fontSize: '11px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-1)',
            borderRadius: '3px',
            padding: '2px 6px',
            color: 'var(--ink-1)',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            fontSize: '11px',
            background: 'var(--accent)',
            border: '1px solid transparent',
            borderRadius: '3px',
            padding: '2px 6px',
            color: 'var(--bg-page)',
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    ),
  },
};

// ─── WithRoleBadge ────────────────────────────────────────────────────────────

export const WithRoleBadge: Story = {
  args: {
    pageNumber: '1',
    overlayTopRight: (
      <span
        style={{
          fontSize: '10px',
          background: 'var(--accent)',
          borderRadius: '3px',
          padding: '1px 5px',
          color: 'var(--bg-page)',
          fontWeight: 600,
        }}
      >
        cover
      </span>
    ),
  },
};

// ─── SmallDensity ─────────────────────────────────────────────────────────────

export const SmallDensity: Story = {
  args: {
    pageNumber: '2',
    density: 's',
  },
};

// ─── LargeDensity ─────────────────────────────────────────────────────────────

export const LargeDensity: Story = {
  args: {
    pageNumber: '4',
    density: 'l',
    footer: (
      <div
        style={{
          padding: '6px 8px',
          borderTop: '1px solid var(--border-1)',
          fontSize: '12px',
          color: 'var(--ink-2)',
        }}
      >
        Role: page
      </div>
    ),
  },
};
