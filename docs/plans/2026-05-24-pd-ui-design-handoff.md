---
status: active
synced: 2026-05-24
milestone: 16
repo: ConcaveTrillion/ocr-container-meta
spec: docs/specs/2026-05-24-pdomain-ui-design-handoff-design.md
---

# pdomain-ui design-handoff port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port the design-handoff bundle's atoms, cross-stage molecules, and layout templates into pdomain-ui as typed, slot-based, shared exports — gated by a Phase 1 audit document.

**Architecture:** Three phases, single milestone. Phase 1 produces a research doc (port-plan) that classifies every design identifier and gates Phases 2–3. Phase 2 adds atom-layer gaps to `src/primitives/` and `src/icons/`. Phase 3 adds layout templates to a new `src/templates/` folder plus cross-stage molecules promoted from the design's stage folders.

**Tech Stack:** React 18, TypeScript (strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`), Vite library build, Vitest + jsdom, Storybook (collocated `.stories.tsx`), pnpm, lucide-react.

**Spec:** [`docs/specs/2026-05-24-pdomain-ui-design-handoff-design.md`](../specs/2026-05-24-pdomain-ui-design-handoff-design.md)

**Design bundle:** `docs/templates/design_handoff_pdomain_ui/`

---

## Plan structure note

Phase 1 (Task 1) is the gating audit. Its output reshapes Phases 2 and 3.

Phase 2 (Tasks 2–6) and Phase 3 (Tasks 7–15) are filed as
*anticipated* issues right now so the milestone is fully visible, but
their `Acceptance` checklists and exact file lists may be amended after
CT approves the port-plan. The first acceptance item of every Phase 2
and Phase 3 task is therefore **"port-plan row reviewed and confirmed
for this identifier."**

---

## Task 1 — Write design-handoff port-plan audit  {#port-plan-audit}
model: sonnet  effort: M  area: pdomain-ui-docs

Context: This is the Phase 1 deliverable. Produces a research document
that classifies every identifier in `design_handoff_pdomain_ui/` against
pdomain-ui's current state. CT review of this document gates every Phase 2
and Phase 3 task in this plan.

Approach: Create `docs/research/2026-05-24-design-handoff-port-plan.md`
with five verdict tables defined in spec §4.1: (1) Atom verdict for
every identifier in `design-system/ui-base.jsx`; (2) Token diff between
design `tokens.css` and pdomain-ui `src/theme/tokens.css`; (3) Icon mapping
for every name in the design's `Icon` switch (~50 rows); (4)
Cross-stage molecule inventory for every identifier with usage count ≥3
in `COMPONENT_INDEX.md`, classified cross-stage vs stage-specific; (5)
Template inventory listing slots and molecule dependencies for
`PipelineTemplate`, `ProjectsLandingTemplate`, `ProjectSettingsTemplate`.

Verification: `git ls-files docs/research/2026-05-24-design-handoff-port-plan.md`

Acceptance:
- [ ] Skeleton document exists with header, status line, glossary, and five empty tables.
- [ ] Table 1 (atom verdict) populated for every export in `design-system/ui-base.jsx`.
- [ ] Table 2 (token diff) populated for every `--*` in design's `tokens.css`.
- [ ] Table 3 (icon mapping) populated for every name in the design's `Icon` switch.
- [ ] Table 4 (cross-stage molecule inventory) populated for every identifier with usage count ≥3.
- [ ] Table 5 (template inventory) populated for the three layout templates.
- [ ] Open-questions section surfaces every ambiguity for CT review.
- [ ] Status promoted from `draft` to `ready for CT review`.

---

## Task 2 — Port Icon: lucide additions + bespoke gaps  {#port-icon}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: pdomain-ui hard constraint is lucide-react only via `src/icons/`.
The design bundle's `Icon` component is a switch over ~50 inline SVGs.
Lucide-first strategy: re-export lucide equivalents where available,
implement domain glyphs as bespoke components.

Approach: For each row in port-plan Table 3 with verdict `port to
lucide`, add the lucide-react re-export to `src/icons/lucide.ts`.
Port-plan determined: 12 already exist, 28 new lucide re-exports
needed, zero bespoke. Per OQ-7: `alert` → `AlertTriangle` (lucide
v0.x is installed). Per OQ-8: `swap` → `ArrowLeftRight`. Per **OQ-1**:
ALSO add a name-dispatcher shim `<Icon name="check" />` in
`src/icons/Icon.tsx` that maps to the named exports (typed
string-literal union of all known names). Update `Icons.stories.tsx`
to gallery every new icon plus the dispatcher.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] 28 new `port to lucide`-verdict design names re-exported from `src/icons/lucide.ts`.
- [ ] `alert` exports as `AlertTriangle` (lucide v0.x); `swap` exports as `ArrowLeftRight`.
- [ ] `src/icons/Icon.tsx` exports a typed `<Icon name="…" size?={number}/>` dispatcher mapping every design name to the corresponding named export.
- [ ] `Icons.stories.tsx` galleries every new icon AND the dispatcher.
- [ ] `src/icons/Icon.test.tsx` covers the dispatcher's name→component routing.
- [ ] `make ci AI=1` green.

---

## Task 3 — Port Segmented atom  {#port-segmented}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Inset single-select segmented control used across every wired
stage in the design bundle. Distinct from pdomain-ui's existing
`ToggleGroup` (a flat multi-select group).

Approach: Implement `src/primitives/Segmented.tsx` as a typed
single-select primitive with string-literal `value` prop, `onChange`
callback, and an `options` array of typed entries. CSS class modifiers
for the inset visual; no CVA, no hex literals. Collocate
`Segmented.stories.tsx` (one story per `DCArtboard` in the source) and
`Segmented.test.tsx` (variants + a11y).

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 1 row for `Segmented` reviewed.
- [ ] `src/primitives/Segmented.tsx` exports a typed `Segmented` with `Props` interface.
- [ ] `Segmented.stories.tsx` covers every `DCArtboard` variant from the design source.
- [ ] `Segmented.test.tsx` covers click, keyboard navigation, a11y role.
- [ ] No CVA import, no hex literals, no `!important`.
- [ ] `make ci AI=1` green.

---

## Task 4 — Port StepDots atom  {#port-stepdots}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Numbered-circle progress indicator used in pipeline
progression states across the design bundle.

Approach: Implement `src/primitives/StepDots.tsx` as a typed primitive
with `steps` (number or array), `current` (index), and optional
`onStepClick`. Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 1 row for `StepDots` reviewed.
- [ ] `src/primitives/StepDots.tsx` exports a typed `StepDots`.
- [ ] `StepDots.stories.tsx` covers every `DCArtboard` variant.
- [ ] `StepDots.test.tsx` covers rendering and click behavior.
- [ ] `make ci AI=1` green.

---

## Task 5 — Port PageHeader atom (if confirmed by audit)  {#port-pageheader}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Title + breadcrumb composite. pdomain-ui has `Breadcrumb` and
`TopNav` separately but no `PageHeader` molecule. Audit may downgrade
this to "skip" if the existing primitives compose cleanly enough.

Approach: If port-plan Table 1 verdict is `port`, implement
`src/primitives/PageHeader.tsx` composing existing `Breadcrumb` with a
typed title prop. Collocated stories + tests. If verdict is
`already-in-pdomain-ui` or `skip`, close this task with a no-op comment
referencing the verdict row.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 1 row for `PageHeader` reviewed.
- [ ] Either: `src/primitives/PageHeader.tsx` exists with typed Props, stories, tests, and CI green; OR: task closed as no-op with verdict reference in the closing comment.

---

## Task 6 — Reconcile token-diff gaps  {#reconcile-tokens}
model: haiku  effort: S  area: pdomain-ui-frontend

Context: Port-plan Table 2 found 25 tokens identical, 0
`value-mismatch`, and 2 `missing` (`--font-sans`, `--font-mono`
back-compat aliases). Per **OQ-6**: CT decided NOT to add the aliases;
consumers will use canonical `--ui-font` / `--mono-font`.

Approach: Close as no-op. Add a one-line comment in
`src/theme/tokens.css` near the font tokens noting that the
back-compat aliases are intentionally omitted (consumers reference
canonical names).

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Comment added near `--ui-font` / `--mono-font` in `src/theme/tokens.css` noting OQ-6 decision.
- [ ] No new tokens added.
- [ ] `make ci AI=1` green.

---

## Task 7 — Port StageStrip molecule  {#port-stagestrip}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Stage progress + nav strip. 8+ usages in design bundle. Used
inside `PipelineTemplate` and standalone in some stages.

Approach: Implement `src/templates/StageStrip.tsx` as a typed molecule
with `stages` (typed array of stage descriptors), `current` (stage id),
and `onStageClick`. Slot prop `actions` for per-stage action buttons.
String-literal union for stage status (`'todo' | 'in-progress' |
'done' | 'blocked'`). Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 4 row for `StageStrip` reviewed and confirmed cross-stage.
- [ ] `src/templates/StageStrip.tsx` exports a typed `StageStrip`.
- [ ] `StageStrip.stories.tsx` covers every `DCArtboard` variant.
- [ ] `StageStrip.test.tsx` covers prop variants, status rendering, click handling.
- [ ] `make ci AI=1` green.

---

## Task 8 — Port TabsBand molecule  {#port-tabsband}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Sticky tab band at the top of every stage body in the design.

Approach: Implement `src/templates/TabsBand.tsx` as a typed molecule
wrapping the existing `Tabs` primitive with sticky positioning, an
optional `rightSlot` for stage-level controls, and typed `items`.
Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 4 row for `TabsBand` reviewed.
- [ ] `src/templates/TabsBand.tsx` exports a typed `TabsBand`.
- [ ] `TabsBand.stories.tsx` covers every `DCArtboard` variant.
- [ ] `TabsBand.test.tsx` covers tab switching, sticky behavior asserted via class, rightSlot rendering.
- [ ] `make ci AI=1` green.

---

## Task 9 — Port BulkBar molecule  {#port-bulkbar}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Sticky bottom bulk-action bar that appears across the Source
and other stages when a selection is active.

Approach: Implement `src/primitives/BulkBar.tsx` as a typed molecule
with `selectedCount`, `onClearSelection`, and an `actions` render-prop
slot for app-supplied action buttons. Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 4 row for `BulkBar` reviewed.
- [ ] `src/primitives/BulkBar.tsx` exports a typed `BulkBar`.
- [ ] `BulkBar.stories.tsx` covers every `DCArtboard` variant.
- [ ] `BulkBar.test.tsx` covers rendering, action slot composition, clear-selection callback.
- [ ] `make ci AI=1` green.

---

## Task 10 — Port AttributesPanel molecule  {#port-attributespanel}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Right-side attributes panel used across multiple stages for
displaying selected entity properties.

Approach: Implement `src/primitives/AttributesPanel.tsx` as a typed
molecule with `title`, `entries` (typed key-value array), and an
optional `actions` slot. Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 4 row for `AttributesPanel` reviewed.
- [ ] `src/primitives/AttributesPanel.tsx` exports a typed `AttributesPanel`.
- [ ] `AttributesPanel.stories.tsx` covers every `DCArtboard` variant.
- [ ] `AttributesPanel.test.tsx` covers entry rendering and actions slot.
- [ ] `make ci AI=1` green.

---

## Task 11 — Port additional cross-stage molecules from port-plan  {#port-additional-molecules}
model: sonnet  effort: L  area: pdomain-ui-frontend

Context: Port-plan Table 4 may identify additional cross-stage
molecules beyond StageStrip/TabsBand/BulkBar/AttributesPanel.
Anticipated candidates from recon: `ViewToggle`, `FileToolbar`,
`ThumbCard`, `RunAllDirtyPanel`, `BuildPackagePanel`, `DiskCostBanner`.
Final list comes from the audit.

Approach: For each Table 4 row with verdict `cross-stage molecule` not
covered by Tasks 7–10, port to its target path (port-plan column 5)
following the same typed-Props + stories + tests pattern. One commit
per molecule. If audit confirms no additional cross-stage molecules,
close as no-op.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] Port-plan Table 4 reviewed; additional cross-stage molecules enumerated.
- [ ] For each enumerated molecule: typed export, collocated stories, collocated tests.
- [ ] `make ci AI=1` green after each port.

---

## Task 12 — Port PipelineTemplate  {#port-pipelinetemplate}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Page chrome shared by all wired pipeline stages (Source,
Grayscale, Crop, Hyphen-join). Slot-based.

Approach: Implement `src/templates/PipelineTemplate.tsx` exposing slot
props `header`, `stageStrip`, `tabs`, `body`, `bulkBar`. Composes
`StageStrip` and `TabsBand` from Tasks 7–8. No leaked
pipeline-specific state types — every slot is a `ReactNode`. Collocated
stories (one per `DCArtboard` from `final/pipeline/pipeline-template.jsx`)
+ tests asserting each slot renders into the correct testid region.

Blocked-by: #port-plan-audit, #port-stagestrip, #port-tabsband

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/templates/PipelineTemplate.tsx` exports a typed `PipelineTemplate` with slot props.
- [ ] `PipelineTemplate.stories.tsx` covers every `DCArtboard` variant from the source.
- [ ] `PipelineTemplate.test.tsx` asserts each slot renders into its testid region.
- [ ] `make ci AI=1` green.

---

## Task 13 — Port ProjectsLandingTemplate  {#port-projectslandingtemplate}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Projects landing chrome from `final/projects/projects.jsx`.
Per **OQ-11**: the design has `ProjectsPage` (populated) and
`ProjectsEmpty` (empty state) as separate components but the
`emptyState` prop on `ProjectsPage` is unused. Merge into one template
with a discriminated-union `state` prop.

Approach: Implement
`src/templates/ProjectsLandingTemplate.tsx` exposing a discriminated
union prop `state: 'populated' | 'empty'`. When `state='populated'`,
slot props `attributesPanel`, `coverGrid`, `pipelineMini` render. When
`state='empty'`, render the empty-state layout (CTA card, illustration
slot). Common chrome (header, breadcrumb) is shared.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/templates/ProjectsLandingTemplate.tsx` exports a typed template with discriminated-union `state` prop.
- [ ] Stories cover both `state='populated'` and `state='empty'` variants from the design sources.
- [ ] Tests assert each slot renders into its testid region in each state.
- [ ] `make ci AI=1` green.

---

## Task 14 — Port ProjectSettingsTemplate  {#port-projectsettingstemplate}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Settings layout from `final/pipeline/project-settings.jsx`.
Slot-based.

Approach: Implement
`src/templates/ProjectSettingsTemplate.tsx` exposing slot props
`panels` (left) and `body` (right). Collocated stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/templates/ProjectSettingsTemplate.tsx` exports a typed template with slot props.
- [ ] Stories cover every `DCArtboard` variant from the source.
- [ ] Tests assert each slot renders into its testid region.
- [ ] `make ci AI=1` green.

---

## Task 16 — Extend pdomain-ui Button with icon/iconRight/full props  {#extend-button}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-2**: design `Button` composes icons via `icon` /
`iconRight` props and supports `full` (width: 100%). pdomain-ui `Button`
has none. Extend non-breakingly.

Approach: Add optional `icon?: ReactNode`, `iconRight?: ReactNode`,
`full?: boolean` props to `src/primitives/Button.tsx`. Existing
callers unaffected. Add stories covering each new prop and a
combined-prop story. Add tests covering each new render path.

Blocked-by: #port-plan-audit, #port-icon

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/primitives/Button.tsx` adds `icon` / `iconRight` / `full` optional props with correct typing.
- [ ] Existing Button stories and tests still pass.
- [ ] New stories cover each new prop and a combined-prop variant.
- [ ] New tests cover each new prop's render path.
- [ ] `make ci AI=1` green.

---

## Task 17 — Extend pdomain-ui Input with composite wrapper + suffix slot  {#extend-input}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-3**: design `Input` is a `<div>` shell with child
`<input>`, a `suffix` slot, and an inline focus ring on `autoFocus`.
pdomain-ui `Input` is a bare styled `<input>`.

Approach: Refactor `src/primitives/Input.tsx` to render a composite
wrapper when `suffix` is provided (otherwise still render bare for
back-compat). Add optional `suffix?: ReactNode` and `autoFocusRing?:
boolean` props. The focus-ring styling lives in
`src/theme/primitives.css` referencing existing `--accent` token.
Existing callers unaffected.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/primitives/Input.tsx` adds `suffix` / `autoFocusRing` optional props with correct typing.
- [ ] Composite wrapper renders only when `suffix` is provided; existing bare-input usage unaffected.
- [ ] Existing Input stories and tests still pass.
- [ ] New stories cover the suffix slot and autoFocusRing variants.
- [ ] New tests cover composite render path and focus-ring class application.
- [ ] `make ci AI=1` green.

---

## Task 18 — Extend pdomain-ui Badge with tone prop  {#extend-badge}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-4**: design `Badge` uses a 13-value semantic `tone`
prop driven by status tokens (exact / fuzzy / mismatch / ocr / gt /
review / running / clean / dirty / etc.). pdomain-ui `Badge` has 3
structural variants. The full list of tones comes from port-plan
Table 1's note on the Badge row (which cross-references the design
sources for the canonical 13 names).

