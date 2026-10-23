// ─────────────────────────────────────────────────────────────
// LESSON 1 — Testing pure functions
//
// A "pure function" always returns the same output for the same
// input and has no side effects (no network, no DOM, no state).
// These are the easiest things to test and the best place to start.
//
// TOOLS USED
//   • describe() — groups related tests into a named block
//   • it()       — alias for test(); defines a single test case
//   • expect()   — wraps a value so you can call matcher methods on it
// ─────────────────────────────────────────────────────────────

import { getTabProps } from '../utils';

// describe() creates a labelled container for a set of related tests.
// Convention: name it after the thing under test.
describe('getTabProps', () => {
  // ── Pattern: AAA (Arrange → Act → Assert) ──────────────────
  // Every test should follow this three-step structure:
  //   1. Arrange  – set up inputs / state
  //   2. Act      – call the thing you're testing
  //   3. Assert   – check the output is what you expect

  it('returns the correct id attribute for index 0', () => {
    // 1. Arrange
    const index = 0;

    // 2. Act
    const result = getTabProps(index);

    // 3. Assert
    // expect(value).toEqual(expected) — deep equality check
    // Use toEqual for objects/arrays; toBe for primitives (===)
    expect(result.id).toBe('navigation-tab-0');
  });

  it('returns the correct aria-controls attribute for index 0', () => {
    const result = getTabProps(0);
    expect(result['aria-controls']).toBe('navigation-tabpanel-0');
  });

  // Test boundary / edge values — what happens at unusual inputs?
  it('handles large index numbers', () => {
    const result = getTabProps(99);
    expect(result.id).toBe('navigation-tab-99');
    expect(result['aria-controls']).toBe('navigation-tabpanel-99');
  });

  // Testing the full return object at once with toEqual
  it('returns an object with both id and aria-controls', () => {
    const result = getTabProps(3);

    // toEqual checks deep equality — good for comparing whole objects
    expect(result).toEqual({
      id: 'navigation-tab-3',
      'aria-controls': 'navigation-tabpanel-3',
    });
  });

  // ── Tip: test what the function DOES, not HOW it does it ───
  // Don't test implementation details (like "it calls String()").
  // Test observable outputs ("given X, I get Y back").
});
