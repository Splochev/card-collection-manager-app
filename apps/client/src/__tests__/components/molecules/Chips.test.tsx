// ─────────────────────────────────────────────────────────────
// LESSON 2 — Testing React components
//
// React Testing Library (RTL) encourages you to test components
// the way a *user* would interact with them — via the visible DOM
// rather than implementation details like state or method calls.
//
// Golden rule: "The more your tests resemble the way your software
//               is used, the more confidence they can give you."
//
// TOOLS USED
//   • render()       – mounts a component into a virtual DOM
//   • screen        – query helpers that search the rendered DOM
//   • fireEvent     – low-level DOM event dispatcher
//
// QUERY PRIORITY (use the one highest on this list that applies)
//   1. getByRole      – best; mirrors accessibility tree
//   2. getByLabelText – for form elements
//   3. getByText      – visible text
//   4. getByTestId    – last resort; add data-testid to the element
//
// QUERY VARIANTS
//   getBy*   → throws if nothing found (use for "must exist")
//   queryBy* → returns null if nothing found (use for "must NOT exist")
//   findBy*  → returns a Promise; use for async/lazy-loaded content
// ─────────────────────────────────────────────────────────────

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chips from '../../../components/molecules/Chips';

// ── Baseline: does the component render without crashing? ────
describe('Chips', () => {
  it('renders without crashing when given an empty labels array', () => {
    // render() mounts the component. If it throws, the test fails.
    // This is the simplest possible sanity check.
    render(<Chips labels={[]} />);
  });

  // ── Querying rendered content ────────────────────────────────
  it('renders a chip for each label', () => {
    render(<Chips labels={['Fire', 'Water', 'Grass']} />);

    // screen.getByText() searches ALL rendered text nodes.
    // It throws if the text is not found — which itself is the assertion.
    // Add .toBeInTheDocument() to make the intent explicit.
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Grass')).toBeInTheDocument();
  });

  it('renders the correct number of chips', () => {
    const labels = ['Red', 'Blue', 'Green', 'Yellow'];
    render(<Chips labels={labels} />);

    // getAllByText returns an array — useful when the same text can appear
    // multiple times, but here we use a pattern to find all chip text nodes.
    // MUI Chip renders its label inside a span with class MuiChip-label.
    // Using a role query is often more resilient than relying on class names.
    //
    // Each MUI Chip doesn't have a landmark role by default, so we use
    // getAllByText with each label individually and count them.
    const renderedLabels = labels.map((l) => screen.getByText(l));
    expect(renderedLabels).toHaveLength(4);
  });

  // ── Conditional rendering ────────────────────────────────────
  // The scroll buttons are only shown when content overflows.
  // In jsdom, layout is not computed, so scrollWidth === clientWidth
  // and the buttons will NOT appear. We can test the "no overflow" case.
  it('does not show scroll buttons when content does not overflow', () => {
    render(<Chips labels={['A', 'B']} />);

    // queryByRole returns null (instead of throwing) when the element
    // is absent. Use this pattern to assert something does NOT exist.
    expect(
      screen.queryByRole('button', { name: 'Scroll left' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Scroll right' }),
    ).not.toBeInTheDocument();
  });

  // ── Testing behaviour with fireEvent ─────────────────────────
  // fireEvent dispatches synthetic DOM events.
  // For clicks, fireEvent.click(element) is enough.
  // For typing, prefer userEvent from @testing-library/user-event (more realistic).
  it('calls fireEvent.click on a chip without throwing', () => {
    render(<Chips labels={['Dragon']} />);
    const chip = screen.getByText('Dragon');

    // fireEvent.click simulates a click. If no error is thrown,
    // the interaction is handled gracefully by the component.
    expect(() => fireEvent.click(chip)).not.toThrow();
  });
});