Approach: Add optional `tone?: 'exact' | 'fuzzy' | 'mismatch' | …`
string-literal union prop to `src/primitives/Badge.tsx`. Each tone
maps to a CSS class that uses the corresponding `--exact` / `--fuzzy`
/ etc. token already defined in `src/theme/tokens.css`. Structural
variants (default/primary/danger) remain. Stories cover every tone.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/primitives/Badge.tsx` adds `tone` optional string-literal union prop covering all 13 design tones.
- [ ] Each tone class is defined in `src/theme/primitives.css` referencing the matching `--*` token.
- [ ] Existing Badge stories and tests still pass.
- [ ] New stories gallery every tone.
- [ ] New tests cover tone → class mapping.
- [ ] `make ci AI=1` green.

---

## Task 19 — Port AppHeader to src/shell/  {#port-appheader}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Per **OQ-5**: design `AppHeader` is the opinionated suite
chrome bar — app icon + search + jobs pill + bell + user avatar.
Every pdomain-* SPA will need this; centralize.

Approach: Implement `src/shell/AppHeader.tsx` composing pdomain-ui
primitives. Slots: `logo`, `search?`, `jobsPill?`, `notifications?`,
`userAvatar`. Props: `username`, `initials`, `unread?`. Stories cover
the variants from `final/template/template.jsx`. Tests cover slot
composition.

Blocked-by: #port-plan-audit, #port-icon

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/shell/AppHeader.tsx` exports a typed `AppHeader` with documented slot props.
- [ ] Stories cover each variant (with/without jobs pill, unread state, etc.).
- [ ] Tests assert slot composition and prop rendering.
- [ ] `make ci AI=1` green.

