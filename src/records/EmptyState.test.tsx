import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState.js';

describe('EmptyState', () => {
  it('renders title, description, icon and action', () => {
    render(
      <EmptyState
        title="No projects"
        description="Open a source folder to get started."
        icon={<span aria-hidden="true">Icon</span>}
        action={<button type="button">Open folder</button>}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No projects');
    expect(screen.getByRole('status')).toHaveTextContent('Open a source folder');
    expect(screen.getByRole('button', { name: 'Open folder' })).toBeInTheDocument();
  });

  it('sets the requested tone', () => {
    render(<EmptyState title="Failed" tone="danger" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'danger');
  });
});
