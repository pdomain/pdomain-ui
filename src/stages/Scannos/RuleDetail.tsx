import * as React from 'react';
import { StatTile } from '../../primitives/StatTile.js';
import { ToggleBadge } from '../../primitives/ToggleBadge.js';
import { Banner } from '../../primitives/Banner.js';
import {
  SCANNO_RULE_DETAIL,
  SCANNO_RULE_DETAIL_AUTO_APPLY,
  SCANNO_RULE_DETAIL_CONFLICTS,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RuleDetailConflict {
  id: string;
  description: string;
}

export interface RuleDetailRule {
  id: string;
  label: string;
  pattern: string;
  hitCount: number;
  contributingBooks: number;
  contributors: ReadonlyArray<string>;
  autoApply: boolean;
  conflicts?: ReadonlyArray<RuleDetailConflict>;
}

export interface RuleDetailProps {
  /** The scanno rule to display. */
  rule: RuleDetailRule;
  /** Fired when the user clicks the auto-apply toggle. Receives the NEW boolean state. */
  onToggleAutoApply: (next: boolean) => void;
  /** Override root testid; defaults to `SCANNO_RULE_DETAIL`. */
  'data-testid'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RuleDetail — Scannos right-pane rule library detail panel (Phase 2 M7).
 *
 * Shows rule label + pattern, 3 stat tiles (Hits / Books / Contributors),
 * an auto-apply ToggleBadge, and an optional conflicts warning Banner.
 *
 * Design source: wf05b/scanno-configure.jsx lines 290-406.
 */
export function RuleDetail({
  rule,
  onToggleAutoApply,
  'data-testid': testId = SCANNO_RULE_DETAIL,
}: RuleDetailProps): React.ReactElement {
  const hasConflicts = rule.conflicts != null && rule.conflicts.length > 0;

  function handleToggle(next: boolean): void {
    onToggleAutoApply(next);
  }

  return (
    <div className="rule-detail" data-testid={testId}>
      {/* ── Pattern header ──────────────────────────────────────────────── */}
      <div className="rule-detail__header">
        <div className="rule-detail__label">{rule.label}</div>
        <code className="rule-detail__pattern">{rule.pattern}</code>
      </div>

      {/* ── Stat tiles ──────────────────────────────────────────────────── */}
      <div className="rule-detail__stats">
        <StatTile label="Hits" value={String(rule.hitCount)} />
        <StatTile label="Books" value={String(rule.contributingBooks)} />
        <StatTile label="Contributors" value={String(rule.contributors.length)} />
      </div>

      {/* ── Auto-apply toggle ───────────────────────────────────────────── */}
      <div className="rule-detail__auto-apply">
        <ToggleBadge
          checked={rule.autoApply}
          onCheckedChange={handleToggle}
          label="Auto-apply"
          data-testid={SCANNO_RULE_DETAIL_AUTO_APPLY}
        />
        <span className="rule-detail__auto-apply-hint">
          {rule.autoApply
            ? 'Each match is auto-replaced. Original token retained in change log.'
            : 'Each match is highlighted; proofers decide per-instance. Recommended default.'}
        </span>
      </div>

      {/* ── Conflicts warning ────────────────────────────────────────────── */}
      {hasConflicts ? (
        <Banner tone="warning" headline="Conflict risk" data-testid={SCANNO_RULE_DETAIL_CONFLICTS}>
          <ul className="rule-detail__conflicts-list">
            {(rule.conflicts ?? []).map((c) => (
              <li key={c.id} className="rule-detail__conflict-item">
                {c.description}
              </li>
            ))}
          </ul>
        </Banner>
      ) : null}
    </div>
  );
}

RuleDetail.displayName = 'RuleDetail';
