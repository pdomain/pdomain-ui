---
kind: spec
status: implemented
owner: CT
created: 2026-05-24
last_verified: 2026-07-13
promotes_to: docs/architecture/design-system-composition.md
disposition: promote-then-retire
---

# pdomain-ui design-handoff port — recon + atoms + templates

**Status:** draft (brainstorming output, awaiting CT review)
**Date:** 2026-05-24
**Source brief:** `pdomain-ui/docs/templates/design_handoff_pdomain_ui/PROMPT.md`
**Scope:** Passes 1–3.1 from PROMPT.md (recon, atom reconcile, layout templates + cross-stage molecules). Stage-specific components and wireframe-only components deferred to a follow-on spec.

## 1 · Goal

Port the visual language and component surface from the
`design_handoff_pdomain_ui/` design bundle into pdomain-ui as **generic, typed,
shared** components — so that every present and future pdomain-* SPA
(`pdomain-prep-for-pgdp`, `pdomain-ocr-simple-gui`, `pdomain-ocr-labeler-spa`, future
trainer SPA, etc.) implements its UI by composing pdomain-ui exports rather
than reimplementing chrome.

The deliverable for this spec is a coherent slice of that port covering:

1. A reviewed **port-plan** (the audit / verdict document).
2. The **atom-layer gaps** the audit surfaces.
3. The **layout templates** and **cross-stage molecules** that every
   stage in the design bundle reuses.

