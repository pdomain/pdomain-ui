---
Status: active
Owner: CT
Created: 2026-05-16
Last verified: 2026-07-13
Kind: usage
---

# @pdomain/pdomain-ui

Shared TS/React/Vite frontend library for the pdomain-* suite — canvas, worklist, shell, primitives, icons, generated types, and store factories. Every pdomain-* end-user SPA (labeler-spa, pgdp-prep, trainer-spa) imports components and hooks from this package rather than reimplementing them. The library is published to the self-hosted `pdomain-index-npm` registry at `@pdomain/pdomain-ui`.

For current design records, constraints, and documentation workflow, see [the docs index](docs/README.md).

## Cross-app modules

`pdomain-ui` exports presentation-only modules for repeated suite patterns:

- `@pdomain/pdomain-ui/records`
- `@pdomain/pdomain-ui/source-intake`
- `@pdomain/pdomain-ui/viewport`
- `@pdomain/pdomain-ui/settings`
- `@pdomain/pdomain-ui/status`
- `@pdomain/pdomain-ui/workbench`

These modules render typed UI and call app callbacks. Apps still own data
loading, routing, jobs, OCR policy, source validation, and stage machines.

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
