import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailPanelShell } from './DetailPanelShell.js';
import { InspectorPanel } from './InspectorPanel.js';
import { WorkbenchLayout } from './WorkbenchLayout.js';

describe('workbench layout kit', () => {
  it('renders two-pane and three-pane workbench regions', () => {
    render(
      <WorkbenchLayout
        header={<h1>Workbench</h1>}
        toolbar={<button type="button">Run</button>}
        navigation={<nav aria-label="Pages">Pages</nav>}
        viewer={<div>Viewer</div>}
        inspector={<aside>Inspector</aside>}
        footer={<button type="button">Apply</button>}
      />,
    );

    expect(screen.getByRole('region', { name: 'Workbench layout' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workbench' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('renders without optional side areas', () => {
    render(<WorkbenchLayout viewer={<div>Viewer only</div>} />);
    expect(screen.getByText('Viewer only')).toBeInTheDocument();
  });

  it('renders inspector and detail panel actions', () => {
    render(
      <>
        <InspectorPanel
          title="Details"
          meta="Selected page"
          actions={<button type="button">Save</button>}
        >
          Body
        </InspectorPanel>
        <DetailPanelShell
          title="Page 1"
          meta="300 dpi"
          actions={<button type="button">Open</button>}
        >
          Detail body
        </DetailPanelShell>
      </>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Selected page')).toBeInTheDocument();
    expect(screen.getByText('300 dpi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });
});
