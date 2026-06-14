import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders .btn.primary by default', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('btn', 'primary');
  });

  it.each(['secondary', 'outline', 'ghost', 'danger', 'destructive'] as const)(
    'renders the %s variant class',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);

      expect(screen.getByRole('button', { name: variant })).toHaveClass('btn', variant);
    },
  );

  it.each(['md', 'default'] as const)('omits a size class for size %s', (size) => {
    render(<Button size={size}>Resize</Button>);

    const button = screen.getByRole('button', { name: 'Resize' });
    expect(button).toHaveClass('btn');
    expect(button).not.toHaveClass('md', 'default');
  });

  it.each(['sm', 'lg'] as const)('renders the %s size class', (size) => {
    render(<Button size={size}>Resize</Button>);

    expect(screen.getByRole('button', { name: 'Resize' })).toHaveClass('btn', size);
  });

  it('renders an anchor with button, variant, and size classes when asChild is true', () => {
    render(
      <Button asChild variant="outline" size="sm">
        <a href="/projects">Projects</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link).toHaveAttribute('href', '/projects');
    expect(link).toHaveClass('btn', 'outline', 'sm');
  });

  it('applies accessible disabled semantics to slotted anchors', () => {
    render(
      <Button asChild disabled>
        <a href="/projects">Projects</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveClass('btn', 'primary', 'disabled');
    expect(link).not.toHaveAttribute('disabled');
  });

  it('suppresses click handlers for disabled slotted anchors', () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/projects" onClick={onClick}>
          Projects
        </a>
      </Button>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('suppresses click capture handlers for disabled slotted anchors', () => {
    const onClickCapture = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/projects" onClickCapture={onClickCapture}>
          Projects
        </a>
      </Button>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));

    expect(onClickCapture).not.toHaveBeenCalled();
  });

  it('suppresses keyboard handlers for disabled slotted anchors', () => {
    const onKeyDown = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/projects" onKeyDown={onKeyDown}>
          Projects
        </a>
      </Button>,
    );

    fireEvent.keyDown(screen.getByRole('link', { name: 'Projects' }), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('link', { name: 'Projects' }), { key: ' ' });

    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('suppresses keyboard capture handlers for disabled slotted anchors', () => {
    const onKeyDownCapture = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/projects" onKeyDownCapture={onKeyDownCapture}>
          Projects
        </a>
      </Button>,
    );

    fireEvent.keyDown(screen.getByRole('link', { name: 'Projects' }), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('link', { name: 'Projects' }), { key: ' ' });

    expect(onKeyDownCapture).not.toHaveBeenCalled();
  });

  it('fires click handlers', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Run</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click handlers when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Run
      </Button>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
