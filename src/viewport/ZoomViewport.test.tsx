import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ZoomFitMode } from './types.js';
import { ViewportToolbar } from './ViewportToolbar.js';
import { ZoomViewport } from './ZoomViewport.js';

async function withViewportSize(
  width: number,
  height: number,
  testBody: () => void | Promise<void>,
) {
  const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
  const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');

  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return this instanceof HTMLElement && this.classList.contains('pdui-zoom-viewport')
        ? width
        : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return this instanceof HTMLElement && this.classList.contains('pdui-zoom-viewport')
        ? height
        : 0;
    },
  });

  try {
    await testBody();
  } finally {
    if (clientWidth === undefined) {
      Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
    } else {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth);
    }

    if (clientHeight === undefined) {
      Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
    } else {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight);
    }
  }
}

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

  it('sizes the layout footprint separately from the transformed content', () => {
    render(
      <ZoomViewport zoom={2} contentSize={{ width: 100, height: 50 }} ariaLabel="Page viewport">
        <div>Page</div>
      </ZoomViewport>,
    );

    const viewport = screen.getByRole('region', { name: 'Page viewport' });
    const frame = viewport.firstElementChild as HTMLElement;
    const content = frame.firstElementChild as HTMLElement;

    expect(frame).toHaveStyle({ width: '200px', height: '100px' });
    expect(content).toHaveStyle({ width: '100px', height: '50px', transform: 'scale(2)' });
  });

  it('toolbar changes zoom and clamps at bounds', async () => {
    const user = userEvent.setup();
    const onZoomChange = vi.fn();
    render(<ViewportToolbar zoom={1} minZoom={1} maxZoom={2} onZoomChange={onZoomChange} />);

    expect(screen.getByRole('toolbar', { name: 'Viewport toolbar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onZoomChange).toHaveBeenCalledWith(1.25);
  });

  it('toolbar manual zoom exits fit mode before changing zoom', async () => {
    const user = userEvent.setup();
    const onFitModeChange = vi.fn();
    const onZoomChange = vi.fn();
    render(
      <ViewportToolbar
        zoom={1}
        fitMode="fit-page"
        onFitModeChange={onFitModeChange}
        onZoomChange={onZoomChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(onFitModeChange).toHaveBeenCalledWith('none');
    expect(onZoomChange).toHaveBeenCalledWith(1.25);
    expect(onFitModeChange.mock.invocationCallOrder[0]).toBeLessThan(
      onZoomChange.mock.invocationCallOrder[0] ?? 0,
    );
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

  it('keyboard zoom uses step, clamps, resets, and exits fit mode', async () => {
    const user = userEvent.setup();
    const onFitModeChange = vi.fn();
    const onZoomChange = vi.fn();
    render(
      <ZoomViewport
        zoom={1}
        minZoom={0.75}
        maxZoom={1.25}
        step={0.5}
        fitMode="fit-page"
        onFitModeChange={onFitModeChange}
        onZoomChange={onZoomChange}
        ariaLabel="Page viewport"
      >
        <div>Page</div>
      </ZoomViewport>,
    );

    screen.getByRole('region', { name: 'Page viewport' }).focus();
    await user.keyboard('{Control>}={/Control}');
    await user.keyboard('{Control>}-{/Control}');
    await user.keyboard('{Meta>}0{/Meta}');

    expect(onFitModeChange).toHaveBeenCalledWith('none');
    expect(onZoomChange).toHaveBeenNthCalledWith(1, 1.25);
    expect(onZoomChange).toHaveBeenNthCalledWith(2, 0.75);
    expect(onZoomChange).toHaveBeenNthCalledWith(3, 1);
  });

  it('composes toolbar fit mode with viewport zoom resolution', async () =>
    withViewportSize(500, 300, async () => {
      const user = userEvent.setup();

      function Harness() {
        const [zoom, setZoom] = React.useState(1);
        const [fitMode, setFitMode] = React.useState<ZoomFitMode>('none');

        return (
          <>
            <ViewportToolbar
              zoom={zoom}
              maxZoom={10}
              fitMode={fitMode}
              onZoomChange={setZoom}
              onFitModeChange={setFitMode}
            />
            <ZoomViewport
              zoom={zoom}
              maxZoom={10}
              fitMode={fitMode}
              contentSize={{ width: 100, height: 50 }}
              ariaLabel="Page viewport"
            >
              <div>Page</div>
            </ZoomViewport>
          </>
        );
      }

      render(<Harness />);

      await user.click(screen.getByRole('button', { name: 'Fit page' }));
      await waitFor(() =>
        expect(screen.getByRole('region', { name: 'Page viewport' })).toHaveAttribute(
          'data-zoom',
          '5',
        ),
      );

      await user.click(screen.getByRole('button', { name: 'Zoom in' }));
      expect(screen.getByRole('button', { name: 'Fit page' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('region', { name: 'Page viewport' })).toHaveAttribute(
        'data-zoom',
        '1.25',
      );
    }));
});
