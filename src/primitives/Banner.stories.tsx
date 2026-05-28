import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from './Banner.js';

const meta: Meta<typeof Banner> = {
  title: 'Primitives/Banner',
  component: Banner,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'neutral'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const NeutralBasic: Story = {
  args: {
    tone: 'neutral',
    headline: 'Nothing to report',
    subtext: 'All systems nominal.',
  },
};

export const Info: Story = {
  args: {
    tone: 'info',
    headline: 'OCR processing in progress',
    subtext: 'This may take a few moments depending on page count.',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    headline: 'Pipeline completed successfully',
    subtext: '232 pages processed · 0 errors.',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    headline: 'Low-confidence pages detected',
    subtext: '14 pages fell below the confidence threshold. Review before proceeding.',
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    headline: 'Pipeline error',
    subtext: 'Stage failed with an unrecoverable error. Check logs for details.',
  },
};

export const WithLeading: Story = {
  args: {
    tone: 'info',
    headline: 'Auto-detect running',
    subtext: 'Analysing page layout and script…',
    leadingSlot: (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 24,
          height: 24,
          background: 'var(--ocr)',
          borderRadius: '50%',
        }}
      />
    ),
  },
};

export const WithActions: Story = {
  args: {
    tone: 'warning',
    headline: '33 pages flagged',
    subtext: 'Source quality issues were detected.',
    actions: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn ghost sm">
          Dismiss
        </button>
        <button type="button" className="btn primary sm">
          View flagged
        </button>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    tone: 'info',
    headline: 'Uploading pages',
    subtext: '48 of 232 pages uploaded.',
    footer: (
      <div
        role="progressbar"
        aria-valuenow={48}
        aria-valuemin={0}
        aria-valuemax={232}
        style={{
          height: 4,
          background: 'var(--bg-sunk)',
          borderRadius: 2,
          marginTop: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${(48 / 232) * 100}%`,
            background: 'var(--ocr)',
          }}
        />
      </div>
    ),
  },
};

export const WithChildrenBody: Story = {
  args: {
    tone: 'neutral',
    headline: 'Custom body content',
    children: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['blurry', 'skew', 'dark', 'sparse'].map((tag) => (
          <span
            key={tag}
            style={{
              padding: '2px 8px',
              background: 'var(--bg-sunk)',
              borderRadius: 4,
              fontSize: '0.75rem',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  },
};
