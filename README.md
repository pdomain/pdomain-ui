# @pdomain/pdomain-ui

Shared TS/React/Vite frontend library for the pdomain-* suite — canvas, worklist, shell, primitives, icons, generated types, and store factories. Every pdomain-* end-user SPA (labeler-spa, pgdp-prep, trainer-spa) imports components and hooks from this package rather than reimplementing them. The library is published to the self-hosted `pdomain-index-npm` registry at `@pdomain/pdomain-ui`.

For design details, constraints, and the codegen pipeline, see [`docs/specs/2026-05-16-cross-cut-design.md`](../docs/specs/2026-05-16-cross-cut-design.md) and the completed implementation plan at [`docs/archive/plans/2026-05-16-pdomain-ui-new-repo.md`](../docs/archive/plans/2026-05-16-pdomain-ui-new-repo.md).

## CSS theme layering

Three separate CSS files control theming. Import them in this order:

```js
// 1. Always required — defines all CSS custom property tokens
import '@pdomain/pdomain-ui/theme/tokens.css';

// 2. Opt-in reset — ONLY if your app has no CSS reset and no Tailwind preflight
//    Skip this for Tailwind apps (labeler-spa, simple-gui) — preflight handles it.
//    Include this for non-Tailwind apps (trainer-spa) and pdomain-ui Storybook.
import '@pdomain/pdomain-ui/theme/reset.css';

// 3. Component primitive classes (.btn, .chip, .badge, etc.) — reset-free
import '@pdomain/pdomain-ui/theme/primitives.css';
```

| Consumer | tokens | reset | primitives |
|---|---|---|---|
| Tailwind SPA (labeler-spa, simple-gui) | yes | **no** — Tailwind preflight covers it | yes |
| Non-Tailwind SPA (trainer-spa) | yes | **yes** | yes |
| pdomain-ui Storybook | yes | **yes** | yes |
