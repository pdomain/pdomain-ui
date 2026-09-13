import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver. Provide a no-op stub so
// components that use it (e.g. PageImageCanvas) don't throw.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom doesn't implement PointerEvent. Radix UI's DismissableLayer uses
// PointerEvent to detect outside clicks (issue #32 coverage).
// Provide a minimal class that extends MouseEvent so dispatchEvent works.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerType: string;
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
      this.pointerType = init?.pointerType ?? 'mouse';
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as Record<string, any>)['PointerEvent'] = PointerEventPolyfill;
}