---

## Task 20 — Port JobsPill molecule  {#port-jobspill}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-5**: status pill that displays active job count and
opens JobsDrawer on click.

Approach: Implement `src/shell/JobsPill.tsx` as a typed molecule with
`activeJobs: number`, `onClick: () => void`, optional `running?:
boolean` (for spinner state). Stories + tests.

Blocked-by: #port-plan-audit, #port-icon

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/shell/JobsPill.tsx` exports a typed `JobsPill`.
- [ ] Stories cover idle, running, and high-count variants.
- [ ] Tests cover click handling and running-state rendering.
- [ ] `make ci AI=1` green.

---

## Task 21 — Port JobsDrawer molecule  {#port-jobsdrawer}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Per **OQ-5**: side drawer listing active and recent jobs.

Approach: Implement `src/shell/JobsDrawer.tsx` as a typed molecule
with `open: boolean`, `onOpenChange`, `jobs: JobRow[]` (typed). Uses
existing pdomain-ui `Drawer` primitive or Radix Dialog (decide based on
existing pattern). Stories + tests.

Blocked-by: #port-plan-audit, #port-jobrow

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/shell/JobsDrawer.tsx` exports a typed `JobsDrawer`.
- [ ] Stories cover empty, populated, and many-jobs variants.
- [ ] Tests cover open/close behavior and job list rendering.
- [ ] `make ci AI=1` green.