Stage-specific components (Source's file workbench state machine,
Hyphen-join's case-card decision UI, Crop's threshold controls,
Grayscale's mode picker, etc.) and the wireframe-only explorations
(wf09 reorder, wf05b scannos, wf-pw page workbench, wf02 validation,
wf03 quality flags) are out of scope here and addressed by a follow-on
spec to be written after this one ships.

## 2 · Non-goals

- Migrating any consumer app (`pdomain-prep-for-pgdp`,
  `pdomain-ocr-simple-gui`, `pdomain-ocr-labeler-spa`) onto the new exports —
  consumer migration is downstream work.
- Rewriting `tokens.css` or `primitives.css`. Additive only, and only if
  Phase 1 finds gaps (recon suggests none).
- Switching pdomain-ui's icon library away from `lucide-react`.
- Porting any component whose verdict in the port-plan is `skip` or
  `co-locate` (page-scoped helpers, prototype scaffolding).
- Stage-specific components or wireframe-only explorations (deferred to
  follow-on spec).
- Storybook framework changes — use the existing collocated
  `.stories.tsx` convention.

## 3 · Constraints

From pdomain-ui CLAUDE.md (hard):

- No CVA. Variants are CSS class modifiers on design-system primitives.
- No hex literals in component styles — all colors `var(--token)`.
- No direct `lucide-react` imports outside `src/icons/`.
- Stores are factories, not singletons.
- Strict TS: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`.
- Deploy-mode-agnostic — components never branch on hosted-vs-local.
- Port-not-copy — design the slot-based API first, then port; do not
  verbatim-copy prototype scaffolding.

From PROMPT.md:

- No `!important` in any ported CSS.
- Strip `<script type="text/babel">`, `Object.assign(window, ...)`,
  `DesignCanvas` / `DCSection` / `DCArtboard` wrappers, and the
  `localStorage('pgd-theme')` toggle.
- Preserve `data-screen-label` / `data-comment-anchor` attributes; map
  to pdomain-ui's `testids` convention.

## 4 · Approach: recon-first, then atoms, then templates

Three phases, single milestone (`spec: pdomain-ui-design-handoff (#N)` in
`ocr-container-meta`). Phase 1 produces a written audit that gates
Phases 2–3.

### 4.1 Phase 1 — recon (port-plan deliverable)

One issue. No code. Deliverable:

**`docs/research/2026-05-24-design-handoff-port-plan.md`** containing
five tables.

1. **Atom verdict table** — every identifier from
   `design-system/ui-base.jsx`, one row each:
   `name | already-in-pdomain-ui | port | rename | skip` plus target path.
2. **Token diff table** — every `--*` in design's `tokens.css` vs
   pdomain-ui's `src/theme/tokens.css`: `identical | alias-needed |
   missing`. (Recon suggests this table is mostly `identical`.)
3. **Icon mapping table** — every name in the design's `Icon`
   switch-statement: `lucide-name | bespoke | skip`. ~50 rows.
4. **Cross-stage molecule inventory** — for every identifier that
   appears in 3+ files of the design bundle: classify as `cross-stage
   molecule` (port into pdomain-ui under this spec's Phase 3) vs
   `stage-specific` (defer to follow-on spec). Examples expected to
   land in cross-stage: `StageContextStrip`, `ViewToggle`, `BulkBar`,
   `FileToolbar`, `ThumbCard`, `AttributesPanel`, `RunAllDirtyPanel`,
   `BuildPackagePanel`, `DiskCostBanner`.
5. **Template inventory** — for `PipelineTemplate`, `AppTemplate`,
   `ProjectSettingsTemplate`, `ProjectConfigureFrame`,
   `ProjectsLanding`: confirm props/slots and dependencies on
   molecules from table 4.

**Gate:** CT reviews and approves the port-plan before any Phase 2/3
issue is started. CT review may move identifiers between
classifications; the spec's Phase 3 issue list is provisional until the
port-plan is approved.

### 4.2 Phase 2 — atom-layer reconciliation

Confirmed by recon, **already in pdomain-ui** (no work needed): `Button`,
`Badge`, `Input`, `KeyCap`, `Tooltip`, `Chip`, `Tabs`, `Separator`
(=`Divider`).

Confirmed **gaps** to port:

- **Icon** — extend `src/icons/lucide.ts` with re-exports for the
  ~35–40 design icons that have lucide equivalents (per Phase 1 icon
  mapping table). Add the remaining domain-specific glyphs to
  `src/icons/bespoke.tsx` as typed components. Update
  `Icons.stories.tsx`. No new `Icon` switch component — apps continue
  to import named icon components directly from
  `@pdomain/pdomain-ui/icons`.
- **Segmented** — inset single-select segmented control. Distinct from
  the existing `ToggleGroup` (which is a flat multi-select group).
  Used across every wired stage.
- **StepDots** — numbered-circle progress indicator. Used in onboarding
  / pipeline progression states.
- **PageHeader** — title + breadcrumb composite. pdomain-ui has `Breadcrumb`
  and `TopNav` separately but no `PageHeader` molecule.

Open until Phase 1: `AppFrame`, `ServerFooter`, `ProjectListBackdrop`.
Recon suggests `AppFrame` overlaps `AppShell` (likely no port),
`ServerFooter` is suite-wide chrome (may belong in `shell/` not
`primitives/`), and `ProjectListBackdrop` is decoration that may be
skipped. Port-plan decides.

**Per atom:**
- Typed `Props` interface (no `any`, no `Record<string, unknown>`
  widening).
- Collocated `.stories.tsx` — one story per `DCArtboard` in the source
  design file (the design's exploration grid maps 1-to-1 to stories).
- Collocated `.test.tsx` — Vitest + jsdom; behavior, prop variants,
  a11y for interactive atoms.
- `make ci AI=1` green before commit.

### 4.3 Phase 3 — templates + cross-stage molecules

Three templates from `final/`:

- **`PipelineTemplate`** — page chrome shared by all wired pipeline
  stages. Props: `header`, `stageStrip`, `tabs`, `body`, `bulkBar`
  (slots). Composes `StageStrip` + `TabsBand`.
- **`ProjectsLandingTemplate`** — projects landing chrome from
  `final/projects/projects.jsx`. Slots: `attributesPanel`,
  `coverGrid`, `pipelineMini`.
- **`ProjectSettingsTemplate`** — settings layout from
  `final/pipeline/project-settings.jsx`. Slots: `panels` (left),
  `body` (right).

Cross-stage molecules (final list from Phase 1 inventory):

- **`StageStrip`** — stage progress + nav strip; 8+ usages in
  COMPONENT_INDEX.
- **`TabsBand`** — sticky tab band used at the top of every stage
  body.
- **`BulkBar`** — sticky bottom bulk-action bar.
- **`AttributesPanel`** — right-side attributes panel.
- **`ViewToggle`** — view-mode switch (grid / list).
- Plus any others Phase 1 classifies as cross-stage (anticipated:
  `FileToolbar`, `ThumbCard`, `RunAllDirtyPanel`,
  `BuildPackagePanel`, `DiskCostBanner`).

**Per template/molecule:**
- Slot-based API (children or named render props). No verbatim copy of
  prototype's local state.
- Typed `Props`; discriminated unions for state variants
  (e.g. `state: 'idle' | 'busy' | 'done'`).
- Tone / variant string-literal unions pulled from `tokens.css`:
  `tone: 'clean' | 'dirty' | 'review' | 'fuzzy' | 'exact' | 'gt' |
  'mismatch'`.
- Collocated `.stories.tsx` + `.test.tsx`.
- Preserve `data-screen-label` / `data-comment-anchor` attributes as
  pdomain-ui `testids` constants.

### 4.4 Phase 3.x — MIGRATION_NOTES.md

Final issue under this spec: write `pdomain-ui/MIGRATION_NOTES.md` describing:

- Every new pdomain-ui export (atom / molecule / template) and which design
  file it came from.
- Tokens added or aliased.
- Conscious omissions and the reason.
- Open questions for CT (the human).

## 5 · Folder layout in pdomain-ui

- New atoms → `src/primitives/` (collocated `.tsx` + `.stories.tsx` +
  `.test.tsx`, matching existing convention).
- New icons → `src/icons/lucide.ts` (additions) +
  `src/icons/bespoke.tsx` (domain glyphs).
- New templates → **new `src/templates/`** folder. Distinct from
  `src/shell/` (which owns suite-wide chrome: `AppShell`, `Drawer`,
  `Rail`, `TopNav`). Templates are page-level layouts that a consuming
  app composes *inside* `AppShell`.
- New cross-stage molecules → folded into `src/primitives/` if they're
  reusable across non-pipeline contexts; otherwise `src/templates/`
  alongside the templates that consume them. Phase 1 port-plan
  decides per-molecule.
- Tokens → no new file; gaps (if any) added to existing
  `src/theme/tokens.css` under the existing naming convention. Synced
  to `docs/design-system/` via existing
  `scripts/sync-design-system.mjs`.
- Port-plan deliverable →
  `docs/research/2026-05-24-design-handoff-port-plan.md`.

**No `src/pd-prep/` folder.** PROMPT.md's suggested
pdomain-prep-prefixed naming is wrong for pdomain-ui — these components are
generic and shared across every pdomain-* SPA.

## 6 · Icon strategy

Lucide-first, bespoke for gaps.

- Phase 1 produces the full mapping table (~50 names → `lucide-name |
  bespoke | skip`).
- Phase 2a issue executes the table: re-export named lucide
  components from `src/icons/lucide.ts`; implement domain glyphs in
  `src/icons/bespoke.tsx` as typed components matching the existing
  bespoke convention.
- Apps continue to import named icon components from
  `@pdomain/pdomain-ui/icons`. No design-style `<Icon name="…" />`
  switch component.
- MIGRATION_NOTES documents the full mapping.

## 7 · Token reconciliation

Recon confirms pdomain-ui's `src/theme/tokens.css` already defines every
custom property used by the design bundle's `tokens.css`
(`--bg-page`, `--bg-surface`, `--ink-1..4`, `--accent`,
`--exact/fuzzy/mismatch/ocr/gt`, `--block/para/line/word`,
`--ui-font`, `--mono-font`, `--shadow-floating`).

Phase 1's diff table verifies. Any actual gap → added to
`src/theme/tokens.css` with the same name, no aliases. If diff is
empty (likely), Phase 2e is closed as no-op.

## 8 · Architecture: slot-based composition

Templates expose **slot props** rather than configuration:

```tsx
<PipelineTemplate
  header={<PipelineHeader project={p} />}
  stageStrip={<StageStrip stages={s} current="grayscale" />}
  tabs={<TabsBand items={t} />}
  body={<MyStageBody />}
  bulkBar={<BulkBar selected={sel} />}
/>
```

Reasons:
- Keeps templates deploy-mode-agnostic and stage-agnostic.
- Allows consuming apps to swap any region without forking the
  template.
- Mirrors pdomain-ui's existing `AppShell` slot pattern (`<AppShell
  rail={…} settingsSlot={…} launcherSlot={…} …>`).
- Avoids leaking pipeline-specific state types into pdomain-ui.

Cross-stage molecules expose **typed data props** (the data they
render) plus optional render-prop slots for nested customization
(e.g., `BulkBar` accepts an `actions` render prop so apps can supply
stage-specific actions).

## 9 · Testing

- **Unit:** Vitest + jsdom collocated `.test.tsx` per component.
  Behavior tests, prop variants, a11y for interactive components.
- **Storybook:** one story per design `DCArtboard`. Stories double as
  visual regression baselines.
- **Type:** `tsc --noEmit` clean under strict settings.
- **CI gate:** `make ci AI=1` (install + lint + typecheck + test +
  build) before every commit.

No new test infrastructure; reuse the existing `.storybook/` setup,
Vitest config, and CI pipeline.

## 10 · Risks and mitigations

- **Risk:** Phase 1 inventory blows scope (too many cross-stage
  molecules to fit in this spec).
  **Mitigation:** CT review of port-plan can defer borderline
  molecules to the follow-on spec. If still too large, split Phase 3
  into 3a (templates only) and 3b (molecules) under separate
  follow-on specs.
- **Risk:** Design tokens diverge subtly (same name, different
  meaning) and we miss it.
  **Mitigation:** Phase 1 diff table compares values, not just
  names. Any value mismatch is flagged for CT decision.
- **Risk:** Slot-based template API doesn't fit a stage we haven't
  port-planned yet.
  **Mitigation:** Stage-specific spec follows this one; if a template
  needs revision, that's a known iteration. PROMPT.md explicitly
  frames this as "not a one-shot port."
- **Risk:** PageHeader / AppFrame / ServerFooter classification
  overlaps existing `src/shell/` exports.
  **Mitigation:** Phase 1 port-plan resolves each by reading
  `src/shell/` and deciding port-into-primitives vs extend-shell
  vs skip.

## 11 · Issue decomposition (provisional)

New milestone: `spec: pdomain-ui-design-handoff (#N)` in
`ocr-container-meta`. Final issue list determined by `/decompose-spec
--sync` after CT approves this spec.

Anticipated issues:

| # | Phase | Title | Depends on |
|---|---|---|---|
| 1 | 1 | Write `design-handoff-port-plan.md` audit | — |
| 2 | 2a | Port Icon: lucide additions + bespoke gaps | 1 |
| 3 | 2b | Port Segmented atom | 1 |
| 4 | 2c | Port StepDots atom | 1 |
| 5 | 2d | Port PageHeader atom (if confirmed by port-plan) | 1 |
| 6 | 2e | Reconcile token-diff gaps (likely no-op) | 1 |
| 7 | 3a | Port StageStrip molecule | 1 |
| 8 | 3b | Port TabsBand molecule | 1 |
| 9 | 3c | Port BulkBar molecule | 1 |
| 10 | 3d | Port AttributesPanel molecule | 1 |
| 11 | 3e | Port additional cross-stage molecules from port-plan | 1 |
| 12 | 3f | Port PipelineTemplate | 7, 8 |
| 13 | 3g | Port ProjectsLandingTemplate | 1 |
| 14 | 3h | Port ProjectSettingsTemplate | 1 |
| 15 | 3i | Write `MIGRATION_NOTES.md` | all above |

Counts will shift after port-plan review.

## 12 · Definition of done

- `docs/research/2026-05-24-design-handoff-port-plan.md` exists,
  CT-approved, and committed.
- Every gap identified in Phase 1 has a typed pdomain-ui export with a
  Storybook story and a `.test.tsx`.
- `pnpm exec tsc --noEmit` clean under strict settings.
- `make ci AI=1` green.
- A consuming app can replace `final/source/source.jsx` (the most
  complete `final/` file) using only pdomain-ui imports + stage-specific
  glue. Demonstration is documented in `MIGRATION_NOTES.md` but the
  glue itself is not part of this spec (stage-specific glue lives in
  the follow-on spec or in a consumer-repo example).
- `MIGRATION_NOTES.md` exists at pdomain-ui root, honestly lists gaps,
  open questions, and the icon mapping.

## 13 · Follow-on specs (not part of this spec)

- **`pdomain-ui-design-handoff-stages`** — Pass 3.3 stage-specific
  components: `Source/`, `Grayscale/`, `Crop/`, `HyphenJoin/`,
  `ProjectsLanding/` body components.
- **`pdomain-ui-design-handoff-wireframes`** — Pass 3.4 wireframe-only
  components: `PageReorder/` (wf09), `Scannos/` (wf05b),
  `PageWorkbench/` (wf-pw), `PackageValidation/` (wf02),
  `QualityFlags/` (wf03).
- **Consumer migrations** — separate per-consumer specs in their own
  repos (`pdomain-prep-for-pgdp`, `pdomain-ocr-simple-gui`,
  `pdomain-ocr-labeler-spa`).

## Adversarial Review

**Stage / sources:** Post-implementation review against the CT-reviewed
port-plan, PipelineTemplate code/tests, and May 24 implementation history.
**Accepted findings / residual risk:** recon, atoms, icons, templates, and
cross-stage molecules shipped, but the proposed all-slot PipelineTemplate did
not. The current template owns project/stage configuration, ProjectInfoBand,
StageStrip, and default tabs, with `tabsSlot` and `children` as its primary
extension points. Promote that current composition model to
`docs/architecture/design-system-composition.md`; discard the provisional issue
list and obsolete API example.
