import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-konva', () => ({}));
vi.mock('konva', () => ({ default: {} }));

import * as root from '../index.js';
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

  it.each([
    ['negative progress', -10, '0'],
    ['progress over 100', 150, '100'],
    ['NaN progress', Number.NaN, '0'],
    ['zero progress', 0, '0'],
  ])('clamps %s', (_name, progress, expected) => {
    render(<OperationStatusPanel title="OCR running" state="running" progress={progress} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected);
  });

  it('does not render a progressbar when progress is absent', () => {
    render(<OperationStatusPanel title="OCR idle" state="idle" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('uses alert semantics for error state', () => {
    render(<OperationStatusPanel title="OCR failed" state="error" message="Timeout" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-state', 'error');
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

  it('labels the blocking overlay dialog with ariaLabel', () => {
    render(
      <BlockingOperationOverlay open ariaLabel="Saving OCR project" message="Saving project" />,
    );

    expect(screen.getByRole('dialog', { name: 'Saving OCR project' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
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

  it('does not render retry panel alert semantics when error is absent', () => {
    render(<RetryActionPanel title="OCR failed" message="Try the operation again." />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('re-exports operation status components from the root barrel', () => {
    expect(root.OperationStatusPanel).toBe(OperationStatusPanel);
    expect(root.BlockingOperationOverlay).toBe(BlockingOperationOverlay);
    expect(root.RetryActionPanel).toBe(RetryActionPanel);
  });
});
