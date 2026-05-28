/**
 * ScannoToken Storybook stories.
 *
 * Covers:
 *   1. Paragraph — three source variants inline within sample sentence prose
 *   2. Rule — rule-match token in isolation
 *   3. Ocr — OCR low-confidence token in isolation
 *   4. Manual — manually marked token in isolation
 *   5. Clickable — button variant with onClick handler (check Actions panel)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScannoToken } from './ScannoToken.js';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ScannoToken> = {
  title: 'Stages/Scannos/ScannoToken',
  component: ScannoToken,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScannoToken>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Paragraph: shows all three source variants inline within sample sentence
 * prose, as they would appear in the Scannos review stage.
 */
export const Paragraph: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'Georgia, serif',
        fontSize: '1rem',
        lineHeight: 1.7,
        maxWidth: '42rem',
        color: 'var(--ink-2)',
      }}
    >
      The <ScannoToken token="recieve" source="rule" onClick={() => undefined} /> function was added
      by <ScannoToken token="Thimas" source="ocr" onClick={() => undefined} /> in{' '}
      <ScannoToken token="Feburary" source="manual" onClick={() => undefined} /> of last year, and
      has remained unchanged since.
    </p>
  ),
};

/** Rule: a pattern/dictionary rule match (fuzzy-tone underline). */
export const Rule: Story = {
  args: {
    token: 'recieve',
    source: 'rule',
  },
};

/** Ocr: OCR low-confidence flag (ocr-tone underline). */
export const Ocr: Story = {
  args: {
    token: 'Thimas',
    source: 'ocr',
  },
};

/** Manual: manually marked by the user (gt-tone underline). */
export const Manual: Story = {
  args: {
    token: 'Feburary',
    source: 'manual',
  },
};

/** Clickable: button variant — click fires the onClick handler (see Actions panel). */
export const Clickable: Story = {
  args: {
    token: 'recieve',
    source: 'rule',
    onClick: () => {
      console.log('ScannoToken clicked');
    },
  },
};