---

## Task 22 — Port JobRow molecule  {#port-jobrow}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-5**: one row inside JobsDrawer — job name, status,
progress, optional cancel action.

Approach: Implement `src/shell/JobRow.tsx` as a typed molecule with
typed `job` data prop (name, status, progress, etc.) and optional
`onCancel` callback. Stories + tests.

Blocked-by: #port-plan-audit, #port-icon

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/shell/JobRow.tsx` exports a typed `JobRow`.
- [ ] Stories cover each status variant (queued, running, succeeded, failed).
- [ ] Tests cover status rendering and cancel callback.
- [ ] `make ci AI=1` green.

---

## Task 23 — Port ProjectsDrawer molecule  {#port-projectsdrawer}
model: sonnet  effort: M  area: pdomain-ui-frontend

Context: Per **OQ-12**: suite-wide project-picker drawer molecule.
Lives at the molecule layer (not as an AppShell zone); templates that
need it embed it.

Approach: Implement `src/templates/ProjectsDrawer.tsx` with typed
`projects: Project[]`, `currentProjectId?`, `onProjectChange`,
`onCreateProject` slot. Stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/templates/ProjectsDrawer.tsx` exports a typed `ProjectsDrawer`.
- [ ] Stories cover empty, populated, and selected-project variants.
- [ ] Tests cover project selection and create-project slot.
- [ ] `make ci AI=1` green.

