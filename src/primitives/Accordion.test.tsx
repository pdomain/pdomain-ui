import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion.js';
import type { AccordionTone, AccordionTriggerProps } from './Accordion.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTrigger(triggerProps: Partial<AccordionTriggerProps> & Record<string, any> = {}) {
  return render(
    <Accordion type="single" collapsible defaultValue="a">
      <AccordionItem value="a">
        <AccordionTrigger {...(triggerProps as AccordionTriggerProps)}>Label</AccordionTrigger>
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe('AccordionTrigger slots + chevron', () => {
  it('default path renders the built-in chevron and no slot wrappers', () => {
    const { container } = renderTrigger();
    const trigger = container.querySelector('.acc-trigger')!;
    expect(trigger).not.toBeNull();
    const chev = trigger.querySelector('.chev');
    expect(chev).not.toBeNull();
    expect(chev).toHaveTextContent('›'); // ›
    expect(trigger.querySelector('.acc-trigger-start')).toBeNull();
    expect(trigger.querySelector('.acc-trigger-end')).toBeNull();
    expect(trigger.textContent?.startsWith('Label')).toBe(true);
  });

  it('renders endContent after children and before the chevron', () => {
    const { container } = renderTrigger({ endContent: <span data-testid="kc">KC</span> });
    const trigger = container.querySelector('.acc-trigger')!;
    const end = trigger.querySelector('.acc-trigger-end')!;
    expect(end).toHaveTextContent('KC');
    const els = Array.from(trigger.children);
    const endIdx = els.findIndex((e) => e.classList.contains('acc-trigger-end'));
    const chevIdx = els.findIndex((e) => e.classList.contains('chev'));
    expect(endIdx).toBeGreaterThanOrEqual(0);
    expect(chevIdx).toBeGreaterThan(endIdx);
    expect(trigger.textContent?.startsWith('Label')).toBe(true);
  });

  it('renders startContent before children', () => {
    const { container } = renderTrigger({ startContent: <span data-testid="st">S</span> });
    const trigger = container.querySelector('.acc-trigger')!;
    const start = trigger.querySelector('.acc-trigger-start')!;
    expect(start).toHaveTextContent('S');
    expect(trigger.firstElementChild).toBe(start);
  });

  it('chevron={false} renders no chevron at all', () => {
    const { container } = renderTrigger({ chevron: false });
    const trigger = container.querySelector('.acc-trigger')!;
    expect(trigger.querySelector('.chev')).toBeNull();
    expect(trigger.textContent).toContain('Label');
  });

  it('a custom chevron node replaces the default and emits no .chev', () => {
    const { container } = renderTrigger({ chevron: <svg data-testid="myc" /> });
    expect(screen.getByTestId('myc')).toBeInTheDocument();
    expect(container.querySelector('.chev')).toBeNull();
  });

  it('passes through data-testid and other props to the underlying trigger', () => {
    renderTrigger({ 'data-testid': 'trg' });
    expect(screen.getByTestId('trg')).toHaveClass('acc-trigger');
  });
});

const accordionTones = ['default', 'accent', 'danger'] satisfies AccordionTone[];

describe('Accordion', () => {
  function renderAccordion() {
    return render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
  }

  it('renders accordion items with .acc class', () => {
    renderAccordion();
    const items = document.querySelectorAll('.acc');
    expect(items.length).toBeGreaterThan(0);
  });

  it('content is hidden initially', () => {
    renderAccordion();
    // Radix accordion content has data-state=closed when not open
    expect(screen.queryByText('Content 1')).toBeNull();
  });

  it('clicking trigger opens content (Radix behavior)', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.click(screen.getByText('Section 1'));
    expect(screen.getByText('Content 1')).toBeTruthy();
  });

  it('clicking open trigger closes content (collapsible)', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.click(screen.getByText('Section 1'));
    await user.click(screen.getByText('Section 1'));
    // After second click content should be gone
    expect(screen.queryByText('Content 1')).toBeNull();
  });

  it('AccordionItem has the .acc class', () => {
    renderAccordion();
    // Radix Accordion items render with data-orientation attribute
    const items = document.querySelectorAll('.acc');
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.classList.contains('acc')).toBe(true);
    });
  });

  it('adds tone modifier classes when requested and preserves consumer className', () => {
    expect(accordionTones).toEqual(['default', 'accent', 'danger']);

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="accent-item" tone="accent" className="consumer-item">
          <AccordionTrigger>Accent</AccordionTrigger>
          <AccordionContent>Accent content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="danger-item" tone="danger">
          <AccordionTrigger>Danger</AccordionTrigger>
          <AccordionContent>Danger content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const accentItem = screen.getByText('Accent').closest('.acc');
    const dangerItem = screen.getByText('Danger').closest('.acc');

    expect(accentItem).toHaveClass('acc', 'accent', 'consumer-item');
    expect(accentItem).not.toHaveClass('danger');
    expect(dangerItem).toHaveClass('acc', 'danger');
    expect(dangerItem).not.toHaveClass('accent');
  });

  it('does not add tone modifiers for default or omitted tone', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="default-item" tone="default">
          <AccordionTrigger>Default</AccordionTrigger>
          <AccordionContent>Default content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="omitted-item">
          <AccordionTrigger>Omitted</AccordionTrigger>
          <AccordionContent>Omitted content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const defaultItem = screen.getByText('Default').closest('.acc');
    const omittedItem = screen.getByText('Omitted').closest('.acc');

    expect(defaultItem).toHaveClass('acc');
    expect(defaultItem).not.toHaveClass('accent');
    expect(defaultItem).not.toHaveClass('danger');
    expect(omittedItem).toHaveClass('acc');
    expect(omittedItem).not.toHaveClass('accent');
    expect(omittedItem).not.toHaveClass('danger');
  });
});
