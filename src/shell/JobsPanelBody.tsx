/**
 * JobsPanelBody — content-only Jobs body rendered inside the utility dock.
 *
 * Reuses <JobRow> for each active job (the same list JobsDrawer renders in its
 * expanded mode) plus a "View all jobs" footer. No drawer chrome / dismiss /
 * collapse — the SlideOverPanel header owns close. All colors var(--token).
 */
import * as React from 'react';
import { ArrowRight } from '../icons/lucide.js';
import { JobRow } from './JobRow.js';
import type { Job, JobRowProps } from './JobRow.js';

export interface JobsPanelBodyProps {
  /** Currently active jobs. */
  activeJobs?: Job[];
  /** Called with job.id when a row's Open button is clicked. */
  onJobOpen?: JobRowProps['onOpen'];
  /** Called with job.id when a row's Pause/Resume button is clicked. */
  onJobPauseResume?: JobRowProps['onPauseResume'];
  /** Called with job.id when a row's Cancel button is clicked. */
  onJobCancel?: JobRowProps['onCancel'];
  /** Called when the "View all jobs" footer is clicked. */
  onViewAll?: () => void;
}

export function JobsPanelBody({
  activeJobs = [],
  onJobOpen,
  onJobPauseResume,
  onJobCancel,
  onViewAll,
}: JobsPanelBodyProps): React.ReactElement {
  const [hoveredId, setHoveredId] = React.useState<string | undefined>(undefined);

  return (
    <div
      data-testid="jobs-panel-body"
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {activeJobs.length === 0 ? (
        <div style={{ padding: '14px 4px', fontSize: 12, color: 'var(--ink-3)' }}>
          No active jobs. Background ingest, OCR runs, and exports will appear here.
        </div>
      ) : (
        <>
          {activeJobs.map((job) => (
            <div
              key={job.id}
              onMouseEnter={() => {
                setHoveredId(job.id);
              }}
              onMouseLeave={() => {
                setHoveredId(undefined);
              }}
            >
              <JobRow
                job={job}
                hovered={hoveredId === job.id}
                {...(onJobOpen !== undefined ? { onOpen: onJobOpen } : {})}
                {...(onJobPauseResume !== undefined ? { onPauseResume: onJobPauseResume } : {})}
                {...(onJobCancel !== undefined ? { onCancel: onJobCancel } : {})}
              />
            </div>
          ))}
          <button
            type="button"
            data-testid="jobs-panel-body-view-all"
            onClick={onViewAll}
            style={{
              marginTop: 8,
              padding: '8px 4px',
              background: 'transparent',
              border: 0,
              borderTopWidth: 1,
              borderTopStyle: 'solid',
              borderTopColor: 'var(--border-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>View all jobs</span>
            <ArrowRight size={12} aria-hidden style={{ color: 'var(--ink-3)' }} />
          </button>
        </>
      )}
    </div>
  );
}

JobsPanelBody.displayName = 'JobsPanelBody';