---

## Task 24 — Port SettingsNav template  {#port-settingsnav}
model: sonnet  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-10**: extract the 8-item settings nav rail
(general / bibliographic / pgdp / format / defaults / members /
storage / danger) from `final/pipeline/project-settings.jsx` as a
reusable molecule. Other pdomain-* SPAs with settings will reuse this
pattern.

Approach: Implement `src/templates/SettingsNav.tsx` as a typed
molecule with `items: SettingsNavItem[]` (typed entries with `id`,
`label`, optional `icon`, optional `tone` for danger-zone styling)
and `current` (item id) and `onChange`. Stories + tests.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `src/templates/SettingsNav.tsx` exports a typed `SettingsNav`.
- [ ] Stories cover the default 8-item layout plus a custom-items variant.
- [ ] Tests cover current-item highlight, click handling, danger-zone tone.
- [ ] `make ci AI=1` green.

---

## Task 25 — Deprecate AppShell drawer/rightPanel props (JSDoc + tests)  {#deprecate-appshell-zones}
model: haiku  effort: S  area: pdomain-ui-frontend

Context: Per **OQ-12**: AppShell's `drawer` and `rightPanel` slot
props are deprecated. They remain functional for back-compat with
`pdomain-ocr-labeler-spa` and `pdomain-prep-for-pgdp`. New templates own their
own internal drawer / right-panel concerns. Removal happens in a
separate future spec after the two consumers migrate.

