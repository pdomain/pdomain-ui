/**
 * Shared Grayscale stage type declarations.
 *
 * Single canonical location for `GrayscaleMode` — previously duplicated in
 * AutoDetectBanner and ModeCard. Both now import from here.
 */

/**
 * Grayscale conversion mode.
 *
 * - `'standard'`    — luminance-weighted ITU-R BT.709 conversion.
 * - `'perceptual'`  — LAB-aware perceptual conversion tuned for
 *                     printed-book content (newsprint, engravings).
 */
export type GrayscaleMode = 'standard' | 'perceptual';
