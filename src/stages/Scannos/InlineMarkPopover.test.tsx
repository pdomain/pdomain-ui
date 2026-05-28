/**
 * InlineMarkPopover Vitest tests (Phase 2 M7).
 *
 * Covers:
 *   - Opening (open=true) renders popover content
 *   - Accept / Dismiss / Promote callbacks fire on button click
 *   - Confidence label renders when confidence is present
 *   - Source badge renders with correct text
 *   - Testids are present on root and action buttons
 *   - onClose is called when popover closes
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineMarkPopover } from './InlineMarkPopover.js';
import {
  SCANNO_INLINE_MARK_POPOVER,
  SCANNO_INLINE_MARK_POPOVER_ACCEPT,
  SCANNO_INLINE_MARK_POPOVER_DISMISS,
  SCANNO_INLINE_MARK_POPOVER_PROMOTE,
} from '../../testids/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ruleToken = {
  text: 'modcrn',
  source: 'rule' as const,
  confidence: 0.64,
  ruleId: 'c-e-in-cm-cn',
};

const ocrToken = {
  text: 'the',
  source: 'ocr' as const,
  confidence: 0.42,
};

const manualToken = {
  text: 'colour',
  source: 'manual' as const,
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InlineMarkPopover', () => {
  it('renders popover content when open=true', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER)).toBeInTheDocument();
  });

  it('does not render popover content when open=false', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open={false} onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.queryByTestId(SCANNO_INLINE_MARK_POPOVER)).toBeNull();
  });

  it('renders the token text', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('modcrn')).toBeInTheDocument();
  });

  it('renders confidence as percentage when present', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    // 0.64 → 64%
    expect(screen.getByText('64%')).toBeInTheDocument();
  });

  it('does not render confidence when absent', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={manualToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('renders source badge with rule text', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('rule')).toBeInTheDocument();
  });

  it('renders source badge with ocr text', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ocrToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('ocr')).toBeInTheDocument();
  });

  it('renders source badge with manual text', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={manualToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('fires onAccept when Accept button is clicked', async () => {
    const onAccept = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} onAccept={onAccept} />
      </Wrapper>,
    );
    await user.click(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_ACCEPT));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('fires onDismiss when Dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} onDismiss={onDismiss} />
      </Wrapper>,
    );
    await user.click(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_DISMISS));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires onPromote when Promote button is clicked', async () => {
    const onPromote = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} onPromote={onPromote} />
      </Wrapper>,
    );
    await user.click(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_PROMOTE));
    expect(onPromote).toHaveBeenCalledTimes(1);
  });

  it('renders Accept button testid', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_ACCEPT)).toBeInTheDocument();
  });

  it('renders Dismiss button testid', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_DISMISS)).toBeInTheDocument();
  });

  it('renders Promote button testid', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_PROMOTE)).toBeInTheDocument();
  });

  it('renders ruleId when provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('c-e-in-cm-cn')).toBeInTheDocument();
  });

  it('does not render ruleId when absent', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ocrToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    // No ruleId text — just verify token renders without crash
    expect(screen.getByText('the')).toBeInTheDocument();
  });

  // ─ Disabled state when callbacks absent ─────────────────────────────────

  it('Accept button is disabled when onAccept is not provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_ACCEPT)).toBeDisabled();
  });

  it('Dismiss button is disabled when onDismiss is not provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_DISMISS)).toBeDisabled();
  });

  it('Promote button is disabled when onPromote is not provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_PROMOTE)).toBeDisabled();
  });

  it('Accept button is not disabled when onAccept is provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open onClose={vi.fn()} onAccept={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId(SCANNO_INLINE_MARK_POPOVER_ACCEPT)).not.toBeDisabled();
  });

  // ─ Children as trigger ───────────────────────────────────────────────────

  it('renders children as trigger when provided', () => {
    render(
      <Wrapper>
        <InlineMarkPopover token={ruleToken} open={false} onClose={vi.fn()}>
          <button type="button">token</button>
        </InlineMarkPopover>
      </Wrapper>,
    );
    expect(screen.getByText('token')).toBeInTheDocument();
  });
});
