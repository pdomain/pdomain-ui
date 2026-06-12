import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from './Dialog.js';

describe('Dialog', () => {
  it('content is not in DOM when closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription id="desc">Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText('Title')).toBeNull();
  });

  it('clicking Trigger opens Content with dialog class', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc">
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription id="desc">A description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByText('Open'));
    const content = screen.getByRole('dialog');
    expect(content).toBeTruthy();
    expect(content.classList.contains('dialog')).toBe(true);
  });

  it('open Dialog renders overlay, header, footer, and description with expected classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc">
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
            <DialogDescription id="desc">A description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button>Cancel</button>
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByText('Open'));

    // Content is positioned (regression guard for missing .dialog CSS).
    const content = screen.getByRole('dialog');
    expect(content.classList.contains('dialog')).toBe(true);

    // The scrim overlay is rendered in the same portal as the content.
    const overlay = document.querySelector('.dialog-overlay');
    expect(overlay).not.toBeNull();

    // Header / footer / description classes propagate to consumers.
    const header = screen.getByText('Header Title').closest('.dialog-header');
    expect(header).not.toBeNull();
    const description = screen.getByText('A description');
    expect(description.classList.contains('dialog-description')).toBe(true);
    const footer = screen.getByText('Cancel').closest('.dialog-footer');
    expect(footer).not.toBeNull();
  });

  it('content is nested inside the overlay so it always paints above the scrim', async () => {
    // Default-stacking contract: DialogContent must be a DOM descendant of the
    // scrim overlay. A positioned descendant always paints above its ancestor's
    // background regardless of z-index, so consumers that load neither
    // theme/primitives.css nor any z-index rules still get a clickable dialog.
    // Regression: with overlay as a *preceding sibling*, any consumer CSS that
    // gives .dialog-overlay an explicit z-index (and none to .dialog) paints
    // the scrim over the content — every mouse click lands on the overlay
    // (labeler-spa parity audit 2026-06-12, rows A-48/A-49).
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription id="desc">Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByText('Open'));

    const content = screen.getByRole('dialog');
    const overlay = document.querySelector('.dialog-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay!.contains(content)).toBe(true);
  });

  it('DialogTitle renders with dialog-title class', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc">
          <DialogTitle>My Title</DialogTitle>
          <DialogDescription id="desc">desc</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByText('Open'));
    const title = screen.getByText('My Title');
    expect(title.classList.contains('dialog-title')).toBe(true);
  });

  it('DialogContent accepts and forwards data-testid (WS7)', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby="desc" data-testid="my-dialog">
          <DialogTitle>Testid dialog</DialogTitle>
          <DialogDescription id="desc">desc</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByTestId('my-dialog')).toBeTruthy();
  });
});
