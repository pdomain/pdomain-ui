/**
 * PageAttributesPanel — Phase 2 M2 (PageWorkbench right-drawer §6.2).
 *
 * Expanded-form sibling of PageAttributesBar. Renders the full attribute set
 * as a vertical stacked-form panel inside the right drawer, for sustained
 * attribute editing. Shares the PageAttribute data model.
 *
 * Each row: label + inline editor (text input / number input / select per
 * attr.editor). Read-only attrs render as plain label: value rows with no
 * editor. onChange fires on input commit (blur, Enter, or select change —
 * NOT on every keystroke).
 */
import * as React from 'react';
import { Input } from '../../primitives/Input.js';
import type { PageAttribute } from './PageAttributesBar.js';

// ── Public types ──────────────────────────────────────────────────────────────

export interface PageAttributesPanelProps {
  attrs: ReadonlyArray<PageAttribute>;
  onChange: (id: string, nextValue: string) => void;
  /** Optional header title. Default: "Page attributes". */
  title?: string;
  'data-testid'?: string;
}

// ── Internal: single attr row ─────────────────────────────────────────────────

interface AttrRowProps {
  attr: PageAttribute;
  onChange: (id: string, nextValue: string) => void;
  rowTestId: string;
}

function AttrRow({ attr, onChange, rowTestId }: AttrRowProps): React.ReactElement {
  const [draft, setDraft] = React.useState(attr.value);

  // Sync draft when controlled value changes externally. Adjusted during
  // render rather than in an effect, per "adjusting state when a prop changes".
  const [prevAttrValue, setPrevAttrValue] = React.useState(attr.value);
  if (attr.value !== prevAttrValue) {
    setPrevAttrValue(attr.value);
    setDraft(attr.value);
  }

  const handleCommit = React.useCallback(() => {
    if (draft !== attr.value) {
      onChange(attr.id, draft);
    }
  }, [attr.id, attr.value, draft, onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      }
    },
    [handleCommit],
  );

  const handleSelectChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value;
      setDraft(next);
      onChange(attr.id, next);
    },
    [attr.id, onChange],
  );

  const mode = attr.editor ?? 'text';
  const isReadOnly = attr.readOnly === true;

  return (
    <li className="page-attributes-panel__row" data-testid={rowTestId}>
      <span className="page-attributes-panel__row-label">{attr.label}</span>

      {isReadOnly ? (
        <span className="page-attributes-panel__row-value page-attributes-panel__row-value--readonly">
          {attr.value}
        </span>
      ) : mode === 'select' && attr.options !== undefined ? (
        <select
          className="page-attributes-panel__row-select"
          value={draft}
          aria-label={`Edit ${attr.label}`}
          onChange={handleSelectChange}
        >
          {attr.options.map((opt: { value: string; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={mode === 'number' ? 'number' : 'text'}
          className="page-attributes-panel__row-input"
          value={draft}
          aria-label={`Edit ${attr.label}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
}

AttrRow.displayName = 'AttrRow';

// ── Component ─────────────────────────────────────────────────────────────────

export function PageAttributesPanel({
  attrs,
  onChange,
  title = 'Page attributes',
  'data-testid': testId = 'page-attributes-panel',
}: PageAttributesPanelProps): React.ReactElement {
  return (
    <aside className="page-attributes-panel" data-testid={testId}>
      <header className="page-attributes-panel__header">
        <span className="page-attributes-panel__title">{title}</span>
      </header>

      {attrs.length > 0 ? (
        <ul className="page-attributes-panel__list">
          {attrs.map((attr) => (
            <AttrRow
              key={attr.id}
              attr={attr}
              onChange={onChange}
              rowTestId={`page-attr-panel-row-${attr.id}`}
            />
          ))}
        </ul>
      ) : (
        <div className="page-attributes-panel__empty">No attributes</div>
      )}
    </aside>
  );
}

PageAttributesPanel.displayName = 'PageAttributesPanel';
