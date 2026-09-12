# WF-05b · Scannos — discussion notes

Running notes for the design session. Captures positions, pushback, and decisions before any artboards exist. Edited as we go.

---

## Status

**Three surfaces in progress.** Mental model fixed. Drawing **Capture / Promote / Configure** on the canvas.

## Resolved decisions

1. **`text_post_process` is annotative, not destructive.** The stage produces a sidecar `{token, span, rule_id, suggestion?, confidence, source}` that travels with the page. Auto-replace (when a rule opts in) is a *recorded* edit with provenance, never a silent mutation.
2. **Model 2 (suspicion) is primary.** Model 1 (find/replace transformation) is a per-rule opt-in checkbox on top. Model 3 (OCR-confidence) is a candidate pool feeding the same promotion queue.
3. **Primary consumer is PGDP; hobbyist-direct is secondary.** Threat model is "wasted proofer effort," not "silent corruption." But because hobbyist-direct exists at all, every suspicion ships *with a suggestion when we have one* — no highlight-without-an-answer state as a first-class UI.

### Surfaces this implies

- **Pipeline stage (P)** — a new *optional* stage `scannos` inserted between `spellcheck` and `text_review`. Reads OCR output + global library + book-local candidates, emits the suspicion sidecar. Annotation only; auto-apply rules become explicit edits in the change log at the *next* stage. Disabling the stage skips the sidecar but leaves manual marking inside the Page Workbench intact.
- **Capture (C1)** — in the Page Workbench: select a token → "mark as scanno candidate." Stays book-local until promoted. Suspicion annotations from the pipeline render as token highlights with a side-panel list.
- **Promote (C2)** — per-book candidate panel (Project Configure → Settings tab). Book-local candidates with evidence (hits, source: manual / OCR / matched-global-rule). Action: dismiss, accept-locally, or promote-to-global.
- **Configure (C3)** — the WF-05a global library shell gains a **Scannos** category. Each rule: pattern, optional suggestion, auto-apply toggle (default off), scope (project / book), evidence trail.

---

## The fork we had to take first

> **Auto-replace vs. flag-for-review.**
>
> The current `text_post_process` stage mutates text before proofers see it. Treating scannos as find/replace pairs assumes that model. The PGDP community's actual artifact ("Stealth Scannos") is a *highlight* layer, not a transform layer — proofers see the suspicious token in context and decide per-instance.
>
> Everything downstream branches off this choice.

Decision: **flag-for-review primary, auto-replace opt-in per rule.** See "Resolved decisions" above.

---

## Pushbacks on the original framing

### "False positives are catastrophic"

Overstated for PGDP's pipeline. Every page is proofed by ≥2 humans. A bad auto-replace ships to a proofer (annoying), not to a reader (catastrophic). Threat model is "wasted proofer effort," not "silent corruption." Trust gating can be lighter than the framing implied.

### "Find/replace pairs" as the unit

This is what the legacy `/settings` textarea assumed. It encodes a strong (probably wrong) opinion that scannos auto-mutate. The PGDP community has been working around this with word-level patterns and proofer-facing highlighting for years. The "pair" might not be the right primitive — a "suspicious pattern with context" might be.

### "Volume = thousands"

The active per-book set is small (<50 typical). The corpus of *known* scannos in shared lists is in the low hundreds. "Thousands" was hand-wavy. Don't design for a scale that doesn't exist.

### Three intake sources presented as peers

Manual / promoted-from-book / OCR-confidence are not symmetric. Promoted-from-book is the evidence-backed primary. OCR-confidence is a *candidate pool* feeding the same promotion queue, not a parallel intake. Manual is an escape hatch. Designing them as three equal routes invites a Frankenstein UI.

---

## Open structural questions

- Is `text_post_process` destructive (mutates text) or annotative (tags tokens)? Architectural question that constrains every surface we'd draw.
- Does PGDP-prep need to ship scanno *application* at all, or just scanno *capture* (with application deferred to the proofing UI)?
- How does this interact with WordCheck / good_words / bad_words / dictionary additions? Probably one system with multiple views, not several systems.

---

## Mental-model candidates

Three plausible answers to "what is a scanno?"

1. **Transformation rule.** `find → replace`, applied to text. The legacy model.
2. **Suspicion pattern.** A token that should be highlighted in the proofing UI for human review. PGDP "Stealth Scannos" model.
3. **OCR-corpus annotation.** A label on a token saying "this came from a low-confidence OCR reading." Not a rule at all — derived data.

Picking one collapses 60% of the framing questions. Picking two means we need a hand-off between them.

**Committed: (2) is the primary**; **(1) is opt-in per-rule for the few cases where the user is willing to vouch**; **(3) is the input pipeline that feeds (2)**.

---

## Parking lot

Items we'll come back to once the mental model is fixed:

- Regex expressiveness ladder
- Per-book disable/enable mechanics
- Promotion thresholds
- Import/export (already in WF-05a L8/L9 — re-use whatever shape we land on)
- Order of application (only matters under model 1)
- Versioning / rule-set pinning
