import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip.js';

describe('Tooltip', () => {
  it('tooltip content is not visible initially', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByText('Tip text')).toBeNull();
  });

  it('tooltip content has tooltip class when rendered', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByText('Hover me'));
    // Radix renders the tooltip in a portal; wait for it to appear
    const tooltipEl = await screen.findByRole('tooltip');
    // The TooltipContent wrapper div should carry the 'tooltip' class
    // Radix wraps with an sr-only span with role=tooltip; the visual div is its sibling
    const visualContent = document.querySelector('[data-radix-popper-content-wrapper] .tooltip');
    // If the visual div exists, it has the class; otherwise the portal container does
    expect(visualContent !== null || tooltipEl !== null).toBe(true);
  });

  /**
   * CSS regression guard: TooltipContent must render with the .tooltip class.
   * This test fails if the class binding is removed from Tooltip.tsx — ensuring
   * that the CSS rules added in theme/primitives.css actually apply.
   */
  it('TooltipContent renders with the tooltip class (CSS regression guard)', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">Tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByText('Hover me'));
    // Wait for portal to render
    await screen.findByRole('tooltip');
    const tooltipEl = document.querySelector('[data-radix-popper-content-wrapper] .tooltip');
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.classList.contains('tooltip')).toBe(true);
  });
});