Approach: Add `@deprecated` JSDoc to `drawer` and `rightPanel` props
in `src/shell/AppShell.tsx` with a migration note (point to template
internal layouts or `ProjectsDrawer` molecule). Add an ESLint warning
or a runtime `console.warn` (decide based on existing pattern;
JSDoc-only is acceptable). Add a deprecation note to `AppShell.test.tsx`.

Blocked-by: #port-plan-audit

Verification: `make ci AI=1`

Acceptance:
- [ ] `drawer` and `rightPanel` props carry `@deprecated` JSDoc tags with migration guidance.
- [ ] Tests still pass; both slots still render (back-compat preserved).
- [ ] `make ci AI=1` green.

---

## Task 15 — Write MIGRATION_NOTES.md  {#migration-notes}
model: haiku  effort: S  area: pdomain-ui-docs

Context: Final deliverable summarizing what landed where, what was
deliberately not ported, and what's still ambiguous. PROMPT.md §6
requirement.

Approach: Write `MIGRATION_NOTES.md` at pdomain-ui repo root with five
sections: new exports table (column 1 = pdomain-ui export path, column 2 =
design source file); tokens added or aliased; icon mapping reference
(link to port-plan Table 3); conscious omissions (every `co-locate` or
`skip` verdict with one-line reason); open questions for CT and how
they were resolved (link to port-plan CT-decisions section).
Demonstration of `final/source/source.jsx` → pdomain-ui imports is
documented (the glue itself is part of the follow-on stages spec).

Blocked-by: #port-icon, #port-segmented, #port-stepdots, #port-pageheader, #reconcile-tokens, #port-stagestrip, #port-tabsband, #port-bulkbar, #port-attributespanel, #port-additional-molecules, #port-pipelinetemplate, #port-projectslandingtemplate, #port-projectsettingstemplate, #extend-button, #extend-input, #extend-badge, #port-appheader, #port-jobspill, #port-jobsdrawer, #port-jobrow, #port-projectsdrawer, #port-settingsnav, #deprecate-appshell-zones

Verification: `git ls-files MIGRATION_NOTES.md && make ci AI=1`

Acceptance:
- [ ] `MIGRATION_NOTES.md` exists at pdomain-ui root.
- [ ] New exports table lists every new pdomain-ui export with its design source.
- [ ] Tokens added or aliased section reflects port-plan Table 2 outcomes.
- [ ] Icon mapping references port-plan Table 3.
- [ ] Conscious omissions list every `co-locate` / `skip` verdict.
- [ ] Open questions for CT documented.
- [ ] `final/source/source.jsx` → pdomain-ui imports demonstration documented.

---

## Done when

- Every task above is closed under milestone `spec: pdomain-ui-design-handoff (#N)`.
- `pnpm exec tsc --noEmit` clean under strict settings.
- `make ci AI=1` green on merge into `main`.
- `MIGRATION_NOTES.md` exists at pdomain-ui root.
- Workspace convention: branches stay local; no PR opened (CT pushes when ready).
