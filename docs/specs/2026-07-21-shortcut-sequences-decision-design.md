---
kind: spec
status: active
owner: CT
created: 2026-07-21
last_verified: 2026-07-21
disposition: deferred
---

# Shortcut sequences remain deferred until a consumer needs them

`useShortcuts` will keep its current modifier-combo contract until a real consumer requests key sequences.

## Agent Index

- **Kind:** spec
- **Status:** active
- **Read when:** proposing sequence shortcuts such as `g p` or changing `useShortcuts` parsing.
- **Search terms:** useShortcuts, key sequence, chord, timeout, prefix conflict.
- **Relates to:** [sequence issue](../issues/2026-07-15-useshortcuts-chord-sequences.md),
  [conditional plan](../plans/2026-07-21-shortcut-sequences-conditional.md).

## Adversarial Review

The author checked the decision against the issue, current hook, current tests, and compatibility constraints. An independent writing-docs review could not run because the shared agent pool had no free slot. No unresolved author finding remains.

## The current API remains unchanged

No current consumer depends on sequence shortcuts. Adding state, timers, and ambiguity rules now would expand a stable shared hook without demonstrated value. Existing strings such as `mod+s`, `shift+?`, and `arrowright` remain single combinations.

The issue stays active and deferred. A named consumer with an accepted sequence binding activates the conditional plan.

## An activated design uses space-separated steps

When activated, whitespace separates sequential steps and `+` continues to separate simultaneous keys. For example, `g p` is two plain-key steps and `mod+k p` is a modified first step followed by `p`. Leading, trailing, and repeated whitespace is ignored.

Each step uses the existing combo grammar. Empty sequences and steps without a non-modifier key are invalid and must be ignored without firing a handler.

## Sequence state is short-lived and local to the hook

The hook will retain the matched prefix and a single timer. The timeout is 1,000 milliseconds from the latest matched step. A matching next step advances the sequence; a complete match fires once and clears the state.

Escape, timeout, blur, unmount, `enabled: false`, and an unrelated key clear pending state. The unrelated key is then evaluated once as a fresh first step, so a valid single-key binding is not swallowed.

## Exact bindings win over prefixes

If one binding is a complete match and another uses the same keys as a prefix, the complete binding fires immediately. This rule avoids delaying existing single-combo shortcuts. Consumers must not register a sequence whose prefix must suppress an existing exact binding.

If two completed bindings match the same sequence, declaration order continues to select the first match.

## Editable targets keep the existing safety rule

Every step must pass the binding's existing `allowInEditable` policy. A rejected step clears pending state. Plain-key sequences therefore remain inert in inputs, textareas, and contenteditable elements unless the consumer opts in.

## Display and accessibility expose each step

`formatShortcut` will return one display token group per step only when the public display API is deliberately revised. Until that API revision is specified with its first consumer, sequence bindings must not be registered for cheatsheet display.

The activation design must add an accessible separator such as `then` between step groups. It must not represent a sequence as simultaneous keycaps.

## Alternatives rejected

- Implementing immediately has no consumer and adds timer-driven behavior to every mounted hook.
- Treating all unmatched keys as swallowed would break existing single-key shortcuts.
- Delaying an exact binding to wait for a longer sequence would change established response time.

## Activation criteria

Implementation may begin only when all conditions hold:

- A consumer repository names at least one sequence and its user-visible action.
- The consumer accepts immediate exact-binding precedence.
- The cheatsheet display requirement is either specified or registration is disabled for the sequence.
- The conditional plan is re-verified against current `useShortcuts` code and tests.
