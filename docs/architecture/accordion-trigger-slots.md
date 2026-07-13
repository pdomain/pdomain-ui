---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Accordion trigger slots

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** composing AccordionTrigger leading, trailing, or chevron content.
- **Search terms:** AccordionTrigger, startContent, endContent, chevron, Radix accordion.

## Current behavior

AccordionTrigger accepts optional `startContent`, `endContent`, and `chevron`
props. Leading content renders before children. Trailing content renders before
the chevron. An undefined chevron uses the built-in glyph, `false` suppresses
it, and a React node replaces it. With no new props, the original DOM path and
styling remain unchanged.

## Concrete deviations

The component conforms to its design. The repository does not prove that every
consumer removed its raw-Radix wrapper, and interactive trailing content still
requires consumer-level keyboard review.

## Durable decisions

- Use additive React-node slots rather than domain-specific trigger props.
- Do not change event propagation for slotted content.
- Preserve default markup and chevron behavior for existing consumers.

## Evidence

- Docs: `docs/specs/2026-06-16-accordion-trigger-slots-design.md`,
  `docs/plans/2026-06-16-accordion-trigger-slots.md`
- Code/tests: `src/primitives/Accordion.tsx`,
  `src/primitives/Accordion.test.tsx`, `theme/primitives.css`
- History: commits `7c3c755`, `4909693`, and `b28b3d3`
