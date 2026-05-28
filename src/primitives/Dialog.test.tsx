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

    // Radix sets data-state="open" on the Content + Overlay portal nodes; the
    // overlay sibling is rendered in the same portal container.
    const overlay = content.parentElement?.querySelector('.dialog-overlay');
    expect(overlay).not.toBeNull();

    // Header / footer / description classes propagate to consumers.
    const header = screen.getByText('Header Title').closest('.dialog-header');
    expect(header).not.toBeNull();
    const description = screen.getByText('A description');
    expect(description.classList.contains('dialog-description')).toBe(true);
    const footer = screen.getByText('Cancel').closest('.dialog-footer');
    expect(footer).not.toBeNull();
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
