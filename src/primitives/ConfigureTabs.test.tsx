import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfigureTabs } from './ConfigureTabs.js';

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'flags', label: 'Flags' },
];

describe('ConfigureTabs', () => {
  it('renders all tab labels', () => {
    render(<ConfigureTabs tabs={tabs} value="general" onValueChange={() => {}} />);
    expect(screen.getByText('General')).toBeTruthy();
    expect(screen.getByText('Advanced')).toBeTruthy();
    expect(screen.getByText('Flags')).toBeTruthy();
  });

  it('marks the active tab with aria-selected=true', () => {
    render(<ConfigureTabs tabs={tabs} value="advanced" onValueChange={() => {}} />);
    const active = screen.getByRole('tab', { name: 'Advanced' });
    expect(active.getAttribute('aria-selected')).toBe('true');
  });

  it('marks inactive tabs with aria-selected=false', () => {
    render(<ConfigureTabs tabs={tabs} value="advanced" onValueChange={() => {}} />);
    const inactive = screen.getByRole('tab', { name: 'General' });
    expect(inactive.getAttribute('aria-selected')).toBe('false');
  });

  it('calls onValueChange with tab id when tab clicked', () => {
    const handler = vi.fn();
    render(<ConfigureTabs tabs={tabs} value="general" onValueChange={handler} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Advanced' }));
    expect(handler).toHaveBeenCalledWith('advanced');
  });

  it('does not call onValueChange when active tab clicked', () => {
    const handler = vi.fn();
    render(<ConfigureTabs tabs={tabs} value="general" onValueChange={handler} />);
    fireEvent.click(screen.getByRole('tab', { name: 'General' }));
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('renders with configure-tabs class', () => {
    const { container } = render(
      <ConfigureTabs tabs={tabs} value="general" onValueChange={() => {}} />,
    );
    expect(container.querySelector('.configure-tabs')).toBeTruthy();
  });

  it('forwards className', () => {
    const { container } = render(
      <ConfigureTabs tabs={tabs} value="general" onValueChange={() => {}} className="extra" />,
    );
    expect(container.querySelector('.extra')).toBeTruthy();
  });

  it('uses tablist role on container', () => {
    render(<ConfigureTabs tabs={tabs} value="general" onValueChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeTruthy();
  });

  it('ArrowRight moves focus to next tab (WS6 roving-tabindex)', async () => {
    const user = userEvent.setup();
    render(<ConfigureTabs tabs={tabs} value="general" onValueChange={() => {}} />);
    const generalTab = screen.getByRole('tab', { name: 'General' });
    generalTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toContain('Advanced');
  });

  it('ArrowLeft moves focus to previous tab (WS6 roving-tabindex)', async () => {
    const user = userEvent.setup();
    render(<ConfigureTabs tabs={tabs} value="advanced" onValueChange={() => {}} />);
    const advancedTab = screen.getByRole('tab', { name: 'Advanced' });
    advancedTab.focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement?.textContent).toContain('General');
  });

  it('active tab has tabIndex=0, others have tabIndex=-1 (WS6)', () => {
    render(<ConfigureTabs tabs={tabs} value="advanced" onValueChange={() => {}} />);
    const advancedTab = screen.getByRole('tab', { name: 'Advanced' });
    const generalTab = screen.getByRole('tab', { name: 'General' });
    expect(advancedTab.getAttribute('tabindex')).toBe('0');
    expect(generalTab.getAttribute('tabindex')).toBe('-1');
  });
});
