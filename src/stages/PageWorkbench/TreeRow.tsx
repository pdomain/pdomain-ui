/**
 * TreeRow — INTERNAL sub-component of HierarchyTreePanel.
 *
 * Not exported from the package barrel. Used only by HierarchyTreePanel.
 *
 * Phase 2 M2 — spec §6.2 line 344.
 */

import React from 'react';
import { Icon } from '../../icons/Icon.js';
import { Badge } from '../../primitives/Badge.js';
import type { BadgeTone } from '../../primitives/Badge.js';
import type { TreeNode, TreeNodeType } from './HierarchyTreePanel.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreeRowProps {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect?: () => void;
  onTypeChange?: (nextType: TreeNodeType) => void;
}

// ---------------------------------------------------------------------------
// Badge tone mapping
// ---------------------------------------------------------------------------

const TYPE_TONE: Record<TreeNodeType, BadgeTone> = {
  block: 'brand',
  paragraph: 'ocr',
  line: 'clean',
  word: 'neutral',
};

const TYPE_LABELS: ReadonlyArray<TreeNodeType> = ['block', 'paragraph', 'line', 'word'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Single row in the hierarchy tree.
 *
 * Renders: indent, expand toggle (when the node has children),
 * type badge, label, and an optional type-change `<select>` on hover.
 *
 * Internal — not exported from the package barrel.
 */
export function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
  selected,
  onSelect,
  onTypeChange,
}: TreeRowProps): React.ReactElement {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const tone = TYPE_TONE[node.type];

  return (
    <div
      className="tree-row"
      data-selected={selected}
      data-depth={depth}
      data-testid={`tree-row-${node.id}`}
      aria-selected={selected}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      tabIndex={0}
      style={{ paddingLeft: `${depth * 16}px` }}
      onClick={() => {
        onSelect?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && hasChildren) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Expand/collapse toggle — always tabIndex=-1; row itself is the focus stop.
          Arrow keys on the row dispatch toggle via keydown handler. */}
      <button
        type="button"
        className="tree-row__toggle"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggle();
        }}
        aria-hidden={!hasChildren}
        tabIndex={-1}
        disabled={!hasChildren}
      >
        {hasChildren ? (
          <Icon name={expanded ? 'chevD' : 'chevR'} size={14} />
        ) : (
          <span className="tree-row__toggle-placeholder" aria-hidden="true" />
        )}
      </button>

      {/* Type badge */}
      <Badge tone={tone} className="tree-row__badge">
        {node.type}
      </Badge>

      {/* Label */}
      <span className="tree-row__label">{node.label}</span>

      {/* Type-change select (visible on hover via CSS .tree-row__type-select) */}
      {onTypeChange != null ? (
        <select
          className="tree-row__type-select"
          value={node.type}
          aria-label={`Change type of ${node.label}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            onTypeChange(e.target.value as TreeNodeType);
          }}
        >
          {TYPE_LABELS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
