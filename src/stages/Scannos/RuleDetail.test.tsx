import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RuleDetail } from './RuleDetail.js';
import {
  SCANNO_RULE_DETAIL,
  SCANNO_RULE_DETAIL_AUTO_APPLY,
  SCANNO_RULE_DETAIL_CONFLICTS,
} from '../../testids/index.js';

const baseRule = {
  id: 'rule-1',
  label: 'Scanno: teh → the',
  pattern: 'teh',
  hitCount: 42,
  contributingBooks: 7,
  contributors: ['alice', 'bob'],
  autoApply: false,
} as const;

describe('RuleDetail', () => {
  it('renders rule label and pattern', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    expect(screen.getByText('Scanno: teh → the')).toBeInTheDocument();
    expect(screen.getByText('teh')).toBeInTheDocument();
  });

  it('renders pattern inside a <code> element', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    const code = document.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('teh');
  });

  it('renders stat tiles for Hits, Books, Contributors', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    // Stat tile labels
    expect(screen.getByText('Hits')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Contributors')).toBeInTheDocument();
    // Stat tile values
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 contributors
  });

  it('shows contributors count as contributor length', () => {
    const rule = { ...baseRule, contributors: ['alice', 'bob', 'carol'] };
    render(<RuleDetail rule={rule} onToggleAutoApply={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onToggleAutoApply with negated value on toggle click', async () => {
    const onToggle = vi.fn();
    render(<RuleDetail rule={baseRule} onToggleAutoApply={onToggle} />);
    const toggle = screen.getByRole('switch');
    await userEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(true); // negated from false
  });

  it('calls onToggleAutoApply with false when autoApply is true', async () => {
    const onToggle = vi.fn();
    const rule = { ...baseRule, autoApply: true };
    render(<RuleDetail rule={rule} onToggleAutoApply={onToggle} />);
    const toggle = screen.getByRole('switch');
    await userEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('hides conflicts banner when conflicts array is absent', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    expect(screen.queryByTestId(SCANNO_RULE_DETAIL_CONFLICTS)).not.toBeInTheDocument();
  });

  it('hides conflicts banner when conflicts array is empty', () => {
    const rule = {
      ...baseRule,
      conflicts: [] as ReadonlyArray<{ id: string; description: string }>,
    };
    render(<RuleDetail rule={rule} onToggleAutoApply={vi.fn()} />);
    expect(screen.queryByTestId(SCANNO_RULE_DETAIL_CONFLICTS)).not.toBeInTheDocument();
  });

  it('shows conflicts banner when conflicts non-empty', () => {
    const rule = {
      ...baseRule,
      conflicts: [
        { id: 'c1', description: 'Overlaps with teh→tehse rule' },
        { id: 'c2', description: 'Conflicts with regex pattern \\bteh\\b' },
      ],
    };
    render(<RuleDetail rule={rule} onToggleAutoApply={vi.fn()} />);
    const banner = screen.getByTestId(SCANNO_RULE_DETAIL_CONFLICTS);
    expect(banner).toBeInTheDocument();
    expect(screen.getByText('Overlaps with teh→tehse rule')).toBeInTheDocument();
    expect(screen.getByText('Conflicts with regex pattern \\bteh\\b')).toBeInTheDocument();
  });

  it('renders root with correct testid', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    expect(screen.getByTestId(SCANNO_RULE_DETAIL)).toBeInTheDocument();
  });

  it('renders toggle with correct testid', () => {
    render(<RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} />);
    expect(screen.getByTestId(SCANNO_RULE_DETAIL_AUTO_APPLY)).toBeInTheDocument();
  });

  it('forwards custom data-testid to root element', () => {
    render(
      <RuleDetail rule={baseRule} onToggleAutoApply={vi.fn()} data-testid="custom-rule-detail" />,
    );
    expect(screen.getByTestId('custom-rule-detail')).toBeInTheDocument();
    expect(screen.queryByTestId(SCANNO_RULE_DETAIL)).toBeNull();
  });
});
