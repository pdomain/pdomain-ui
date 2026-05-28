import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CheckRow } from './CheckRow.js';
import type { CheckRowCheck } from './CheckRow.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseCheck: CheckRowCheck = {
  id: 'check-1',
  name: 'Spell check',
  state: 'pass',
};

const warnCheck: CheckRowCheck = {
  id: 'check-warn',
  name: 'Hyphen consistency',
  state: 'warn',
  affectedPages: [
    { id: 'p1', prefix: 'p001' },
    { id: 'p2', prefix: 'p002' },
    { id: 'p3', prefix: 'p003' },
  ],
};

const errorCheck: CheckRowCheck = {
  id: 'check-err',
  name: 'Character validation',
  state: 'error',
  affectedPages: [
    { id: 'p1', prefix: 'p001' },
    { id: 'p2', prefix: 'p002' },
  ],
};

const manyPagesCheck: CheckRowCheck = {
  id: 'check-many',
  name: 'Word count',
  state: 'warn',
  affectedPages: Array.from({ length: 9 }, (_, i) => ({
    id: `p${i + 1}`,
    prefix: `p00${i + 1}`,
  })),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CheckRow', () => {
  // State rendering — CheckIcon variant
  it('renders a CheckIcon with pass state', () => {
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    const icon = document.querySelector('[data-state="pass"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders a CheckIcon with warn state', () => {
    render(<CheckRow check={warnCheck} expanded={false} onToggle={() => undefined} />);
    const icon = document.querySelector('[data-state="warn"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders a CheckIcon with error state', () => {
    render(<CheckRow check={errorCheck} expanded={false} onToggle={() => undefined} />);
    const icon = document.querySelector('[data-state="error"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders a CheckIcon with running state', () => {
    const check: CheckRowCheck = { id: 'r', name: 'Running check', state: 'running' };
    render(<CheckRow check={check} expanded={false} onToggle={() => undefined} />);
    const icon = document.querySelector('[data-state="running"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders a CheckIcon with skip state', () => {
    const check: CheckRowCheck = { id: 's', name: 'Skipped check', state: 'skip' };
    render(<CheckRow check={check} expanded={false} onToggle={() => undefined} />);
    const icon = document.querySelector('[data-state="skip"]');
    expect(icon).toBeInTheDocument();
  });

  // Name rendering
  it('renders the check name', () => {
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    expect(screen.getByText('Spell check')).toBeInTheDocument();
  });

  // Collapsed view — up to 5 page chips
  it('shows up to 5 PageChips in collapsed view', () => {
    render(<CheckRow check={warnCheck} expanded={false} onToggle={() => undefined} />);
    expect(screen.getByText('p001')).toBeInTheDocument();
    expect(screen.getByText('p002')).toBeInTheDocument();
    expect(screen.getByText('p003')).toBeInTheDocument();
  });

  it('shows "+N more" when there are more than 5 affected pages (collapsed)', () => {
    render(<CheckRow check={manyPagesCheck} expanded={false} onToggle={() => undefined} />);
    // 5 chips shown + "+4 more"
    expect(screen.getByText('+4 more')).toBeInTheDocument();
  });

  it('does not show "+N more" when there are 5 or fewer pages (collapsed)', () => {
    render(<CheckRow check={warnCheck} expanded={false} onToggle={() => undefined} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  // Expanded view — full page list
  it('shows full page list when expanded', () => {
    render(<CheckRow check={manyPagesCheck} expanded={true} onToggle={() => undefined} />);
    for (const page of manyPagesCheck.affectedPages ?? []) {
      expect(screen.getByText(page.prefix)).toBeInTheDocument();
    }
  });

  it('does not show "+N more" when expanded', () => {
    render(<CheckRow check={manyPagesCheck} expanded={true} onToggle={() => undefined} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  // Expand/collapse toggle via prop
  it('does not show page list in collapsed state when affectedPages empty', () => {
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('toggle button has role=button with aria-expanded=false when collapsed', () => {
    render(<CheckRow check={warnCheck} expanded={false} onToggle={() => undefined} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggle button has aria-expanded=true when expanded', () => {
    render(<CheckRow check={warnCheck} expanded={true} onToggle={() => undefined} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  // onToggle fires
  it('calls onToggle with the check id when button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<CheckRow check={warnCheck} expanded={false} onToggle={onToggle} />);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith('check-warn');
  });

  it('calls onToggle on Enter keypress', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<CheckRow check={warnCheck} expanded={false} onToggle={onToggle} />);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledWith('check-warn');
  });

  it('calls onToggle on Space keypress', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<CheckRow check={warnCheck} expanded={false} onToggle={onToggle} />);
    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledWith('check-warn');
  });

  // Testids
  it('renders VALIDATION_CHECK_ROW data-check-row attribute on root element', () => {
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    const el = document.querySelector('[data-check-row="validation-check-row"]');
    expect(el).toBeInTheDocument();
  });

  it('renders validationCheckRowTestId(id) as data-testid on root element', () => {
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    expect(screen.getByTestId('validation-check-row-check-1')).toBeInTheDocument();
  });

  // ── WS6: conditional aria-expanded ───────────────────────────────────────
  it('toggle button does NOT have aria-expanded when state=pass (non-expandable)', () => {
    // baseCheck has state='pass' → canToggle=false → aria-expanded must be absent
    render(<CheckRow check={baseCheck} expanded={false} onToggle={() => undefined} />);
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('aria-expanded');
  });

  it('toggle button does NOT have aria-expanded when state=running', () => {
    const runningCheck: CheckRowCheck = { id: 'c-run', name: 'Running check', state: 'running' };
    render(<CheckRow check={runningCheck} expanded={false} onToggle={() => undefined} />);
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('aria-expanded');
  });

  it('toggle button has aria-expanded when state=warn (expandable)', () => {
    render(<CheckRow check={warnCheck} expanded={false} onToggle={() => undefined} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });
});
