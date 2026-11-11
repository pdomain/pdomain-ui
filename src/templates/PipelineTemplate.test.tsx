/**
 * PipelineTemplate — unit tests (TDD)
 *
 * Verifies:
 *  - Each slot prop renders into its testid region
 *  - Default slot values render when props are omitted
 *  - projectInfoBand, stageStrip, tabsBand are all present
 *  - custom tabsSlot replaces default TabsBand
 *  - custom children replace default PipelineEmptySlot
 *  - trail renders in the breadcrumb area
 *  - controls renders in the header controls area
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PipelineTemplate, PipelineEmptySlot, type PipelineProject } from './PipelineTemplate.js';
import { PIPELINE_STAGES } from './StageStrip.js';

const SAMPLE_PROJECT: PipelineProject = {
  title: 'Test Book — Sample',
  author: 'Test Author',
  id: 'test-book-sample',
  pages: 100,
  ingested: '5 min ago',
  size: '1.0 GB',
};

describe('PipelineTemplate', () => {
  it('renders the project info band with project title', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    expect(screen.getByTestId('pipeline-template')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-project-info')).toBeInTheDocument();
    expect(screen.getByText('Test Book — Sample')).toBeInTheDocument();
  });

  it('renders the stage strip', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    expect(screen.getByTestId('pipeline-stage-strip')).toBeInTheDocument();
  });

  it('renders the default TabsBand tabs slot', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    expect(screen.getByTestId('pipeline-tabs')).toBeInTheDocument();
  });

  it('renders the default PipelineEmptySlot children', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    expect(screen.getByTestId('pipeline-body')).toBeInTheDocument();
    // Default slot is PipelineEmptySlot
    expect(screen.getByTestId('pipeline-empty-slot')).toBeInTheDocument();
  });

  it('renders custom tabsSlot when provided', () => {
    render(
      <PipelineTemplate
        project={SAMPLE_PROJECT}
        stage="threshold"
        stages={[...PIPELINE_STAGES]}
        tabsSlot={<div data-testid="custom-tabs">Custom Tabs</div>}
      />,
    );
    expect(screen.getByTestId('custom-tabs')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]}>
        <div data-testid="custom-body">Custom Body</div>
      </PipelineTemplate>,
    );
    expect(screen.getByTestId('custom-body')).toBeInTheDocument();
    expect(screen.queryByTestId('pipeline-empty-slot')).not.toBeInTheDocument();
  });

  it('renders trail items in the breadcrumb', () => {
    render(
      <PipelineTemplate
        project={SAMPLE_PROJECT}
        stage="threshold"
        stages={[...PIPELINE_STAGES]}
        trail={[{ label: 'Projects' }, { label: 'custom-trail-id', mono: true }]}
      />,
    );
    const bc = screen.getByTestId('pipeline-breadcrumb');
    expect(bc).toBeInTheDocument();
    expect(bc).toHaveTextContent('Projects');
    expect(bc).toHaveTextContent('custom-trail-id');
  });

  it('renders controls slot in the header band', () => {
    render(
      <PipelineTemplate
        project={SAMPLE_PROJECT}
        stage="threshold"
        stages={[...PIPELINE_STAGES]}
        controls={<button type="button">Sort: Recent</button>}
      />,
    );
    const controlsRegion = screen.getByTestId('pipeline-controls');
    expect(controlsRegion).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
  });

  it('renders project author in the project info band', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders project id in the project info band', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    const infoBand = screen.getByTestId('pipeline-project-info');
    // project.id appears in the meta row inside info band
    expect(infoBand).toHaveTextContent('test-book-sample');
  });

  it('renders the CoverPlaceholder with initials', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    const cover = screen.getByTestId('cover-placeholder');
    expect(cover).toBeInTheDocument();
    // "Test Author" → initials "TA"
    expect(cover).toHaveTextContent('TA');
  });

  it('styles the CoverPlaceholder ink and inset with tokens, not inline RGBA', () => {
    render(
      <PipelineTemplate project={SAMPLE_PROJECT} stage="threshold" stages={[...PIPELINE_STAGES]} />,
    );
    const style = screen.getByTestId('cover-placeholder').getAttribute('style') ?? '';
    expect(style).not.toMatch(/rgba?\(/);
    expect(style).toContain('var(--cover-ink)');
    expect(style).toContain('var(--shadow-cover-inset)');
  });

  it('renders a status Badge inside the project info band', () => {
    render(
      <PipelineTemplate
        project={{ ...SAMPLE_PROJECT, status: 'review' }}
        stage="threshold"
        stages={[...PIPELINE_STAGES]}
      />,
    );
    // The Badge should be somewhere in the info band
    const infoBand = screen.getByTestId('pipeline-project-info');
    expect(infoBand.querySelector('.badge')).not.toBeNull();
  });
});

describe('PipelineEmptySlot', () => {
  it('renders the empty slot placeholder', () => {
    render(<PipelineEmptySlot />);
    expect(screen.getByTestId('pipeline-empty-slot')).toBeInTheDocument();
  });
});
