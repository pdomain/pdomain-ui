/**
 * Tests for ProjectsLandingTemplate.
 *
 * Acceptance criteria (GH #346):
 *  - exports a typed `ProjectsLandingTemplate`
 *  - discriminated-union `state: 'populated' | 'empty'` gates layout
 *  - populated path: left-rail drawer + right detail pane
 *  - empty path: centered hero with Create CTA
 *  - both paths render testid regions
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ProjectsLandingTemplate,
  type ProjectsLandingTemplatePopulatedProps,
  type ProjectsLandingTemplateEmptyProps,
} from './ProjectsLandingTemplate.js';
import type { ProjectsDrawerProject } from './ProjectsDrawer.js';

// ─── sample data ──────────────────────────────────────────────────────────────

const PROJECTS: ProjectsDrawerProject[] = [
  {
    id: 'austen-emma-vol2',
    title: 'Emma · Vol. II',
    author: 'Jane Austen',
    pages: 412,
    totalStages: 23,
    currentStage: 11,
    status: 'review',
    size: '22.6 MB',
    updatedRel: 'yesterday',
    flagged: 18,
  },
  {
    id: 'twain-puddnhead',
    title: "Pudd'nhead Wilson",
    author: 'Mark Twain',
    pages: 218,
    totalStages: 23,
    currentStage: 10,
    status: 'running',
    size: '14.1 MB',
    updatedRel: 'running',
  },
];

// ─── render helpers ───────────────────────────────────────────────────────────

function renderPopulated(overrides: Partial<ProjectsLandingTemplatePopulatedProps> = {}) {
  const onSelect = vi.fn();
  const utils = render(
    <ProjectsLandingTemplate
      state="populated"
      projects={PROJECTS}
      selectedId="austen-emma-vol2"
      onSelect={onSelect}
      {...overrides}
    />,
  );
  return { ...utils, onSelect };
}

function renderEmpty(overrides: Partial<ProjectsLandingTemplateEmptyProps> = {}) {
  const onCreateProject = vi.fn();
  const utils = render(
    <ProjectsLandingTemplate state="empty" onCreateProject={onCreateProject} {...overrides} />,
  );
  return { ...utils, onCreateProject };
}

// ─── populated state ──────────────────────────────────────────────────────────

describe('ProjectsLandingTemplate — populated state', () => {
  it('renders the root with data-testid="projects-landing"', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-landing')).toBeTruthy();
  });

  it('renders the ProjectsDrawer (data-testid="projects-drawer")', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-drawer')).toBeTruthy();
  });

  it('renders the detail pane (data-testid="projects-detail")', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-detail')).toBeTruthy();
  });

  it('shows the selected project title in the detail pane', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-detail').textContent).toContain('Emma · Vol. II');
  });

  it('shows the selected project author in the detail pane', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-detail').textContent).toContain('Jane Austen');
  });

  it('shows an "Open project" button in the detail pane', () => {
    renderPopulated();
    const detail = screen.getByTestId('projects-detail');
    const btn = detail.querySelector('[data-testid="projects-open-btn"]');
    expect(btn).toBeTruthy();
  });

  it('renders stats grid (data-testid="projects-stats-grid")', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-stats-grid')).toBeTruthy();
  });

  it('renders pipeline section (data-testid="projects-pipeline")', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-pipeline')).toBeTruthy();
  });

  it('renders tab strip (data-testid="projects-tab-strip")', () => {
    renderPopulated();
    expect(screen.getByTestId('projects-tab-strip')).toBeTruthy();
  });

  it('calls onSelect when a row is clicked in the drawer', () => {
    const { onSelect } = renderPopulated();
    // Click the non-selected project
    fireEvent.click(screen.getByText("Pudd'nhead Wilson"));
    expect(onSelect).toHaveBeenCalledWith('twain-puddnhead');
  });

  it('renders controls slot (data-testid="projects-controls") when controlsSlot provided', () => {
    renderPopulated({
      controlsSlot: <span data-testid="custom-controls">controls</span>,
    });
    expect(screen.getByTestId('custom-controls')).toBeTruthy();
  });

  it('defaults to activity tab being selected', () => {
    renderPopulated();
    const strip = screen.getByTestId('projects-tab-strip');
    const activityTab = strip.querySelector('[data-tab="activity"]');
    expect(activityTab?.getAttribute('aria-selected')).toBe('true');
  });

  it('respects defaultTab="attributes"', () => {
    renderPopulated({ defaultTab: 'attributes' });
    const strip = screen.getByTestId('projects-tab-strip');
    const attrsTab = strip.querySelector('[data-tab="attributes"]');
    expect(attrsTab?.getAttribute('aria-selected')).toBe('true');
  });

  it('does not render the empty hero section', () => {
    renderPopulated();
    expect(screen.queryByTestId('projects-empty-hero')).toBeNull();
  });

  it('renders an archived project with "Open (read-only)" button text', () => {
    const archivedProject: ProjectsDrawerProject = {
      ...PROJECTS[0]!,
      id: 'archived-book',
      title: 'Archived Book',
      archived: true,
      archivedOn: 'May 02, 2026',
    };
    renderPopulated({
      projects: [...PROJECTS, archivedProject],
      selectedId: 'archived-book',
    });
    const btn = screen.getByTestId('projects-open-btn');
    expect(btn.textContent).toContain('read-only');
  });
});

// ─── empty state ──────────────────────────────────────────────────────────────

describe('ProjectsLandingTemplate — empty state', () => {
  it('renders the root with data-testid="projects-landing"', () => {
    renderEmpty();
    expect(screen.getByTestId('projects-landing')).toBeTruthy();
  });

  it('renders the empty hero section (data-testid="projects-empty-hero")', () => {
    renderEmpty();
    expect(screen.getByTestId('projects-empty-hero')).toBeTruthy();
  });

  it('shows the "No projects yet" heading', () => {
    renderEmpty();
    expect(screen.getByText(/no projects yet/i)).toBeTruthy();
  });

  it('renders a "Create new project" button', () => {
    renderEmpty();
    expect(screen.getByRole('button', { name: /create new project/i })).toBeTruthy();
  });

  it('calls onCreateProject when the CTA is clicked', () => {
    const { onCreateProject } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: /create new project/i }));
    expect(onCreateProject).toHaveBeenCalledTimes(1);
  });

  it('does not render the ProjectsDrawer', () => {
    renderEmpty();
    expect(screen.queryByTestId('projects-drawer')).toBeNull();
  });

  it('does not render the detail pane', () => {
    renderEmpty();
    expect(screen.queryByTestId('projects-detail')).toBeNull();
  });

  it('renders "Paste source URL" secondary button', () => {
    renderEmpty();
    expect(screen.getByRole('button', { name: /paste source url/i })).toBeTruthy();
  });

  it('calls onCreateProject if provided when createSlot is not given', () => {
    const { onCreateProject } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: /create new project/i }));
    expect(onCreateProject).toHaveBeenCalled();
  });

  it('renders custom createSlot when provided', () => {
    renderEmpty({
      createSlot: <button data-testid="custom-create">Start fresh</button>,
    });
    expect(screen.getByTestId('custom-create')).toBeTruthy();
    // The default CTA should not be present
    expect(screen.queryByRole('button', { name: /create new project/i })).toBeNull();
  });
});

// ─── selectedId change resets tab (WS5) ─────────────────────────────────────

describe('ProjectsLandingTemplate — selectedId tab reset (WS5)', () => {
  it('resets detail tab to defaultTab when selectedId changes', () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <ProjectsLandingTemplate
        state="populated"
        projects={PROJECTS}
        selectedId="austen-emma-vol2"
        onSelect={onSelect}
        defaultTab="activity"
      />,
    );
    // Switch to manage tab
    const manageTab = screen
      .getByTestId('projects-tab-strip')
      .querySelector('[data-tab="manage"]') as HTMLElement;
    fireEvent.click(manageTab);
    expect(manageTab.getAttribute('aria-selected')).toBe('true');

    // Now change selectedId — tab must reset to defaultTab ('activity')
    rerender(
      <ProjectsLandingTemplate
        state="populated"
        projects={PROJECTS}
        selectedId="twain-puddnhead"
        onSelect={onSelect}
        defaultTab="activity"
      />,
    );
    const activityTab = screen
      .getByTestId('projects-tab-strip')
      .querySelector('[data-tab="activity"]') as HTMLElement;
    expect(activityTab.getAttribute('aria-selected')).toBe('true');
  });
});

// ─── button callbacks (WS5) ──────────────────────────────────────────────────

describe('ProjectsLandingTemplate — button callbacks (WS5)', () => {
  it('calls onOpenProject when Open project button is clicked', () => {
    const onOpenProject = vi.fn();
    const onSelect = vi.fn();
    render(
      <ProjectsLandingTemplate
        state="populated"
        projects={PROJECTS}
        selectedId="austen-emma-vol2"
        onSelect={onSelect}
        onOpenProject={onOpenProject}
      />,
    );
    fireEvent.click(screen.getByTestId('projects-open-btn'));
    expect(onOpenProject).toHaveBeenCalledTimes(1);
  });

  it('calls onPasteUrl when Paste source URL button is clicked (empty state)', () => {
    const onPasteUrl = vi.fn();
    render(<ProjectsLandingTemplate state="empty" onPasteUrl={onPasteUrl} />);
    fireEvent.click(screen.getByRole('button', { name: /paste source url/i }));
    expect(onPasteUrl).toHaveBeenCalledTimes(1);
  });

  it('calls onImportArchive when Import archive button is clicked (empty state)', () => {
    const onImportArchive = vi.fn();
    render(<ProjectsLandingTemplate state="empty" onImportArchive={onImportArchive} />);
    fireEvent.click(screen.getByRole('button', { name: /import.*archive/i }));
    expect(onImportArchive).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenStyleGuide when style guide button is clicked (empty state)', () => {
    const onOpenStyleGuide = vi.fn();
    render(<ProjectsLandingTemplate state="empty" onOpenStyleGuide={onOpenStyleGuide} />);
    fireEvent.click(screen.getByRole('button', { name: /style guide/i }));
    expect(onOpenStyleGuide).toHaveBeenCalledTimes(1);
  });
});

// ─── populated with no matching selectedId (WS5 empty state) ─────────────────

describe('ProjectsLandingTemplate — no-selection empty state (WS5)', () => {
  it('shows empty-state prompt when selectedId does not match any project', () => {
    render(
      <ProjectsLandingTemplate
        state="populated"
        projects={PROJECTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId('projects-no-selection')).toBeTruthy();
  });
});

// ─── tab switching ────────────────────────────────────────────────────────────

describe('ProjectsLandingTemplate — tab switching', () => {
  it('switches to the manage tab when clicked', () => {
    renderPopulated();
    const strip = screen.getByTestId('projects-tab-strip');
    const manageTab = strip.querySelector('[data-tab="manage"]') as HTMLElement;
    fireEvent.click(manageTab);
    expect(manageTab.getAttribute('aria-selected')).toBe('true');
  });

  it('shows manage content after switching to manage tab', () => {
    renderPopulated();
    const manageTab = screen
      .getByTestId('projects-tab-strip')
      .querySelector('[data-tab="manage"]') as HTMLElement;
    fireEvent.click(manageTab);
    expect(screen.getByTestId('projects-tab-body').textContent).toContain('Clean');
  });

  it('shows attributes panel after switching to attributes tab', () => {
    renderPopulated();
    const attrsTab = screen
      .getByTestId('projects-tab-strip')
      .querySelector('[data-tab="attributes"]') as HTMLElement;
    fireEvent.click(attrsTab);
    expect(screen.getByTestId('projects-tab-body').textContent).toContain('Bibliographic');
  });
});
