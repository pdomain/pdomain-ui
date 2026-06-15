import type { Meta, StoryObj } from '@storybook/react';
import type * as React from 'react';
import { Button } from '../primitives/Button.js';
import { DetailPanelShell } from './DetailPanelShell.js';
import { InspectorPanel } from './InspectorPanel.js';
import { WorkbenchLayout } from './WorkbenchLayout.js';

const meta: Meta<typeof WorkbenchLayout> = {
  title: 'Workbench/WorkbenchLayout',
  component: WorkbenchLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const pageNavigation = (
  <nav aria-label="Pages" style={{ display: 'grid', gap: 8 }}>
    {['Page 001', 'Page 002', 'Page 003', 'Page 004'].map((page) => (
      <Button key={page} variant={page === 'Page 002' ? 'primary' : 'ghost'} size="sm">
        {page}
      </Button>
    ))}
  </nav>
);

function ViewerSurface({ label = 'Page viewer' }: { label?: string }): React.ReactElement {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--bg-sunk)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--ink-2)',
        display: 'grid',
        minHeight: 280,
        padding: 'var(--space-6)',
        placeItems: 'center',
      }}
    >
      <div style={{ display: 'grid', gap: 8, textAlign: 'center' }}>
        <strong style={{ color: 'var(--ink-1)' }}>{label}</strong>
        <span>Image, OCR, and overlay content render in this slot.</span>
      </div>
    </div>
  );
}

function StoryFrame({
  children,
  width,
}: {
  children: React.ReactNode;
  width?: number;
}): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--bg-sunk)',
        minHeight: 480,
        padding: 'var(--space-4)',
        width: '100%',
      }}
    >
      <div style={{ height: 420, margin: '0 auto', maxWidth: width ?? 1120 }}>{children}</div>
    </div>
  );
}

const inspector = (
  <InspectorPanel
    title="Page details"
    meta="300 dpi"
    actions={
      <Button variant="ghost" size="sm">
        Save
      </Button>
    }
    footer={
      <Button variant="primary" size="sm">
        Apply
      </Button>
    }
  >
    <div style={{ display: 'grid', gap: 10 }}>
      <span>Role: body</span>
      <span>Rotation: 0 degrees</span>
      <span>Confidence: 97 percent</span>
    </div>
  </InspectorPanel>
);

export const TwoPane: Story = {
  name: 'Two-pane viewer plus inspector',
  render: () => (
    <StoryFrame>
      <WorkbenchLayout
        header={<h1 style={{ fontSize: 16, margin: 0 }}>Source workbench</h1>}
        toolbar={
          <Button variant="primary" size="sm">
            Run OCR
          </Button>
        }
        viewer={<ViewerSurface />}
        inspector={inspector}
      />
    </StoryFrame>
  ),
};

export const ThreePane: Story = {
  name: 'Three-pane navigation, viewer, inspector',
  render: () => (
    <StoryFrame>
      <WorkbenchLayout
        header={<h1 style={{ fontSize: 16, margin: 0 }}>Page workbench</h1>}
        toolbar={
          <Button variant="primary" size="sm">
            Reprocess
          </Button>
        }
        navigation={pageNavigation}
        viewer={<ViewerSurface label="Selected page" />}
        inspector={inspector}
      />
    </StoryFrame>
  ),
};

export const ViewerOnly: Story = {
  name: 'Viewer-only',
  render: () => (
    <StoryFrame>
      <WorkbenchLayout viewer={<ViewerSurface label="Review canvas" />} />
    </StoryFrame>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <StoryFrame>
      <WorkbenchLayout
        navigation={pageNavigation}
        viewer={
          <DetailPanelShell title="OCR text" meta="Page 002">
            <div style={{ display: 'grid', gap: 12 }}>
              {Array.from({ length: 12 }, (_, index) => (
                <p key={index} style={{ margin: 0 }}>
                  This paragraph stands in for long OCR output and keeps the viewer region
                  scrollable while the surrounding workbench chrome stays fixed.
                </p>
              ))}
            </div>
          </DetailPanelShell>
        }
        inspector={inspector}
      />
    </StoryFrame>
  ),
};

export const NarrowViewport: Story = {
  name: 'Narrow viewport example',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <StoryFrame width={360}>
      <WorkbenchLayout
        navigation={pageNavigation}
        viewer={<ViewerSurface label="Mobile viewer" />}
        inspector={inspector}
      />
    </StoryFrame>
  ),
};
