/**
 * AttributesPanel stories — DCArtboard coverage.
 *
 * Source: docs/templates/design_handoff_pdomain_ui/final/projects/projects.jsx
 * Component: AttributesPanel — PGDP-level project attributes.
 *
 * DCArtboard variants covered:
 *   D1 · Default dark — all sections open, sample project
 *   D2 · Light theme — same project, [data-theme="light"] wrapper
 *   D3 · Partially collapsed — bib + pgdp collapsed, fmt + comments open
 *   D4 · All collapsed — every section closed
 *   D5 · Custom actions slot — sectionActions override for 'bib'
 *   D6 · Custom comments slot (children) — replaced default comments body
 *   D7 · Minimal project shape — only id/title/author required fields
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AttributesPanel } from './AttributesPanel.js';

const meta: Meta<typeof AttributesPanel> = {
  title: 'Primitives/AttributesPanel',
  component: AttributesPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof AttributesPanel>;

// ─── Sample data ──────────────────────────────────────────────────────────────

const austen = {
  id: 'austen-emma-vol2',
  title: 'Emma · Vol. II',
  author: 'Jane Austen',
};

const dickens = {
  id: 'dickens-pickwick',
  title: 'The Pickwick Papers',
  author: 'Charles Dickens',
};

// ─── DCArtboard: D1 · Default dark — all sections open ───────────────────────
// Source: projects.jsx → AttributesPanel, tab "attributes", default open state.

export const DefaultAllOpen: Story = {
  name: 'D1 · Default dark · all sections open',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <AttributesPanel project={austen} />
    </div>
  ),
};

// ─── DCArtboard: D2 · Light theme ────────────────────────────────────────────

export const LightTheme: Story = {
  name: 'D2 · Light theme · all sections open',
  render: () => (
    <div
      data-theme="light"
      style={{ maxWidth: 900, background: 'var(--bg-page)', padding: 24, borderRadius: 8 }}
    >
      <AttributesPanel project={austen} />
    </div>
  ),
};

// ─── DCArtboard: D3 · Partially collapsed ─────────────────────────────────────
// bib + pgdp collapsed; fmt + comments open (uncontrolled initial state achieved
// by clicking programmatically in a story wrapper).

export const PartiallyCollapsed: Story = {
  name: 'D3 · Partially collapsed · fmt + comments open',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [key, setKey] = React.useState(0);
    // Wrap in a controlled story that pre-collapses bib + pgdp by default.
    // We achieve this by rendering in a simple wrapper — AttributesPanel's
    // internal state defaults to all-open, so we reset via key (for story demos).
    return (
      <div style={{ maxWidth: 900 }}>
        <p style={{ marginBottom: 12, fontSize: 12, color: 'var(--ink-3)' }}>
          Click the &quot;Bibliographic&quot; and &quot;PGDP project&quot; headers to collapse them.
        </p>
        <AttributesPanel key={key} project={austen} />
        <button
          type="button"
          style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-3)' }}
          onClick={() => setKey((k) => k + 1)}
        >
          Reset
        </button>
      </div>
    );
  },
};

// ─── DCArtboard: D4 · All collapsed ──────────────────────────────────────────
// Demonstrates the collapsed chevron state for all four sections.

export const AllCollapsed: Story = {
  name: 'D4 · All sections collapsed',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const ref = React.useRef<HTMLDivElement>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    React.useEffect(() => {
      if (!ref.current) return;
      const buttons = ref.current.querySelectorAll<HTMLElement>('[role="button"]');
      buttons.forEach((btn) => btn.click());
    }, []);
    return (
      <div style={{ maxWidth: 900 }}>
        <AttributesPanel ref={ref} project={dickens} />
      </div>
    );
  },
};

// ─── DCArtboard: D5 · Custom actions slot ────────────────────────────────────
// sectionActions override: 'bib' gets a "History" button instead of "Edit".

export const CustomActionsSlot: Story = {
  name: 'D5 · Custom sectionActions slot · bib overridden',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <AttributesPanel
        project={austen}
        sectionActions={{
          bib: (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ color: 'var(--accent)' }}
            >
              History
            </button>
          ),
        }}
      />
    </div>
  ),
};

// ─── DCArtboard: D6 · Custom comments slot (children) ────────────────────────
// children replaces the default comments body.

export const CustomCommentsSlot: Story = {
  name: 'D6 · Custom comments body (children slot)',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <AttributesPanel project={dickens}>
        <div
          style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, padding: '14px 16px' }}
        >
          <p>
            Preserve all original Dickens spellings. Chapter headings are styled with small-caps.
          </p>
          <p style={{ marginTop: 8 }}>
            Footnote anchors:{' '}
            <span className="mono" style={{ color: 'var(--ink-1)' }}>
              [Note 3]
            </span>{' '}
            inline, and{' '}
            <span className="mono" style={{ color: 'var(--ink-1)' }}>
              [Footnote 3: …]
            </span>{' '}
            at the page bottom.
          </p>
        </div>
      </AttributesPanel>
    </div>
  ),
};

// ─── DCArtboard: D7 · Minimal project shape ───────────────────────────────────
// Only the three required fields are supplied. All optional metadata uses defaults.

export const MinimalProject: Story = {
  name: 'D7 · Minimal project shape · id + title + author only',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <AttributesPanel
        project={{
          id: 'belloc-survivals',
          title: 'Survivals & New Arrivals',
          author: 'Hilaire Belloc',
        }}
      />
    </div>
  ),
};
