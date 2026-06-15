import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ViewportToolbar } from './ViewportToolbar.js';
import { ZoomViewport } from './ZoomViewport.js';

describe('ZoomViewport', () => {
  it('renders children at the configured zoom', () => {
    render(
      <ZoomViewport zoom={2} ariaLabel="Page viewport">
        <div>Page</div>
      </ZoomViewport>,
    );

    expect(screen.getByRole('region', { name: 'Page viewport' })).toHaveAttribute('data-zoom', '2');
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('toolbar changes zoom and clamps at bounds', async () => {
    const user = userEvent.setup();
    const onZoomChange = vi.fn();
    render(<ViewportToolbar zoom={1} minZoom={1} maxZoom={2} onZoomChange={onZoomChange} />);

    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onZoomChange).toHaveBeenCalledWith(1.25);
  });

  it('changes fit mode', async () => {
    const user = userEvent.setup();
    const onFitModeChange = vi.fn();
    render(
      <ViewportToolbar
        zoom={1}
        onZoomChange={() => undefined}
        fitMode="none"
        onFitModeChange={onFitModeChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Fit page' }));
    expect(onFitModeChange).toHaveBeenCalledWith('fit-page');
  });
});
