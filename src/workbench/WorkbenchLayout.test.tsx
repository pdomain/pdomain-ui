import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailPanelShell } from './DetailPanelShell.js';
import { InspectorPanel } from './InspectorPanel.js';
import { WorkbenchLayout } from './WorkbenchLayout.js';

vi.mock('react-konva', () => ({}));
vi.mock('konva', () => ({ default: {} }));

const primitivesCss = readFileSync('theme/primitives.css', 'utf-8');
const workbenchLayoutRules = Array.from(
  primitivesCss.matchAll(/\.pdui-workbench-layout\s*\{([^}]*)\}/g),
  (match) => match[1] ?? '',
).join('\n');

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
    const { container } = render(<WorkbenchLayout viewer={<div>Viewer only</div>} />);

    expect(screen.getByText('Viewer only')).toBeInTheDocument();
    expect(container.querySelector('.pdui-workbench-layout__navigation')).not.toBeInTheDocument();
    expect(container.querySelector('.pdui-workbench-layout__inspector')).not.toBeInTheDocument();
  });

  it('marks slot-aware body layout variants', () => {
    const cases = [
      {
        name: 'viewer-only',
        props: {},
        modifier: 'pdui-workbench-layout__body--viewer-only',
      },
      {
        name: 'navigation-viewer',
        props: { navigation: <nav aria-label="Pages">Pages</nav> },
        modifier: 'pdui-workbench-layout__body--navigation-viewer',
      },
      {
        name: 'viewer-inspector',
        props: { inspector: <aside>Inspector</aside> },
        modifier: 'pdui-workbench-layout__body--viewer-inspector',
      },
      {
        name: 'navigation-viewer-inspector',
        props: {
          navigation: <nav aria-label="Pages">Pages</nav>,
          inspector: <aside>Inspector</aside>,
        },
        modifier: 'pdui-workbench-layout__body--navigation-viewer-inspector',
      },
    ] as const;

    for (const testCase of cases) {
      const { container, unmount } = render(
        <WorkbenchLayout viewer={<div>Viewer</div>} {...testCase.props} />,
      );
      const body = container.querySelector('.pdui-workbench-layout__body');

      expect(body).toHaveAttribute('data-layout', testCase.name);
      expect(body).toHaveClass(testCase.modifier);

      unmount();
    }
  });

  it('keeps the body assigned to the flexible body area when toolbar is absent', () => {
    const { container } = render(
      <WorkbenchLayout header={<h1>Workbench</h1>} viewer={<div>Viewer</div>} />,
    );

    expect(container.querySelector('.pdui-workbench-layout__header')).toHaveAttribute(
      'data-grid-area',
      'header',
    );
    expect(container.querySelector('.pdui-workbench-layout__toolbar')).not.toBeInTheDocument();
    expect(container.querySelector('.pdui-workbench-layout__body')).toHaveAttribute(
      'data-grid-area',
      'body',
    );
  });

  it('keeps footer in the footer area without moving the body when toolbar is absent', () => {
    const { container } = render(
      <WorkbenchLayout
        header={<h1>Workbench</h1>}
        viewer={<div>Viewer</div>}
        footer={<button type="button">Apply</button>}
      />,
    );

    expect(container.querySelector('.pdui-workbench-layout__toolbar')).not.toBeInTheDocument();
    expect(container.querySelector('.pdui-workbench-layout__body')).toHaveAttribute(
      'data-grid-area',
      'body',
    );
    expect(container.querySelector('.pdui-workbench-layout__footer')).toHaveAttribute(
      'data-grid-area',
      'footer',
    );
  });

  it('defines explicit vertical grid areas for optional chrome', () => {
    expect(workbenchLayoutRules).toContain('grid-template-areas:');
    expect(workbenchLayoutRules).toContain("'header'");
    expect(workbenchLayoutRules).toContain("'toolbar'");
    expect(workbenchLayoutRules).toContain("'body'");
    expect(workbenchLayoutRules).toContain("'footer'");
    expect(primitivesCss).toContain('grid-area: header;');
    expect(primitivesCss).toContain('grid-area: toolbar;');
    expect(primitivesCss).toContain('grid-area: body;');
    expect(primitivesCss).toContain('grid-area: footer;');
  });

  it('ignores side width props unless the matching side slot exists', () => {
    const { container } = render(
      <WorkbenchLayout viewer={<div>Viewer only</div>} navWidth={240} inspectorWidth="30rem" />,
    );

    const root = screen.getByRole('region', { name: 'Workbench layout' });

    expect(root.style.getPropertyValue('--pdui-workbench-nav-w')).toBe('');
    expect(root.style.getPropertyValue('--pdui-workbench-inspector-w')).toBe('');
    expect(container.querySelector('.pdui-workbench-layout__navigation')).not.toBeInTheDocument();
    expect(container.querySelector('.pdui-workbench-layout__inspector')).not.toBeInTheDocument();
  });

  it('sets side width CSS variables when side slots exist', () => {
    render(
      <WorkbenchLayout
        navigation={<nav aria-label="Pages">Pages</nav>}
        viewer={<div>Viewer</div>}
        inspector={<aside>Inspector</aside>}
        navWidth={240}
        inspectorWidth="30rem"
      />,
    );

    const root = screen.getByRole('region', { name: 'Workbench layout' });

    expect(root.style.getPropertyValue('--pdui-workbench-nav-w')).toBe('240px');
    expect(root.style.getPropertyValue('--pdui-workbench-inspector-w')).toBe('30rem');
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
    expect(screen.getByRole('group', { name: 'Inspector actions' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Detail actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('re-exports workbench components from the root barrel', async () => {
    const root = (await import('../index.js')) as Record<string, unknown>;

    expect(root['WorkbenchLayout']).toBe(WorkbenchLayout);
    expect(root['InspectorPanel']).toBe(InspectorPanel);
    expect(root['DetailPanelShell']).toBe(DetailPanelShell);
  });
});
