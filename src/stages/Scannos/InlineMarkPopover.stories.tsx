/**
 * InlineMarkPopover Storybook stories (Phase 2 M7).
 *
 * Covers:
 *   1. Default          — controlled popover open with a rule token + confidence
 *   2. RuleHighConfidence — high-confidence rule token with ruleId
 *   3. ManualNoConfidence — manual source token with no confidence value
 */

import React, { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { InlineMarkPopover } from './InlineMarkPopover.js';
import type { InlineMarkToken } from './InlineMarkPopover.js';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof InlineMarkPopover> = {
  title: 'Stages/Scannos/InlineMarkPopover',
  component: InlineMarkPopover,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onAccept: fn(),
    onDismiss: fn(),
    onPromote: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InlineMarkPopover>;

// ─── Controlled wrapper ───────────────────────────────────────────────────────

interface ControlledWrapperProps {
  token: InlineMarkToken;
  onClose?: () => void;
  onAccept?: () => void;
  onDismiss?: () => void;
  onPromote?: () => void;
}

function ControlledWrapper({
  token,
  onClose,
  onAccept,
  onDismiss,
  onPromote,
}: ControlledWrapperProps) {
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  return (
    <div style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--ink-2)', fontSize: 13 }}>
        Token in page text:{' '}
        <button
          type="button"
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 14,
            color: 'var(--ink-1)',
            borderBottom: '2px solid var(--fuzzy)',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0 2px',
            border: 'none',
          }}
          onClick={() => setOpen((v) => !v)}
        >
          {token.text}
        </button>
      </p>
      <InlineMarkPopover
        token={token}
        open={open}
        onClose={handleClose}
        {...(onAccept !== undefined ? { onAccept } : {})}
        {...(onDismiss !== undefined ? { onDismiss } : {})}
        {...(onPromote !== undefined ? { onPromote } : {})}
      />
    </div>
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default: rule token with mid-range confidence. Open by default.
 * Click the underlined token text to toggle the popover.
 */
export const Default: Story = {
  args: {
    token: {
      text: 'modcrn',
      source: 'rule',
      confidence: 0.64,
      ruleId: 'c-e-in-cm-cn',
    },
    open: true,
  },
  render: (args) => (
    <ControlledWrapper
      token={args.token}
      {...(args.onClose !== undefined ? { onClose: args.onClose } : {})}
      {...(args.onAccept !== undefined ? { onAccept: args.onAccept } : {})}
      {...(args.onDismiss !== undefined ? { onDismiss: args.onDismiss } : {})}
      {...(args.onPromote !== undefined ? { onPromote: args.onPromote } : {})}
    />
  ),
};

/**
 * RuleHighConfidence: rule source with high confidence (92%).
 * Fuzzy badge + confidence label both visible.
 */
export const RuleHighConfidence: Story = {
  args: {
    token: {
      text: 'reseach',
      source: 'rule',
      confidence: 0.92,
      ruleId: 'common-typos-en',
    },
    open: true,
  },
  render: (args) => (
    <ControlledWrapper
      token={args.token}
      {...(args.onClose !== undefined ? { onClose: args.onClose } : {})}
      {...(args.onAccept !== undefined ? { onAccept: args.onAccept } : {})}
      {...(args.onDismiss !== undefined ? { onDismiss: args.onDismiss } : {})}
      {...(args.onPromote !== undefined ? { onPromote: args.onPromote } : {})}
    />
  ),
};

/**
 * ManualNoConfidence: manually-marked token with no confidence value.
 * No percentage label; badge shows 'manual' with gt tone.
 */
export const ManualNoConfidence: Story = {
  args: {
    token: {
      text: 'colour',
      source: 'manual',
    },
    open: true,
  },
  render: (args) => (
    <ControlledWrapper
      token={args.token}
      {...(args.onClose !== undefined ? { onClose: args.onClose } : {})}
      {...(args.onAccept !== undefined ? { onAccept: args.onAccept } : {})}
      {...(args.onDismiss !== undefined ? { onDismiss: args.onDismiss } : {})}
      {...(args.onPromote !== undefined ? { onPromote: args.onPromote } : {})}
    />
  ),
};
