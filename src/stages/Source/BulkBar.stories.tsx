/**
 * BulkBar stories — Source-stage sticky bulk action bar.
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { BulkBar } from './BulkBar.js';
import type { BulkAction } from './BulkBar.js';

const meta: Meta<typeof BulkBar> = {
  title: 'Stages/Source/BulkBar',
  component: BulkBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BulkBar>;

export const Default: Story = {
  name: 'Default (5 selected)',
  args: {
    selectedCount: 5,
    onAction: (action: BulkAction) => console.log('onAction:', action),
    'data-testid': 'bulk-bar',
  },
};

export const SinglySelected: Story = {
  name: 'SinglySelected (1)',
  args: {
    selectedCount: 1,
    onAction: (action: BulkAction) => console.log('onAction:', action),
    'data-testid': 'bulk-bar',
  },
};

export const ManySelected: Story = {
  name: 'ManySelected (47)',
  args: {
    selectedCount: 47,
    onAction: (action: BulkAction) => console.log('onAction:', action),
    'data-testid': 'bulk-bar',
  },
};

export const WithClear: Story = {
  name: 'WithClear',
  args: {
    selectedCount: 5,
    onAction: (action: BulkAction) => console.log('onAction:', action),
    onClear: () => console.log('onClear'),
    'data-testid': 'bulk-bar',
  },
};

function InteractiveStory() {
  const [count, setCount] = React.useState(5);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {lastAction !== null && (
        <p style={{ color: 'var(--ink-3)', margin: 0 }}>
          Last action: <strong>{lastAction}</strong>
        </p>
      )}
      <p style={{ color: 'var(--ink-3)', margin: 0 }}>
        {count} items selected —{' '}
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline' }}
        >
          +1
        </button>
        {' / '}
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline' }}
        >
          -1
        </button>
      </p>
      <BulkBar
        selectedCount={count}
        onAction={(action) => {
          setLastAction(action);
          console.log('onAction:', action);
        }}
        onClear={() => {
          setCount(0);
          setLastAction('clear');
        }}
        data-testid="bulk-bar"
      />
    </div>
  );
}

export const Interactive: Story = {
  name: 'Interactive',
  render: () => <InteractiveStory />,
};
