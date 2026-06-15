import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../primitives/Button.js';
import { ViewportToolbar } from './ViewportToolbar.js';
import type { ViewportToolbarProps } from './ViewportToolbar.js';
import type { ZoomFitMode } from './types.js';

interface ToolbarDemoProps extends Omit<
  ViewportToolbarProps,
  'zoom' | 'onZoomChange' | 'fitMode' | 'onFitModeChange'
> {
  initialFitMode?: ZoomFitMode;
  initialZoom?: number;
}

function ToolbarDemo({ initialFitMode = 'none', initialZoom = 1, ...props }: ToolbarDemoProps) {
  const [zoom, setZoom] = React.useState(initialZoom);
  const [fitMode, setFitMode] = React.useState<ZoomFitMode>(initialFitMode);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <ViewportToolbar
        {...props}
        zoom={zoom}
        onZoomChange={setZoom}
        fitMode={fitMode}
        onFitModeChange={setFitMode}
      />
      <div
        style={{
          color: 'var(--ink-3)',
          fontFamily: 'var(--ui-font)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Zoom {zoom.toFixed(2)} - {fitMode}
      </div>
    </div>
  );
}

const meta: Meta<typeof ViewportToolbar> = {
  title: 'Viewport/ViewportToolbar',
  component: ViewportToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ToolbarDemo />,
};

export const FitPage: Story = {
  render: () => <ToolbarDemo initialFitMode="fit-page" />,
};

export const AtMaxZoom: Story = {
  render: () => <ToolbarDemo initialZoom={4} maxZoom={4} />,
};

export const AtMinZoom: Story = {
  render: () => <ToolbarDemo initialZoom={0.25} minZoom={0.25} />,
};

export const WithActions: Story = {
  render: () => (
    <ToolbarDemo
      actions={
        <Button type="button" variant="outline" size="sm">
          Rotate
        </Button>
      }
    />
  ),
};
