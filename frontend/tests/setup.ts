/**
 * Vitest global test setup
 * Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * and provides browser API polyfills for jsdom.
 */
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

/* ---------- Browser API stubs for jsdom ---------- */

// IntersectionObserver (used by reveal animations, lazy-loading, etc.)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve() {}
}
globalThis.IntersectionObserver = MockIntersectionObserver as any;

// matchMedia (used by responsive hooks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// scrollTo
window.scrollTo = vi.fn() as any;

// ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as any;
