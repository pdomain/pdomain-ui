import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

describe('ToggleGroup', () => {
  function renderGroup() {
    return render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
  }

  it('renders with .seg class', () => {
    renderGroup();
    const group = screen.getByRole('radiogroup');
    expect(group.classList.contains('seg')).toBe(true);
  });

  it('items have seg-item class', () => {
    renderGroup();
    const items = screen.getAllByRole('radio');
    expect(items[0]?.classList.contains('seg-item')).toBe(true);
  });

  it('clicking an item selects it (Radix behavior)', async () => {
    const user = userEvent.setup();
    renderGroup();
    const itemA = screen.getByText('A');
    await user.click(itemA);
    expect(itemA.getAttribute('data-state')).toBe('on');
  });
});
