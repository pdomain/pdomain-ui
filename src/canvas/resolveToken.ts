/** Resolve a CSS custom property to its computed value for Konva props.
 *  Konva renders to <canvas> and does NOT evaluate var() strings. */
export function resolveToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
