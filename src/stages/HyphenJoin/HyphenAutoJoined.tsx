import * as React from 'react';
import { Button } from '../../primitives/Button.js';
import { StatTile } from '../../primitives/StatTile.js';
import { Badge } from '../../primitives/Badge.js';
import { HJStatusPill } from './HJStatusPill.js';
import type { HJDecisionCase } from './HJDecisionCard.js';
import { HYPHEN_AUTO_JOINED, hyphenAutoJoinedGroupTestId } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A group of auto-joined decisions that all resolve to the same joined word.
 */
export interface HyphenAutoJoinedGroup {
  /** The resulting joined word (e.g. "without", "something"). */
  word: string;
  /** All auto-joined cases that produce this word. */
  cases: HJDecisionCase[];
}

export interface HyphenAutoJoinedProps {
  /**
   * Array of groups, each grouping auto-joined cases by their resulting word.
   * Pass an empty array to render the empty state.
   */
  groups: HyphenAutoJoinedGroup[];
  /**
   * Optional callback fired when the user confirms all cases in a group.
   * When provided, each group renders a "Validate group" button.
   * Receives the `word` string of the confirmed group.
   */
  onValidate?: ((groupWord: string) => void) | undefined;
  /** Optional override for the root testid. Defaults to `HYPHEN_AUTO_JOINED`. */
  'data-testid'?: string | undefined;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GroupSectionProps {
  group: HyphenAutoJoinedGroup;
  onValidate?: ((groupWord: string) => void) | undefined;
}

function GroupSection({ group, onValidate }: GroupSectionProps): React.ReactElement {
  const { word, cases } = group;

  return (
    <section
      data-testid={hyphenAutoJoinedGroupTestId(word)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-1)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Group header: word headline + count badge + optional validate button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-page)',
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', flex: 1 }}
        >
          {word}
        </span>
        <Badge
          tone="exact"
          mono
          style={{
            fontSize: 10.5,
            padding: '1px 7px',
          }}
        >
          {cases.length}
        </Badge>
        {onValidate != null ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Validate group: ${word}`}
            onClick={() => {
              onValidate(word);
            }}
          >
            Validate group
          </Button>
        ) : null}
      </div>

      {/* Case rows — compact list of contributing instances */}
      <ul
        style={{
          margin: 0,
          padding: '6px 0',
          listStyle: 'none',
        }}
      >
        {cases.map((c) => (
          <CaseRow key={c.id} decisionCase={c} />
        ))}
      </ul>
    </section>
  );
}

interface CaseRowProps {
  decisionCase: HJDecisionCase;
}

function CaseRow({ decisionCase }: CaseRowProps): React.ReactElement {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '5px 14px',
        borderBottom: '1px solid var(--border-1)',
      }}
    >
      {/* Original hyphenated text */}
      <span
        className="mono"
        style={{
          flex: 1,
          fontSize: 12.5,
          color: 'var(--ink-2)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {decisionCase.originalText}
      </span>

      {/* Arrow separator */}
      <span aria-hidden="true" style={{ color: 'var(--ink-4)', fontSize: 12 }}>
        →
      </span>

      {/* Join proposal */}
      <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-1)', fontWeight: 600 }}>
        {decisionCase.joinProposal}
      </span>

      {/* Status pill — only when status is present */}
      {decisionCase.status !== undefined ? <HJStatusPill status={decisionCase.status} /> : null}
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HyphenAutoJoined — grouped-by-word auto-join validation view.
 *
 * Renders a summary row of StatTiles (total cases, unique words) followed by
 * one collapsible-style group section per unique joined word. Each group shows:
 * - The joined word as a headline with a case-count Badge.
 * - An optional "Validate group" Button (when `onValidate` is provided).
 * - A compact list of contributing cases (original text → proposal + status pill).
 *
 * When `groups` is empty, renders an empty-state message.
 *
 * Design source:
 *   `docs/templates/design_handoff_pdomain_ui/final/hyphen_join/hyphen.jsx`
 *   §HyphenAutoJoined / AutoJoinedList (V5 — grouped-by-word validation).
 */
export function HyphenAutoJoined({
  groups,
  onValidate,
  'data-testid': testId = HYPHEN_AUTO_JOINED,
}: HyphenAutoJoinedProps): React.ReactElement {
  const totalCases = groups.reduce((sum, g) => sum + g.cases.length, 0);
  const groupCount = groups.length;

  if (groups.length === 0) {
    return (
      <section
        className="hyphen-auto-joined hyphen-auto-joined--empty"
        data-testid={testId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <p
          className="hyphen-auto-joined__empty-state"
          style={{ color: 'var(--ink-3)', fontSize: 13, margin: 0 }}
        >
          No auto-joined cases for this book.
        </p>
      </section>
    );
  }

  return (
    <section
      className="hyphen-auto-joined"
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Summary stat tiles */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <StatTile label="Auto-joined cases" value={String(totalCases)} tone="clean" />
        <StatTile label="Unique words" value={String(groupCount)} tone="neutral" />
      </div>

      {/* Group sections */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {groups.map((group) => (
          <GroupSection key={group.word} group={group} onValidate={onValidate} />
        ))}
      </div>
    </section>
  );
}

HyphenAutoJoined.displayName = 'HyphenAutoJoined';
