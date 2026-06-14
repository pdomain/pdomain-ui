import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs.js';

describe('Tabs', () => {
  function renderTabs() {
    return render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
  }

  it('renders tabs list with .tabs class', () => {
    renderTabs();
    const list = screen.getByRole('tablist');
    expect(list.classList.contains('tabs')).toBe(true);
  });

  it('renders tab triggers with .tab class', () => {
    renderTabs();
    const [tab1] = screen.getAllByRole('tab');
    expect(tab1!.classList.contains('tab')).toBe(true);
  });

  it('keeps default tabs classes without underline modifiers', () => {
    renderTabs();
    const list = screen.getByRole('tablist');
    const [tab1] = screen.getAllByRole('tab');
    expect(list.classList.contains('tabs')).toBe(true);
    expect(list.classList.contains('tabs--underline')).toBe(false);
    expect(tab1!.classList.contains('tab')).toBe(true);
    expect(tab1!.classList.contains('tab--underline')).toBe(false);
  });

  it('adds underline modifier classes when requested', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList appearance="underline">
          <TabsTrigger appearance="underline" value="tab1">
            Tab 1
          </TabsTrigger>
          <TabsTrigger appearance="underline" value="tab2">
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    const [tab1, tab2] = screen.getAllByRole('tab');
    expect(list.classList.contains('tabs')).toBe(true);
    expect(list.classList.contains('tabs--underline')).toBe(true);
    expect(tab1!.classList.contains('tab')).toBe(true);
    expect(tab1!.classList.contains('tab--underline')).toBe(true);
    expect(tab2!.classList.contains('tab')).toBe(true);
    expect(tab2!.classList.contains('tab--underline')).toBe(true);
  });

  it('shows the default tab content', () => {
    renderTabs();
    expect(screen.getByText('Content 1')).toBeTruthy();
  });

  it('clicking a tab trigger shows that tab content (Radix behavior)', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeTruthy();
    // Content 1 is hidden (Radix removes it from DOM or sets hidden)
    expect(screen.queryByText('Content 1')).toBeNull();
  });

  it('arrow key navigation between triggers (Radix keyboard behavior)', async () => {
    const user = userEvent.setup();
    renderTabs();
    const tab1 = screen.getByText('Tab 1');
    tab1.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Tab 2')).toBe(document.activeElement);
  });
});
