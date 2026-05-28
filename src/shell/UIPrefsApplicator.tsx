/**
 * UIPrefsApplicator — side-effect component that applies UIPrefs to the DOM.
 *
 * - Writes `data-density` onto the `[data-testid="app-shell"]` element.
 * - Writes CSS `zoom` onto `document.documentElement` for font scale.
 * - Writes `data-theme` onto `document.documentElement`.
 * - Writes color CSS custom properties for all 9 color overrides (layer ×4,
 *   status ×5, accent ×2) when overrides differ from token defaults.
 *
 * Must be rendered inside both UIPrefsStoreProvider and AppShellContext.
 * Returns null — no visual output.
 */
import * as React from 'react';
import {
  useDensity,
  useFontScale,
  useTheme,
  useLayerColor,
  useStatusColor,
  useAccentColor,
} from '../stores/StoreContexts.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Write or remove a CSS custom property on documentElement.
 *  Values that are CSS var() references are token defaults — skip them so we
 *  don't shadow the theme cascade with its own default value. */
function applyVar(name: string, value: string): void {
  if (!value.startsWith('var(')) {
    document.documentElement.style.setProperty(name, value);
  } else {
    document.documentElement.style.removeProperty(name);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UIPrefsApplicator() {
  const density = useDensity();
  const fontScale = useFontScale();
  const theme = useTheme();

  // Layer color overrides (4)
  const blockColor = useLayerColor('block');
  const paraColor = useLayerColor('para');
  const lineColor = useLayerColor('line');
  const wordColor = useLayerColor('word');

  // Status color overrides (5)
  const exactColor = useStatusColor('exact');
  const fuzzyColor = useStatusColor('fuzzy');
  const mismatchColor = useStatusColor('mismatch');
  const ocrColor = useStatusColor('ocr');
  const gtColor = useStatusColor('gt');

  // Accent color overrides (2)
  const accentColors = useAccentColor();

  // Apply data-density to the app-shell root element.
  React.useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-testid="app-shell"]');
    if (el) el.setAttribute('data-density', density);
  }, [density]);

  // Apply font scale via CSS zoom on the document root.
  React.useEffect(() => {
    if (fontScale === 1.0) {
      document.documentElement.style.removeProperty('zoom');
    } else {
      document.documentElement.style.zoom = String(fontScale);
    }
    return () => {
      document.documentElement.style.removeProperty('zoom');
    };
  }, [fontScale]);

  // Apply data-theme to the document root for CSS cascade.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);

  // Apply layer color overrides as CSS custom properties.
  React.useEffect(() => {
    applyVar('--block', blockColor);
  }, [blockColor]);

  React.useEffect(() => {
    applyVar('--para', paraColor);
  }, [paraColor]);

  React.useEffect(() => {
    applyVar('--line', lineColor);
  }, [lineColor]);

  React.useEffect(() => {
    applyVar('--word', wordColor);
  }, [wordColor]);

  // Apply status color overrides as CSS custom properties.
  React.useEffect(() => {
    applyVar('--exact', exactColor);
  }, [exactColor]);

  React.useEffect(() => {
    applyVar('--fuzzy', fuzzyColor);
  }, [fuzzyColor]);

  React.useEffect(() => {
    applyVar('--mismatch', mismatchColor);
  }, [mismatchColor]);

  React.useEffect(() => {
    applyVar('--ocr', ocrColor);
  }, [ocrColor]);

  React.useEffect(() => {
    applyVar('--gt', gtColor);
  }, [gtColor]);

  // Apply accent color overrides.
  // getAccentColor returns { fg: accentInkColor, bg: accentColor } — so the
  // accent *background* is bg and the ink/text on it is fg.
  React.useEffect(() => {
    applyVar('--accent', accentColors.bg);
  }, [accentColors.bg]);

  React.useEffect(() => {
    applyVar('--accent-ink', accentColors.fg);
  }, [accentColors.fg]);

  return null;
}

UIPrefsApplicator.displayName = 'UIPrefsApplicator';
