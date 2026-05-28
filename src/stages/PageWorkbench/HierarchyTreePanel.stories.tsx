/**
 * HierarchyTreePanel Storybook stories — Phase 2 M2.
 *
 * Covers: Default / Empty / DeepNested / WithSelection / Compact.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HierarchyTreePanel } from './HierarchyTreePanel.js';
import type { HierarchyTreePanelProps, TreeNode } from './HierarchyTreePanel.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FULL_TREE: ReadonlyArray<TreeNode> = [
  {
    id: 'block-1',
    type: 'block',
    label: 'Block 1 — Main body',
    children: [
      {
        id: 'para-1',
        type: 'paragraph',
        label: 'Paragraph 1',
        children: [
          {
            id: 'line-1',
            type: 'line',
            label: 'Line 1',
            children: [
              { id: 'word-1', type: 'word', label: 'Alice' },
              { id: 'word-2', type: 'word', label: 'was' },
              { id: 'word-3', type: 'word', label: 'beginning' },
            ],
          },
          {
            id: 'line-2',
            type: 'line',
            label: 'Line 2',
            children: [
              { id: 'word-4', type: 'word', label: 'to' },
              { id: 'word-5', type: 'word', label: 'get' },
              { id: 'word-6', type: 'word', label: 'very' },
            ],
          },
        ],
      },
      {
        id: 'para-2',
        type: 'paragraph',
        label: 'Paragraph 2',
        children: [
          {
            id: 'line-3',
            type: 'line',
            label: 'Line 3',
            children: [
              { id: 'word-7', type: 'word', label: 'tired' },
              { id: 'word-8', type: 'word', label: 'of' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'block-2',
    type: 'block',
    label: 'Block 2 — Caption',
    children: [
      {
        id: 'para-3',
        type: 'paragraph',
        label: 'Paragraph 3',
        children: [
          {
            id: 'line-4',
            type: 'line',
            label: 'Line 4',
            children: [
              { id: 'word-9', type: 'word', label: 'sitting' },
              { id: 'word-10', type: 'word', label: 'by' },
            ],
          },
        ],
      },
    ],
  },
];

const DEEP_TREE: ReadonlyArray<TreeNode> = [
  {
    id: 'd-block-1',
    type: 'block',
    label: 'Block (level 0)',
    children: [
      {
        id: 'd-para-1',
        type: 'paragraph',
        label: 'Paragraph (level 1)',
        children: [
          {
            id: 'd-line-1',
            type: 'line',
            label: 'Line (level 2)',
            children: [
              { id: 'd-word-1', type: 'word', label: 'Word (level 3)' },
              { id: 'd-word-2', type: 'word', label: 'Word (level 3)' },
            ],
          },
          {
            id: 'd-line-2',
            type: 'line',
            label: 'Line (level 2) — sibling',
            children: [{ id: 'd-word-3', type: 'word', label: 'Word (level 3)' }],
          },
        ],
      },
      {
        id: 'd-para-2',
        type: 'paragraph',
        label: 'Paragraph (level 1) — sibling',
        children: [
          {
            id: 'd-line-3',
            type: 'line',
            label: 'Line (level 2)',
            children: [{ id: 'd-word-4', type: 'word', label: 'Word (level 3)' }],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<HierarchyTreePanelProps> = {
  title: 'Stages/PageWorkbench/HierarchyTreePanel',
  component: HierarchyTreePanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<HierarchyTreePanelProps>;

// ---------------------------------------------------------------------------
// Default — full tree, all expanded
// ---------------------------------------------------------------------------

/**
 * Default — all nodes expanded, no selection, no type-change affordance.
 */
export const Default: Story = {
  args: {
    tree: FULL_TREE,
  },
};

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

/**
 * Empty — panel with no tree nodes; shows the empty-state message.
 */
export const Empty: Story = {
  args: {
    tree: [],
  },
};

// ---------------------------------------------------------------------------
// DeepNested
// ---------------------------------------------------------------------------

/**
 * DeepNested — block → paragraph → line → word nesting at full depth.
 */
export const DeepNested: Story = {
  args: {
    tree: DEEP_TREE,
  },
};

// ---------------------------------------------------------------------------
// WithSelection
// ---------------------------------------------------------------------------

function SelectionStory(): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | undefined>('word-2');
  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          fontSize: 12,
          color: 'var(--ink-3)',
          fontFamily: 'var(--mono-font)',
        }}
      >
        Selected: {selectedId ?? '(none)'}
      </div>
      <HierarchyTreePanel
        tree={FULL_TREE}
        {...(selectedId !== undefined ? { selectedId } : {})}
        onSelect={setSelectedId}
      />
    </div>
  );
}

/**
 * WithSelection — click any node row to select it; selected row is highlighted.
 */
export const WithSelection: StoryObj = {
  render: () => <SelectionStory />,
};

// ---------------------------------------------------------------------------
// Compact — defaultExpandedIds seeds only top-level blocks
// ---------------------------------------------------------------------------

/**
 * Compact — only top-level block nodes are expanded on first render;
 * demonstrates the `defaultExpandedIds` prop.
 */
export const Compact: Story = {
  args: {
    tree: FULL_TREE,
    defaultExpandedIds: ['block-1', 'block-2'],
  },
};

// ---------------------------------------------------------------------------
// WithTypeChange — interactive type selector
// ---------------------------------------------------------------------------

function TypeChangeStory(): React.ReactElement {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div>
      <HierarchyTreePanel
        tree={FULL_TREE}
        onTypeChange={(id, nextType) => {
          setLog((prev) => [`${id} → ${nextType}`, ...prev.slice(0, 4)]);
        }}
      />
      {log.length > 0 && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: 'var(--ink-3)',
            fontFamily: 'var(--mono-font)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Type changes:</div>
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * WithTypeChange — hover any row to reveal the type-change select control.
 */
export const WithTypeChange: StoryObj = {
  render: () => <TypeChangeStory />,
};
