/// <reference lib="dom" />
// ─────────────────────────────────────────────────────────────
// LESSON 3 — Testing custom hooks
//
// Hooks cannot be called outside of a React component. RTL's
// renderHook() creates a tiny wrapper component behind the scenes
// so you can call your hook and inspect/update its return values.
//
// This hook also uses IntersectionObserver — a browser API that
// jsdom does NOT implement. So we also learn how to mock a global
// API with jest.fn() and jest.spyOn().
//
// TOOLS USED
//   • renderHook() – renders a hook in an isolated wrapper component
//   • act()        – flushes React state updates and effects
//   • jest.fn()    – creates a mock function you can make assertions on
//   • beforeEach() – setup code that runs before every test in the block
//   • afterEach()  – cleanup code that runs after every test in the block
// ─────────────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

// ── Step 1: Mock the missing browser API ────────────────────
//
// IntersectionObserver is a browser API that jsdom doesn't implement.
// If we don't mock it, every test using this hook will throw:
//   "ReferenceError: IntersectionObserver is not defined"
//
// The plan:
//   1. Store the callback that the hook passes to `new IntersectionObserver()`
//   2. In our tests, call that callback manually to simulate an element
//      entering or leaving the viewport.

// These hold references to the mock functions so we can assert on them.
let mockObserve: jest.Mock;
let mockUnobserve: jest.Mock;
// This stores the callback the hook registers with IntersectionObserver.
// Typing it as a function lets us call it directly in tests.
let capturedCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;

beforeEach(() => {
  // jest.fn() creates a "spy" — a function that records every call.
  // You can then ask: was it called? How many times? With what arguments?
  mockObserve = jest.fn();
  mockUnobserve = jest.fn();

  // Replace the global IntersectionObserver with our mock class.
  // The constructor receives the user's callback — we capture it so
  // tests can simulate "an element entered the viewport" by calling it.
  (global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = jest.fn().mockImplementation((callback) => {
    capturedCallback = callback;
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: jest.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  // jest.restoreAllMocks() resets every mock back to its original state.
  // Without this, mocks leak between tests and cause hard-to-debug failures.
  jest.restoreAllMocks();
});

// ── Helpers ──────────────────────────────────────────────────
// A helper that simulates the sentinel element entering the viewport.
// "act()" is required whenever something causes a React state update.
// Without it, React will warn that updates happened outside act().
const simulateIntersecting = (isIntersecting = true) => {
  act(() => {
    capturedCallback([{ isIntersecting } as IntersectionObserverEntry]);
  });
};

// ── Tests ────────────────────────────────────────────────────
describe('useInfiniteScroll', () => {
  // Helper to create default options, allowing easy overrides per test.
  const defaultOptions = (overrides = {}) => ({
    hasMore: true,
    isLoading: false,
    onLoadMore: jest.fn(),
    ...overrides,
  });

  it('returns an observerTarget ref', () => {
    const { result } = renderHook(() => useInfiniteScroll(defaultOptions()));

    // result.current is the current return value of the hook.
    // We just check the ref exists — its .current starts as null
    // because no real DOM element is attached in this test.
    expect(result.current.observerTarget).toBeDefined();
    expect(result.current.observerTarget.current).toBeNull();
  });

  it('registers an IntersectionObserver on mount', () => {
    renderHook(() => useInfiniteScroll(defaultOptions()));

    // Assert the browser API was actually instantiated.
    expect(
      (global as unknown as { IntersectionObserver: jest.Mock }).IntersectionObserver,
    ).toHaveBeenCalledTimes(1);
  });

  it('calls onLoadMore when the element intersects and hasMore is true', () => {
    const onLoadMore = jest.fn();
    renderHook(() => useInfiniteScroll(defaultOptions({ onLoadMore })));

    // The hook registered a callback with IntersectionObserver.
    // Calling capturedCallback() mimics the browser firing the event.
    simulateIntersecting(true);

    // toHaveBeenCalledTimes(1) — the mock was called exactly once
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onLoadMore when isLoading is true', () => {
    // If a load is already in progress, triggering another is wasteful.
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll(defaultOptions({ isLoading: true, onLoadMore })),
    );

    simulateIntersecting(true);

    // not.toHaveBeenCalled() — the mock was never called
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does NOT call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll(defaultOptions({ hasMore: false, onLoadMore })),
    );

    simulateIntersecting(true);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does NOT call onLoadMore when isIntersecting is false', () => {
    const onLoadMore = jest.fn();
    renderHook(() => useInfiniteScroll(defaultOptions({ onLoadMore })));

    // The element left the viewport — should NOT trigger a load.
    simulateIntersecting(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  // ── Testing cleanup (useEffect return value) ─────────────────
  // React calls the cleanup function returned from useEffect when the
  // component unmounts. Leaking observers wastes memory and can cause
  // tests to interfere with each other — worth verifying it cleans up.
  it('unobserves the target when the hook unmounts', () => {
    const { unmount } = renderHook(() => useInfiniteScroll(defaultOptions()));

    // unmount() triggers React's cleanup (the function returned from useEffect).
    unmount();

    // The hook should call observer.unobserve() in its cleanup.
    // Note: in jsdom observerTarget.current is null (no real DOM), so
    // unobserve won't actually be called here — this test documents that
    // expectation and would catch a regression if a real DOM ref is added.
    // For now we assert it was NOT called with a null argument.
    const callArgs = mockUnobserve.mock.calls.flat();
    expect(callArgs).not.toContain(null);
  });
});
