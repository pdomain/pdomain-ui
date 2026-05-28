/**
 * Tests for resolveToken — CSS custom property resolver for Konva props.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveToken } from './resolveToken.js';

describe('resolveToken', () => {
  it('returns fallback when window is undefined', () => {
    const origWindow = globalThis.window;
    // @ts-expect-error — simulate SSR
    delete globalThis.window;
    const result = resolveToken('--accent', '#fallback');
    expect(result).toBe('#fallback');
    // restore
    globalThis.window = origWindow;
  });

  it('returns the computed property value when defined', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => (name === '--accent' ? ' #6e9cdf ' : ''),
    } as unknown as CSSStyleDeclaration);

    const result = resolveToken('--accent', '#fallback');
    expect(result).toBe('#6e9cdf');
  });

  it('returns fallback when computed value is empty string', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);

    const result = resolveToken('--nonexistent', '#fallback');
    expect(result).toBe('#fallback');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
