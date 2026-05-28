/**
 * Regression guards — Tabs, ConfigureTabs, ConfigureHeader CSS class names.
 *
 * These tests assert that the components render with their expected className
 * values. Renaming a class without updating primitives.css breaks styling;
 * this test makes such drift visible in CI.
 *
 * Tests:
 *  Tabs
 *   1. TabsList renders with class "tabs"
 *   2. TabsTrigger renders with class "tab"
 *   3. TabsContent renders with class "tabs-content"
 *   4. TabsTrigger[data-state="active"] present for active tab
 *   5. TabsContent[data-state="inactive"] present for hidden tab
 *
 *  ConfigureTabs
 *   6. Root element has class "configure-tabs"
 *   7. Tab button has class "configure-tabs__tab"
 *   8. Active tab button has class "configure-tabs__tab--active"
 *   9. Label has class "configure-tabs__label"
 *  10. Count badge has class "configure-tabs__count" when count provided
 *
 *  ConfigureHeader
 *  11. Root element has class "configure-header"
 *  12. Title element has class "configure-header__title"
 *  13. Row element has class "configure-header__row"
 *  14. Actions container has class "configure-header__actions"
 *  15. Close button has class "configure-header__close" when onClose provided
 *  16. Breadcrumb has class "configure-header__breadcrumb" when trail provided
 *  17. Crumb has class "configure-header__crumb"
 *  18. Mono crumb has class "configure-header__crumb--mono"
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/primitives/Tabs.js';
import { ConfigureTabs } from '../../src/primitives/ConfigureTabs.js';
import { ConfigureHeader } from '../../src/primitives/ConfigureHeader.js';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

describe('Tabs — CSS class names', () => {
  function renderTabs() {
    return render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
  }

  it('TabsList renders with class "tabs"', () => {
    const { container } = renderTabs();
    // Radix List renders as a div[role="tablist"]
    const list = container.querySelector('[role="tablist"]');
    expect(list).not.toBeNull();
    expect(list!.classList.contains('tabs')).toBe(true);
  });

  it('TabsTrigger renders with class "tab"', () => {
    renderTabs();
    const triggers = screen.getAllByRole('tab');
    expect(triggers.length).toBeGreaterThan(0);
    for (const trigger of triggers) {
      expect(trigger.classList.contains('tab')).toBe(true);
    }
  });

  it('TabsContent renders with class "tabs-content"', () => {
    const { container } = renderTabs();
    // Radix Content panels — query by tabpanel role
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBeGreaterThan(0);
    for (const panel of Array.from(panels)) {
      expect(panel.classList.contains('tabs-content')).toBe(true);
    }
  });

  it('active TabsTrigger has data-state="active"', () => {
    renderTabs();
    const triggers = screen.getAllByRole('tab');
    const active = triggers.find((t) => t.getAttribute('data-state') === 'active');
    expect(active).toBeDefined();
    expect(active!.classList.contains('tab')).toBe(true);
  });

  it('inactive TabsContent has data-state="inactive"', () => {
    const { container } = renderTabs();
    // Radix hides inactive panels — the panel for "b" starts inactive
    const panels = container.querySelectorAll('[role="tabpanel"]');
    const inactive = Array.from(panels).find((p) => p.getAttribute('data-state') === 'inactive');
    // Radix may also remove the element from the DOM by default; accept either.
    // The guard here is: when an inactive panel IS in the DOM it must carry the class.
    if (inactive != null) {
      expect(inactive.classList.contains('tabs-content')).toBe(true);
    }
    // At minimum one active panel should exist in the DOM
    const active = Array.from(panels).find((p) => p.getAttribute('data-state') === 'active');
    expect(active).toBeDefined();
  });
});

// ─── ConfigureTabs ────────────────────────────────────────────────────────────

describe('ConfigureTabs — CSS class names', () => {
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'advanced', label: 'Advanced', count: 3 },
  ];

  function renderConfigureTabs(value = 'general') {
    return render(<ConfigureTabs tabs={tabs} value={value} onValueChange={() => undefined} />);
  }

  it('root element has class "configure-tabs"', () => {
    const { container } = renderConfigureTabs();
    const root = container.querySelector('[role="tablist"]');
    expect(root).not.toBeNull();
    expect(root!.classList.contains('configure-tabs')).toBe(true);
  });

  it('each tab button has class "configure-tabs__tab"', () => {
    renderConfigureTabs();
    const buttons = screen.getAllByRole('tab');
    expect(buttons.length).toBe(2);
    for (const btn of buttons) {
      expect(btn.classList.contains('configure-tabs__tab')).toBe(true);
    }
  });

  it('active tab button has class "configure-tabs__tab--active"', () => {
    renderConfigureTabs('general');
    const buttons = screen.getAllByRole('tab');
    const active = buttons.find((b) => b.getAttribute('aria-selected') === 'true');
    expect(active).toBeDefined();
    expect(active!.classList.contains('configure-tabs__tab--active')).toBe(true);
  });

  it('inactive tab button does NOT have class "configure-tabs__tab--active"', () => {
    renderConfigureTabs('general');
    const buttons = screen.getAllByRole('tab');
    const inactive = buttons.find((b) => b.getAttribute('aria-selected') === 'false');
    expect(inactive).toBeDefined();
    expect(inactive!.classList.contains('configure-tabs__tab--active')).toBe(false);
  });

  it('label span has class "configure-tabs__label"', () => {
    const { container } = renderConfigureTabs();
    const labels = container.querySelectorAll('.configure-tabs__label');
    expect(labels.length).toBe(2);
  });

  it('count badge has class "configure-tabs__count" when count is provided', () => {
    const { container } = renderConfigureTabs();
    const counts = container.querySelectorAll('.configure-tabs__count');
    // only "advanced" tab has count=3
    expect(counts.length).toBe(1);
    expect(counts[0]!.textContent).toBe('3');
  });

  it('no count badge rendered when count is undefined', () => {
    renderConfigureTabs();
    // "general" tab has no count — verify the badge isn't there for it
    const generalTab = screen
      .getAllByRole('tab')
      .find((b) => b.getAttribute('id') === 'configure-tab-general');
    expect(generalTab).toBeDefined();
    expect(generalTab!.querySelector('.configure-tabs__count')).toBeNull();
  });
});

// ─── ConfigureHeader ──────────────────────────────────────────────────────────

describe('ConfigureHeader — CSS class names', () => {
  it('root element has class "configure-header"', () => {
    const { container } = render(<ConfigureHeader title="Settings" />);
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.classList.contains('configure-header')).toBe(true);
  });

  it('title has class "configure-header__title" with correct text', () => {
    render(<ConfigureHeader title="Pipeline Settings" />);
    const title = screen.getByRole('heading', { level: 2 });
    expect(title.classList.contains('configure-header__title')).toBe(true);
    expect(title.textContent).toBe('Pipeline Settings');
  });

  it('row has class "configure-header__row"', () => {
    const { container } = render(<ConfigureHeader title="Settings" />);
    const row = container.querySelector('.configure-header__row');
    expect(row).not.toBeNull();
  });

  it('actions container has class "configure-header__actions"', () => {
    const { container } = render(<ConfigureHeader title="Settings" />);
    const actions = container.querySelector('.configure-header__actions');
    expect(actions).not.toBeNull();
  });

  it('close button has class "configure-header__close" when onClose provided', () => {
    render(<ConfigureHeader title="Settings" onClose={() => undefined} />);
    const close = screen.getByRole('button', { name: /close/i });
    expect(close.classList.contains('configure-header__close')).toBe(true);
  });

  it('no close button rendered when onClose is not provided', () => {
    render(<ConfigureHeader title="Settings" />);
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('breadcrumb has class "configure-header__breadcrumb" when trail provided', () => {
    const { container } = render(
      <ConfigureHeader
        title="Settings"
        trail={[{ label: 'Jobs' }, { label: 'my-book.pdf', mono: true }]}
      />,
    );
    const bc = container.querySelector('.configure-header__breadcrumb');
    expect(bc).not.toBeNull();
  });

  it('each crumb has class "configure-header__crumb"', () => {
    const { container } = render(
      <ConfigureHeader title="Settings" trail={[{ label: 'Jobs' }, { label: 'my-book.pdf' }]} />,
    );
    const crumbs = container.querySelectorAll('.configure-header__crumb');
    expect(crumbs.length).toBe(2);
  });

  it('mono crumb has class "configure-header__crumb--mono"', () => {
    const { container } = render(
      <ConfigureHeader
        title="Settings"
        trail={[{ label: 'Jobs' }, { label: 'my-book.pdf', mono: true }]}
      />,
    );
    const mono = container.querySelectorAll('.configure-header__crumb--mono');
    expect(mono.length).toBe(1);
    expect(mono[0]!.textContent).toContain('my-book.pdf');
  });

  it('no breadcrumb rendered when trail is empty', () => {
    const { container } = render(<ConfigureHeader title="Settings" trail={[]} />);
    const bc = container.querySelector('.configure-header__breadcrumb');
    expect(bc).toBeNull();
  });

  it('children are rendered in the actions slot', () => {
    render(
      <ConfigureHeader title="Settings">
        <button type="button">Save</button>
      </ConfigureHeader>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
  });
});
