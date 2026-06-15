import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlockingOperationOverlay } from './BlockingOperationOverlay.js';
import { OperationStatusPanel } from './OperationStatusPanel.js';
import { RetryActionPanel } from './RetryActionPanel.js';

describe('operation status kit', () => {
  it('renders state, progress and actions', () => {
    render(
      <OperationStatusPanel
        title="OCR running"
        message="Processing page 3"
        state="running"
        progress={45}
        primaryAction={<button type="button">Open</button>}
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'running');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders a blocking overlay with live region semantics', () => {
    render(
      <BlockingOperationOverlay
        open
        message="Saving project"
        cancelAction={<button type="button">Cancel</button>}
        bestEffortCancel
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Saving project')).toBeInTheDocument();
    expect(screen.getByText(/best effort/i)).toBeInTheDocument();
  });

  it('does not render a closed overlay', () => {
    render(<BlockingOperationOverlay open={false} message="Saving project" />);
    expect(screen.queryByText('Saving project')).not.toBeInTheDocument();
  });

  it('renders retry panels', () => {
    render(
      <RetryActionPanel
        title="OCR failed"
        error="Timeout"
        retryAction={<button type="button">Retry</button>}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Timeout');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
