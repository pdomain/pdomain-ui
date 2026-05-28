/**
 * TextReviewPane Storybook stories — Phase 2 M2.
 *
 * Covers: Open / Closed / WithLongText / WithRichContent / Controlled.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextReviewPane } from './TextReviewPane.js';
import type { TextReviewPaneProps } from './TextReviewPane.js';

const SAMPLE_TEXT = `CHAPTER I.
Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the
bank, and of having nothing to do: once or twice she had peeped into
the book her sister was reading, but it had no pictures or conversations
in it, "and what is the use of a book," thought Alice "without pictures
or conversations?"`;

const LONG_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste
natus error sit voluptatem accusantium doloremque laudantium, totam rem
aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
dolore magnam aliquam quaerat voluptatem.`;

const meta: Meta<TextReviewPaneProps> = {
  title: 'Stages/PageWorkbench/TextReviewPane',
  component: TextReviewPane,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<TextReviewPaneProps>;

// ---------------------------------------------------------------------------
// Static stories
// ---------------------------------------------------------------------------

/**
 * Open — content visible (280px total height).
 */
export const Open: Story = {
  args: {
    text: SAMPLE_TEXT,
    open: true,
    onOpenChange: () => {},
  },
};

/**
 * Closed — only the 44px header strip visible.
 */
export const Closed: Story = {
  args: {
    text: SAMPLE_TEXT,
    open: false,
    onOpenChange: () => {},
  },
};

/**
 * WithLongText — verifies scroll / overflow handling in the content area.
 */
export const WithLongText: Story = {
  args: {
    text: LONG_TEXT,
    open: true,
    onOpenChange: () => {},
    title: 'OCR output',
  },
};

// ---------------------------------------------------------------------------
// Rich content story
// ---------------------------------------------------------------------------

function RichContent(): React.ReactElement {
  return (
    <div style={{ padding: '0.5rem', fontFamily: 'var(--mono-font, monospace)' }}>
      <p style={{ margin: '0 0 0.25rem', color: 'var(--ink-1)' }}>
        <strong>Word count:</strong> 42
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--ink-2)' }}>
        <li>Alice — confidence 0.98</li>
        <li>Rabbit-Hole — confidence 0.91</li>
        <li>sitting — confidence 0.95</li>
      </ul>
    </div>
  );
}

/**
 * WithRichContent — ReactNode text rendered as-is (no `<pre>` wrap).
 */
export const WithRichContent: Story = {
  args: {
    text: <RichContent />,
    open: true,
    onOpenChange: () => {},
    title: 'Word confidence',
  },
};

// ---------------------------------------------------------------------------
// Controlled story
// ---------------------------------------------------------------------------

function ControlledStory(): React.ReactElement {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ink-3)' }}>
        State: {open ? 'open' : 'closed'} — click the toggle to change
      </div>
      <TextReviewPane
        text={SAMPLE_TEXT}
        open={open}
        onOpenChange={setOpen}
        title="Text review (controlled)"
      />
    </div>
  );
}

/**
 * Controlled — wired to React state so the toggle actually works in Storybook.
 */
export const Controlled: StoryObj = {
  render: () => <ControlledStory />,
};
