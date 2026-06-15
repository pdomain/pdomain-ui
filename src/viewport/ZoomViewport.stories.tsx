import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ComponentProps, CSSProperties } from 'react';
import type { ZoomFitMode } from './types.js';
import { ViewportToolbar } from './ViewportToolbar.js';
import { ZoomViewport } from './ZoomViewport.js';

const CONTENT_SIZE = { width: 420, height: 560 };

const frameStyle: CSSProperties = {
  background: 'var(--bg-sunk)',
  border: '1px solid var(--border-1)',
  display: 'grid',
  height: 360,
  padding: 'var(--space-3)',
  width: 520,
};

const narrowFrameStyle: CSSProperties = {
  ...frameStyle,
  width: 220,
};

const pageStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--bg-raised)',
  border: '1px solid var(--border-2)',
  color: 'var(--ink-1)',
  display: 'grid',
  fontFamily: 'var(--ui-font)',
  fontSize: 'var(--text-lg)',
  height: CONTENT_SIZE.height,
  justifyItems: 'center',
  width: CONTENT_SIZE.width,
};

const meta: Meta<typeof ZoomViewport> = {
  title: 'Viewport/ZoomViewport',
  component: ZoomViewport,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    ariaLabel: 'Document viewport',
    contentSize: CONTENT_SIZE,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
type ZoomViewportStoryProps = Omit<ComponentProps<typeof ZoomViewport>, 'children'>;

function PagePreview() {
  return (
    <div style={pageStyle}>
      <span>OCR page</span>
    </div>
  );
}

function renderViewport(args: ZoomViewportStoryProps, style: CSSProperties) {
  return (
    <div style={style}>
      <ZoomViewport {...args}>
        <PagePreview />
      </ZoomViewport>
    </div>
  );
}

function ToolbarViewportDemo({ args }: { args: ZoomViewportStoryProps }) {
  const [zoom, setZoom] = React.useState(1);
  const [fitMode, setFitMode] = React.useState<ZoomFitMode>('none');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <ViewportToolbar
        zoom={zoom}
        maxZoom={10}
        fitMode={fitMode}
        onZoomChange={setZoom}
        onFitModeChange={setFitMode}
      />
      {renderViewport({ ...args, zoom, maxZoom: 10, fitMode }, frameStyle)}
    </div>
  );
}

export const Default: Story = {
  args: {
    zoom: 1,
  },
  render: (args) => renderViewport(args, frameStyle),
};

export const FitPage: Story = {
  args: {
    fitMode: 'fit-page',
  },
  render: (args) => renderViewport(args, frameStyle),
};

export const MaxZoom: Story = {
  args: {
    maxZoom: 4,
    zoom: 4,
  },
  render: (args) => renderViewport(args, frameStyle),
};

export const MinZoom: Story = {
  args: {
    minZoom: 0.25,
    zoom: 0.25,
  },
  render: (args) => renderViewport(args, frameStyle),
};

export const NarrowContainer: Story = {
  args: {
    fitMode: 'fit-width',
  },
  render: (args) => renderViewport(args, narrowFrameStyle),
};

export const WithToolbar: Story = {
  render: (args) => <ToolbarViewportDemo args={args} />,
};
