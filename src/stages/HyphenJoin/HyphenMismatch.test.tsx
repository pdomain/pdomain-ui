import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HyphenMismatch } from './HyphenMismatch.js';
import { HYPHEN_MISMATCH, hyphenMismatchRowTestId } from '../../testids/index.js';

const baseMismatch = {
  id: 'm1',
  word: 'to-day',
  decisions: [
    { source: 'dictionary', choice: 'join' },
    { source: 'user', choice: 'keep' },
  ],
  reason: 'Dictionary says join; user override says keep',
};

const mismatch2 = {
  id: 'm2',
  word: 'pre-war',
  decisions: [
    { source: 'auto', choice: 'join' },
    { source: 'corpus', choice: 'keep' },
  ],
};

describe('HyphenMismatch', () => {
  it('renders with HYPHEN_MISMATCH testid on root', () => {
    render(<HyphenMismatch mismatches={[baseMismatch]} />);
    expect(screen.getByTestId(HYPHEN_MISMATCH)).toBeTruthy();
  });

  it('renders the empty-state message when mismatches is empty', () => {
    render(<HyphenMismatch mismatches={[]} />);
    expect(screen.getByText(/no mismatches/i)).toBeTruthy();
  });

  it('does not render empty-state when mismatches are present', () => {
    render(<HyphenMismatch mismatches={[baseMismatch]} />);
    expect(screen.queryByText(/no mismatches/i)).toBeNull();
  });

  it('renders a row for each mismatch', () => {
    render(<HyphenMismatch mismatches={[baseMismatch, mismatch2]} />);
    expect(screen.getByTestId(hyphenMismatchRowTestId('m1'))).toBeTruthy();
    expect(screen.getByTestId(hyphenMismatchRowTestId('m2'))).toBeTruthy();
  });

  it('renders the word for each mismatch', () => {
    render(<HyphenMismatch mismatches={[baseMismatch, mismatch2]} />);
    expect(screen.getByText('to-day')).toBeTruthy();
    expect(screen.getByText('pre-war')).toBeTruthy();
  });

  it('renders decisions summary for each mismatch row', () => {
    render(<HyphenMismatch mismatches={[baseMismatch]} />);
    // decisions: dictionary→join, user→keep — each rendered as structured <dt>/<dd> pair
    // source appears as a <dt>, choice as a <dd>
    expect(screen.getByText('dictionary')).toBeTruthy();
    expect(screen.getByText('join')).toBeTruthy();
    expect(screen.getByText('user')).toBeTruthy();
    expect(screen.getByText('keep')).toBeTruthy();
  });

  it('renders reason when provided', () => {
    render(<HyphenMismatch mismatches={[baseMismatch]} />);
    expect(screen.getByText(baseMismatch.reason)).toBeTruthy();
  });

  it('does not render reason cell content when reason is absent', () => {
    render(<HyphenMismatch mismatches={[mismatch2]} />);
    // reason absent — no crash, no text for reason
    expect(screen.queryByText(/Dictionary says join/i)).toBeNull();
  });

  it('does not render Resolve button when onResolve is not provided', () => {
    render(<HyphenMismatch mismatches={[baseMismatch]} />);
    expect(screen.queryByRole('button', { name: /resolve/i })).toBeNull();
  });

  it('renders a Resolve button per row when onResolve is provided', () => {
    const onResolve = vi.fn();
    render(<HyphenMismatch mismatches={[baseMismatch, mismatch2]} onResolve={onResolve} />);
    const buttons = screen.getAllByRole('button', { name: /resolve/i });
    expect(buttons.length).toBe(2);
  });

  it('calls onResolve with the mismatch id when Resolve is clicked', () => {
    const onResolve = vi.fn();
    render(<HyphenMismatch mismatches={[baseMismatch]} onResolve={onResolve} />);
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith('m1');
  });

  it('accepts a custom data-testid override', () => {
    render(<HyphenMismatch mismatches={[]} data-testid="custom-mismatch" />);
    expect(screen.getByTestId('custom-mismatch')).toBeTruthy();
  });

  it('renders per-row testids correctly', () => {
    render(<HyphenMismatch mismatches={[baseMismatch, mismatch2]} />);
    expect(screen.getByTestId('hyphen-mismatch-row-m1')).toBeTruthy();
    expect(screen.getByTestId('hyphen-mismatch-row-m2')).toBeTruthy();
  });
});
