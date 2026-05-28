/**
 * Shared Crop stage type declarations.
 *
 * Single canonical location for `CropFlagKind` — previously duplicated in
 * CropCard, CropToolbar, and CropOverview. All three now import from here.
 */

/** Detected flag kinds for a crop page. */
export type CropFlagKind = 'overCrop' | 'underCrop' | 'deskewFail' | 'edgeNoise';
