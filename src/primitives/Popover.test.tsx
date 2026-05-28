import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from './Popover.js';

describe('Popover', () => {
  it('content is not visible initially', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText('Popover body')).toBeNull();
  });

  it('clicking trigger opens content with popover class', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText('Open Popover'));
    const content = await screen.findByText('Popover body');
    expect(content.classList.contains('popover')).toBe(true);
  });

  it('open Popover content has data-state="open" (regression guard for animation hook)', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText('Open Popover'));
    const content = await screen.findByText('Popover body');
    // Radix sets data-state="open" on open content; CSS uses this for animation.
    expect(content.getAttribute('data-state')).toBe('open');
  });

  it('extra className is merged alongside popover class', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent className="extra-class">Popover body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText('Open Popover'));
    const content = await screen.findByText('Popover body');
    expect(content.classList.contains('popover')).toBe(true);
    expect(content.classList.contains('extra-class')).toBe(true);
  });
});
