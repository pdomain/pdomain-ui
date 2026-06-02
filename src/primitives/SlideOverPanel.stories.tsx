import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel.js';

const meta: Meta<typeof SlideOverPanel> = {
  title: 'Primitives/SlideOverPanel',
  component: SlideOverPanel,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SlideOverPanel>;

function InteractiveWrapper(): React.ReactElement {
  const [open, setOpen] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [width, setWidth] = useState(420);
  return (
    <div style={{ position: 'relative', height: '100vh', background: 'var(--bg-canvas)' }}>
      <button className="btn" onClick={() => setOpen(true)} style={{ margin: 16 }}>
        Open panel
      </button>
      <SlideOverPanel
        open={open}
        title="Settings"
        onClose={() => setOpen(false)}
        pinned={pinned}
        onTogglePin={setPinned}
        width={width}
        onResize={setWidth}
      >
        <p>Panel body content goes here.</p>
      </SlideOverPanel>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveWrapper />,
};

function PinnedWrapper(): React.ReactElement {
  const [open, setOpen] = useState(true);
  const [pinned, setPinned] = useState(true);
  const [width, setWidth] = useState(420);
  return (
    <div style={{ position: 'relative', height: '100vh', background: 'var(--bg-canvas)' }}>
      <SlideOverPanel
        open={open}
        title="Settings (Pinned)"
        onClose={() => setOpen(false)}
        pinned={pinned}
        onTogglePin={setPinned}
        width={width}
        onResize={setWidth}
      >
        <p>This panel is pinned with a resize handle on the left edge.</p>
      </SlideOverPanel>
    </div>
  );
}

export const Pinned: Story = {
  render: () => <PinnedWrapper />,
};

export const Closed: Story = {
  args: {
    open: false,
    title: 'Settings',
    onClose: () => undefined,
    children: 'Panel body',
  },
};
