import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { ButtonGroup } from './ButtonGroup.js';

describe('ButtonGroup', () => {
  it('renders a container with role="group"', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: /actions/i })).toBeTruthy();
  });

  it('renders a <div> element with the .btn-group class', () => {
    const { container } = render(
      <ButtonGroup aria-label="g">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    const el = container.firstElementChild;
    expect(el?.tagName).toBe('DIV');
    expect(el?.classList.contains('btn-group')).toBe(true);
  });

  it('renders children inside the group', () => {
    render(
      <ButtonGroup aria-label="g">
        <button type="button">Save</button>
        <button type="button">Cancel</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
  });

  it('merges custom className', () => {
    const { container } = render(
      <ButtonGroup aria-label="g" className="my-class">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    const el = container.firstElementChild;
    expect(el?.classList.contains('btn-group')).toBe(true);
    expect(el?.classList.contains('my-class')).toBe(true);
  });

  it('forwards data-testid to the root div', () => {
    render(
      <ButtonGroup aria-label="g" data-testid="my-group">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId('my-group')).toBeTruthy();
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref} aria-label="g">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('passes arbitrary HTML div attributes through', () => {
    const { container } = render(
      <ButtonGroup aria-label="g" id="my-id">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(container.firstElementChild?.getAttribute('id')).toBe('my-id');
  });

  it('applies separator class when separator prop is true', () => {
    const { container } = render(
      <ButtonGroup aria-label="g" separator>
        <button type="button">A</button>
        <button type="button">B</button>
      </ButtonGroup>,
    );
    expect(container.firstElementChild?.classList.contains('btn-group--separator')).toBe(true);
  });

  it('does not apply separator class when separator prop is false', () => {
    const { container } = render(
      <ButtonGroup aria-label="g" separator={false}>
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(container.firstElementChild?.classList.contains('btn-group--separator')).toBe(false);
  });

  it('does not apply separator class when separator prop is absent', () => {
    const { container } = render(
      <ButtonGroup aria-label="g">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(container.firstElementChild?.classList.contains('btn-group--separator')).toBe(false);
  });
});
