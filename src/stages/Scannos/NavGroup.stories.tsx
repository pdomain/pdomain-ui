/**
 * NavGroup Storybook stories (Phase 2 M7).
 *
 * Covers:
 *   1. Collapsed        — header only; children not visible
 *   2. ExpandedWithChildren — expanded with sample nav items
 *   3. NoCount          — expanded, no count badge
 */

import React from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { NavGroup } from './NavGroup.js';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof NavGroup> = {
  title: 'Stages/Scannos/NavGroup',
  component: NavGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

// ─── Shared sample items ──────────────────────────────────────────────────────

const SampleItems = () => (
  <>
    <li
      style={{
        padding: '6px 20px',
        fontSize: 12.5,
        color: 'var(--ink-1)',
        fontWeight: 600,
        background: 'var(--bg-raised)',
        borderLeft: '2px solid var(--accent)',
        listStyle: 'none',
        cursor: 'pointer',
      }}
    >
      Apostrophes
    </li>
    <li
      style={{
        padding: '6px 20px',
        fontSize: 12.5,
        color: 'var(--ink-2)',
        fontWeight: 500,
        borderLeft: '2px solid transparent',
        listStyle: 'none',
        cursor: 'pointer',
      }}
    >
      Hyphens
    </li>
    <li
      style={{
        padding: '6px 20px',
        fontSize: 12.5,
        color: 'var(--ink-2)',
        fontWeight: 500,
        borderLeft: '2px solid transparent',
        listStyle: 'none',
        cursor: 'pointer',
      }}
    >
      Em-dashes
    </li>
  </>
);

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Collapsed: header only; children are hidden. Chevron points right.
 */
export const Collapsed: Story = {
  args: {
    label: 'Punctuation',
    count: 12,
    expanded: false,
  },
  render: (args) => (
    <div style={{ width: 240, background: 'var(--bg-page)' }}>
      <NavGroup {...args}>
        <SampleItems />
      </NavGroup>
    </div>
  ),
};

/**
 * ExpandedWithChildren: group open; all nav items visible.
 * Chevron points down.
 */
export const ExpandedWithChildren: Story = {
  args: {
    label: 'Punctuation',
    count: 12,
    expanded: true,
  },
  render: (args) => (
    <div style={{ width: 240, background: 'var(--bg-page)' }}>
      <NavGroup {...args}>
        <SampleItems />
      </NavGroup>
    </div>
  ),
};

/**
 * NoCount: expanded, count badge omitted entirely.
 */
export const NoCount: Story = {
  args: {
    label: 'Dictionary Rules',
    expanded: true,
  },
  render: (args) => (
    <div style={{ width: 240, background: 'var(--bg-page)' }}>
      <NavGroup {...args}>
        <SampleItems />
      </NavGroup>
    </div>
  ),
};
