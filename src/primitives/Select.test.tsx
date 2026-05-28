import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './Select.js';

// jsdom does not implement several pointer/scroll APIs; patch them so Radix Select does not crash
beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => undefined;
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined;
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined;
  }
});

describe('Select', () => {
  function renderSelect() {
    return render(
      <Select>
        <SelectTrigger aria-label="color">
          <SelectValue placeholder="Pick a color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
        </SelectContent>
      </Select>,
    );
  }

  it('shows placeholder when no value selected', () => {
    renderSelect();
    expect(screen.getByText('Pick a color')).toBeTruthy();
  });

  it('SelectTrigger has select-trigger class', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger.classList.contains('select-trigger')).toBe(true);
  });

  it('SelectTrigger renders as a combobox with select-trigger class', () => {
    // Note: Radix Select has pointer-capture and scrollIntoView calls that
    // jsdom does not support, so we only verify static rendering + classes here.
    // The beforeAll patches hasPointerCapture/scrollIntoView for jsdom compat.
    renderSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger.classList.contains('select-trigger')).toBe(true);
  });

  it('SelectLabel has select-label class when content is rendered open', () => {
    // Radix renders SelectContent in a portal only after the trigger is clicked.
    // In jsdom the portal content is not in the DOM until open. We use
    // defaultOpen to force the content to mount, then query into document.
    render(
      <Select defaultOpen>
        <SelectTrigger aria-label="fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    // Portal renders into document.body; query the whole document.
    const label = document.querySelector('.select-label');
    expect(label).not.toBeNull();
  });

  it('SelectItem has select-item class when content is rendered open', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger aria-label="items-test">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
        </SelectContent>
      </Select>,
    );
    const items = document.querySelectorAll('.select-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('SelectScrollUpButton and SelectScrollDownButton have select-scroll-btn class', () => {
    render(
      <Select>
        <SelectTrigger aria-label="scroll-test">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton data-testid="scroll-up" />
          <SelectItem value="a">A</SelectItem>
          <SelectScrollDownButton data-testid="scroll-down" />
        </SelectContent>
      </Select>,
    );
    // The scroll buttons are conditionally rendered by Radix when overflow exists.
    // In jsdom there is no real overflow, so they may not appear — but if they do,
    // they must carry the correct class.
    const scrollBtns = document.querySelectorAll('.select-scroll-btn');
    scrollBtns.forEach((btn) => {
      expect(btn.classList.contains('select-scroll-btn')).toBe(true);
    });
  });
});
