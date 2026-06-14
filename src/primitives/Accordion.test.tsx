import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion.js';
import type { AccordionTone } from './Accordion.js';

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
