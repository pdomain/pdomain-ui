/**
 * CandidateDetail Vitest tests (Phase 2 M7).
 *
 * Covers:
 *   - Candidate token and suggested value render
 *   - First 3 contexts are visible
 *   - Show-all link appears when contexts.length > 3
 *   - Show-all link absent when contexts.length <= 3
 *   - Editing the suggested input updates internal state
 *   - Promote click fires onPromote with the edited suggested value
 *   - Dismiss click fires onDismiss
 *   - Buttons are disabled when callbacks are absent
 *   - Testids are present on root and action buttons
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateDetail } from './CandidateDetail.js';
import {
  SCANNO_CANDIDATE_DETAIL,
  SCANNO_CANDIDATE_DETAIL_PROMOTE,
  SCANNO_CANDIDATE_DETAIL_DISMISS,
  SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT,
} from '../../testids/index.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const candidate = {
  id: 'cand-1',
  token: 'tbe',
  suggested: 'the',
  ruleId: 'common-typos',
  confidence: 0.87,
};

const candidateNoConf = {
  id: 'cand-2',
  token: 'wlth',
  suggested: 'with',
};

const fewContexts = [
  { id: 'ctx-1', pageId: 'p.001', snippet: 'he saw tbe cat' },
  { id: 'ctx-2', pageId: 'p.002', snippet: 'tbe quick fox' },
];

const manyContexts = [
  { id: 'ctx-1', pageId: 'p.001', snippet: 'he saw tbe cat' },
  { id: 'ctx-2', pageId: 'p.002', snippet: 'tbe quick fox' },
  { id: 'ctx-3', pageId: 'p.003', snippet: 'said tbe man' },
  { id: 'ctx-4', pageId: 'p.004', snippet: 'tbe last one' },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CandidateDetail', () => {
  // ─ Render basics ─────────────────────────────────────────────────────────

  it('renders the root element with SCANNO_CANDIDATE_DETAIL testid', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL)).toBeInTheDocument();
  });

  it('renders the candidate token text', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    // token appears multiple times (header + promote form); at least one instance
    expect(screen.getAllByText('tbe').length).toBeGreaterThan(0);
  });

  it('renders the suggested value in the input', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    const input = screen.getByTestId(SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT);
    expect(input).toHaveValue('the');
  });

  // ─ Confidence ────────────────────────────────────────────────────────────

  it('renders confidence as a percentage when present', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('does not render a confidence value when absent', () => {
    render(<CandidateDetail candidate={candidateNoConf} contexts={fewContexts} />);
    expect(screen.queryByText(/%$/)).toBeNull();
  });

  // ─ Contexts ──────────────────────────────────────────────────────────────

  it('renders all contexts when there are 3 or fewer', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByText('he saw tbe cat')).toBeInTheDocument();
    expect(screen.getByText('tbe quick fox')).toBeInTheDocument();
  });

  it('renders only the first 3 contexts when there are more than 3', () => {
    render(<CandidateDetail candidate={candidate} contexts={manyContexts} />);
    expect(screen.getByText('he saw tbe cat')).toBeInTheDocument();
    expect(screen.getByText('tbe quick fox')).toBeInTheDocument();
    expect(screen.getByText('said tbe man')).toBeInTheDocument();
    expect(screen.queryByText('tbe last one')).toBeNull();
  });

  it('renders Show-all link when contexts.length > 3', () => {
    render(<CandidateDetail candidate={candidate} contexts={manyContexts} />);
    expect(screen.getByText(/show all 4/i)).toBeInTheDocument();
  });

  it('does not render Show-all link when contexts.length <= 3', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.queryByText(/show all/i)).toBeNull();
  });

  // ─ Suggested input editing ───────────────────────────────────────────────

  it('editing the suggested input updates the displayed value', async () => {
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onPromote={vi.fn()} />);
    const input = screen.getByTestId(SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT);
    await user.clear(input);
    await user.type(input, 'thee');
    expect(input).toHaveValue('thee');
  });

  // ─ Promote action ────────────────────────────────────────────────────────

  it('fires onPromote with original suggested value when not edited', async () => {
    const onPromote = vi.fn();
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onPromote={onPromote} />);
    await user.click(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_PROMOTE));
    expect(onPromote).toHaveBeenCalledWith('the');
  });

  it('fires onPromote with the edited suggested value', async () => {
    const onPromote = vi.fn();
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onPromote={onPromote} />);
    const input = screen.getByTestId(SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT);
    await user.clear(input);
    await user.type(input, 'thee');
    await user.click(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_PROMOTE));
    expect(onPromote).toHaveBeenCalledWith('thee');
  });

  // ─ Dismiss action ────────────────────────────────────────────────────────

  it('fires onDismiss when Dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onDismiss={onDismiss} />);
    await user.click(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_DISMISS));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // ─ Disabled state when callbacks absent ──────────────────────────────────

  it('Promote button is disabled when onPromote is not provided', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_PROMOTE)).toBeDisabled();
  });

  it('Dismiss button is disabled when onDismiss is not provided', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_DISMISS)).toBeDisabled();
  });

  // ─ Testids ───────────────────────────────────────────────────────────────

  it('renders Promote button testid', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onPromote={vi.fn()} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_PROMOTE)).toBeInTheDocument();
  });

  it('renders Dismiss button testid', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} onDismiss={vi.fn()} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_DISMISS)).toBeInTheDocument();
  });

  it('renders suggested input testid', () => {
    render(<CandidateDetail candidate={candidate} contexts={fewContexts} />);
    expect(screen.getByTestId(SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT)).toBeInTheDocument();
  });

  // ─ Show-all toggle ────────────────────────────────────────────────────────

  it('clicking Show-all expands to show all contexts', async () => {
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={manyContexts} />);
    // Initially 4th context hidden
    expect(screen.queryByText('tbe last one')).toBeNull();
    await user.click(screen.getByText(/show all 4/i));
    // After clicking, 4th context visible
    expect(screen.getByText('tbe last one')).toBeInTheDocument();
  });

  it('Show-all button disappears after click', async () => {
    const user = userEvent.setup();
    render(<CandidateDetail candidate={candidate} contexts={manyContexts} />);
    const btn = screen.getByText(/show all 4/i);
    await user.click(btn);
    expect(screen.queryByText(/show all/i)).toBeNull();
  });

  it('showAll state resets when candidate changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CandidateDetail candidate={candidate} contexts={manyContexts} />);
    await user.click(screen.getByText(/show all 4/i));
    expect(screen.getByText('tbe last one')).toBeInTheDocument();

    // Re-render with a different candidate
    rerender(<CandidateDetail candidate={candidateNoConf} contexts={manyContexts} />);
    // showAll is reset — 4th context hidden again, show-all button re-appears
    expect(screen.queryByText('tbe last one')).toBeNull();
    expect(screen.getByText(/show all 4/i)).toBeInTheDocument();
  });
});
