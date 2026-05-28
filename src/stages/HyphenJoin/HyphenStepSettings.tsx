import * as React from 'react';
import { Toggle } from '../../primitives/Toggle.js';
import {
  HYPHEN_STEP_SETTINGS,
  HYPHEN_STEP_SETTINGS_CACHE_SIZE,
  HYPHEN_STEP_SETTINGS_CACHE_TTL,
  HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HyphenRule {
  /** Stable rule identifier. */
  id: string;
  /** Human-readable label shown in the toggle list. */
  label: string;
  /** Whether this rule is active. */
  enabled: boolean;
}

export interface HyphenNgramCacheSettings {
  /** Maximum cache size in megabytes. */
  sizeMB: number;
  /** Cache entry TTL in minutes. */
  ttlMinutes: number;
}

export interface HyphenThresholds {
  /**
   * Cases whose n-gram join confidence falls below this value are sent to
   * the review queue instead of being auto-joined.
   */
  autoFlagBelow: number;
}

export interface HyphenSettings {
  /** Rule library entries — each can be individually toggled on/off. */
  rules: HyphenRule[];
  /** N-gram corpus cache behaviour controls. */
  ngramCache: HyphenNgramCacheSettings;
  /** Auto-flag thresholds for the review queue. */
  thresholds: HyphenThresholds;
}

export interface HyphenStepSettingsProps {
  /** Current settings state. */
  settings: HyphenSettings;
  /** Called with the full updated settings object on any field change. */
  onChange: (next: HyphenSettings) => void;
  'data-testid'?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const HYPHEN_STEP_SETTINGS_DEFAULT: HyphenSettings = {
  rules: [
    { id: 'always-join-beginnings', label: 'Always-join beginnings', enabled: true },
    { id: 'always-join-endings', label: 'Always-join endings', enabled: true },
    { id: 'always-join-words', label: 'Always-join words', enabled: true },
    { id: 'always-keep-hyphens', label: 'Always-keep hyphens', enabled: true },
  ],
  ngramCache: {
    sizeMB: 32,
    ttlMinutes: 259200, // 180 days in minutes
  },
  thresholds: {
    autoFlagBelow: 0.95,
  },
};

// ─── Section subcomponents (internal) ─────────────────────────────────────────

interface SectionProps {
  title: string;
  sub?: string;
  children: React.ReactNode;
}

function Section({ title, sub, children }: SectionProps): React.ReactElement {
  return (
    <div className="hyphen-step-settings__section">
      <div className="hyphen-step-settings__section-header">
        <div className="hyphen-step-settings__section-title">{title}</div>
        {sub != null ? <div className="hyphen-step-settings__section-sub">{sub}</div> : null}
      </div>
      {children}
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  sub?: string;
  children: React.ReactNode;
}

function SettingsRow({ label, sub, children }: SettingsRowProps): React.ReactElement {
  return (
    <div className="hyphen-step-settings__row">
      <div className="hyphen-step-settings__row-info">
        <span className="hyphen-step-settings__field-label">{label}</span>
        {sub != null ? <span className="hyphen-step-settings__field-sub">{sub}</span> : null}
      </div>
      <div className="hyphen-step-settings__row-control">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HyphenStepSettings — Step Settings block for the HyphenJoin stage.
 *
 * Three sections:
 *   1. Rule library — toggle list to enable/disable each rule.
 *   2. N-gram cache controls — sizeMB and ttlMinutes numeric inputs.
 *   3. Auto-flag thresholds — join-confidence threshold numeric input.
 *
 * All field changes fire `onChange` with the entire updated `HyphenSettings`
 * object (immutable spread pattern — never mutates props).
 *
 * Design source: `docs/templates/design_handoff_pdomain_ui/final/hyphen_join/hyphen.jsx`
 * (HyphenStepSettings component, lines 176–421).
 */
export function HyphenStepSettings({
  settings,
  onChange,
  'data-testid': testid = HYPHEN_STEP_SETTINGS,
}: HyphenStepSettingsProps): React.ReactElement {
  // ── Rule handlers ──────────────────────────────────────────────────────────

  function handleRuleToggle(ruleId: string, checked: boolean): void {
    onChange({
      ...settings,
      rules: settings.rules.map((r) => (r.id === ruleId ? { ...r, enabled: checked } : r)),
    });
  }

  // ── Cache handlers ─────────────────────────────────────────────────────────

  function handleCacheSize(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = Number(e.target.value);
    const sizeMB =
      e.target.value === '' || isNaN(raw) || raw < 1 ? settings.ngramCache.sizeMB : raw;
    onChange({
      ...settings,
      ngramCache: { ...settings.ngramCache, sizeMB },
    });
  }

  function handleCacheTtl(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = Number(e.target.value);
    const ttlMinutes =
      e.target.value === '' || isNaN(raw) || raw < 1 ? settings.ngramCache.ttlMinutes : raw;
    onChange({
      ...settings,
      ngramCache: { ...settings.ngramCache, ttlMinutes },
    });
  }

  // ── Threshold handlers ─────────────────────────────────────────────────────

  function handleAutoFlagThreshold(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = Number(e.target.value);
    const autoFlagBelow =
      e.target.value === '' || isNaN(raw) || raw < 0
        ? settings.thresholds.autoFlagBelow
        : Math.min(raw, 1);
    onChange({
      ...settings,
      thresholds: { ...settings.thresholds, autoFlagBelow },
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="hyphen-step-settings" data-testid={testid}>
      <div className="hyphen-step-settings__header">
        <h2 className="hyphen-step-settings__title">Stage settings · Hyphen join</h2>
        <p className="hyphen-step-settings__subtitle">
          Which rule library to use, auto-flag thresholds for the queue, and how mismatched dashes
          are resolved at submission time.
        </p>
      </div>

      {/* ── Section 1: Rule library ─────────────────────────────────────── */}
      <Section
        title="Rule library"
        sub="The rules that decide what auto-joins, what waits for review, and what gets flagged."
      >
        <div className="hyphen-step-settings__rule-list">
          {settings.rules.map((rule) => (
            <div key={rule.id} className="hyphen-step-settings__rule-row">
              <span className="hyphen-step-settings__rule-label">{rule.label}</span>
              <Toggle
                checked={rule.enabled}
                onCheckedChange={(checked) => {
                  handleRuleToggle(rule.id, checked);
                }}
                label={rule.label}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 2: N-gram cache controls ────────────────────────────── */}
      <Section
        title="N-gram cache"
        sub="Controls the Google Books n-gram corpus cache used for auto-join confidence scoring."
      >
        <div className="hyphen-step-settings__rows">
          <SettingsRow label="Cache size (MB)" sub="Maximum disk space the n-gram cache may use.">
            <input
              type="number"
              min={1}
              step={1}
              className="hyphen-step-settings__number-input"
              value={settings.ngramCache.sizeMB}
              onChange={handleCacheSize}
              aria-label="Cache size in megabytes"
              data-testid={HYPHEN_STEP_SETTINGS_CACHE_SIZE}
            />
          </SettingsRow>

          <SettingsRow
            label="Cache TTL (minutes)"
            sub="Cached entries older than this are re-fetched on next use."
          >
            <input
              type="number"
              min={1}
              step={1}
              className="hyphen-step-settings__number-input"
              value={settings.ngramCache.ttlMinutes}
              onChange={handleCacheTtl}
              aria-label="Cache TTL in minutes"
              data-testid={HYPHEN_STEP_SETTINGS_CACHE_TTL}
            />
          </SettingsRow>
        </div>
      </Section>

      {/* ── Section 3: Auto-flag thresholds ─────────────────────────────── */}
      <Section
        title="Auto-flag thresholds"
        sub="Configure when cases go to the review queue instead of being auto-joined."
      >
        <div className="hyphen-step-settings__rows">
          <SettingsRow
            label="Auto-join confidence threshold"
            sub="Cases whose n-gram confidence falls below this value are sent to the review queue."
          >
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              className="hyphen-step-settings__number-input"
              value={settings.thresholds.autoFlagBelow}
              onChange={handleAutoFlagThreshold}
              aria-label="Auto-join confidence threshold"
              data-testid={HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD}
            />
          </SettingsRow>
        </div>
      </Section>
    </div>
  );
}

HyphenStepSettings.displayName = 'HyphenStepSettings';
