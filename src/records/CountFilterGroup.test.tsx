import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CountFilterGroup } from './CountFilterGroup.js';

describe('CountFilterGroup', () => {
  it('renders counts and updates active filter', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(
      <CountFilterGroup
        ariaLabel="Filter projects"
        activeId="all"
        onActiveChange={onActiveChange}
        filters={[
          { id: 'all', label: 'All', count: 4 },
          { id: 'running', label: 'Running', count: 1 },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'All 4' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Running 1' }));
    expect(onActiveChange).toHaveBeenCalledWith('running');
  });

  it('disables disabled filters and does not update when clicked', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(
      <CountFilterGroup
        ariaLabel="Filter projects"
        activeId="all"
        onActiveChange={onActiveChange}
        filters={[
          { id: 'all', label: 'All', count: 4 },
          { id: 'archived', label: 'Archived', count: 0, disabled: true },
        ]}
      />,
    );

    const archived = screen.getByRole('button', { name: 'Archived 0' });

    expect(archived).toBeDisabled();
    await user.click(archived);
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});
