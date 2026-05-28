/**
 * ArtifactViewer — Phase 2 critical-path composition molecule.
 *
 * Spec: §6.3 of 2026-05-24-design-handoff-stages-phase-2.md
 *
 * Composes:
 *   ArtifactPlate (paper shadow + border)
 *     └─ PaperRender (image surface)
 *          └─ PageImageCanvas (Konva Stage + background image)
 *               ├─ SplitOverlay      [overlayMode='split']
 *               ├─ IllustOverlay     [overlayMode='illust']
 *               ├─ WordBboxOverlay   [overlayMode='words']
 *               ├─ RotateHandle      [overlayMode='rotate']
 *               └─ extraLayersSlot  [optional additional layers]
 *
 * ArtifactPlate and PaperRender are internal sub-components.
 * SplitOverlay, IllustOverlay, WordBboxOverlay, RotateHandle are
 * independently exported for consumers that need custom shells.
 */

import React, { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PageImageCanvas } from '../../canvas/PageImageCanvas.js';
import type { CanvasWord } from '../../canvas/types.js';
import { ArtifactPlate } from './ArtifactPlate.js';
import { PaperRender } from './PaperRender.js';
import { SplitHandle, SplitOverlay } from './SplitOverlay.js';
import { IllustOverlay } from './IllustOverlay.js';
import type { IllustBbox } from './IllustOverlay.js';
import { WordBboxOverlay } from './WordBboxOverlay.js';
import type { WordBbox } from './WordBboxOverlay.js';
import { RotateHandle } from './RotateHandle.js';

// ── Public types ──────────────────────────────────────────────────────────────

// Re-export overlay types as the canonical public types for ArtifactViewerProps
export type { IllustBbox } from './IllustOverlay.js';
export type { WordBbox } from './WordBboxOverlay.js';

export type OverlayMode =
  | 'view' // no overlay
  | 'split' // before/after draggable split
  | 'illust' // illustration bbox highlight
  | 'rotate' // rotation handle
  | 'words'; // word-level bbox overlay

export interface SplitProposal {
  /** Normalized x position of the split line (0–1). */
  splitX: number;
  onSplitXChange?: (x: number) => void;
}

export interface ArtifactViewerProps {
  /** Source URL for the page image. */
  imageSrc: string;
  /** Page geometry (original pixel dimensions, used to compute scale). */
  pageWidth: number;
  pageHeight: number;
  /** Active overlay mode. Defaults to 'view'. */
  overlayMode?: OverlayMode;
  /** Data for SplitOverlay (required when overlayMode='split'). */
  splitProposal?: SplitProposal;
  /** Data for IllustOverlay (required when overlayMode='illust'). */
  illustBboxes?: IllustBbox[];
  /** Data for WordBboxOverlay (required when overlayMode='words'). */
  wordBboxes?: WordBbox[];
  /** Called when a word bbox is clicked (overlayMode='words'). */
  onWordClick?: (id: string) => void;
  /** Rotation angle in degrees (overlayMode='rotate'). */
  rotationDeg?: number;
  onRotationChange?: (deg: number) => void;
  /** CSS class applied to the outer ArtifactPlate wrapper. */
  className?: string;
  /** Slot for additional Konva layers (advanced — use sparingly). */
  extraLayersSlot?: ReactNode;
}

// ── Empty stubs to satisfy PageImageCanvas required props ─────────────────────

const EMPTY_WORDS: CanvasWord[] = [];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * `<ArtifactViewer>` — the shared image annotation surface for pdomain-prep-for-pgdp
 * and pdomain-ocr-labeler-spa. Switch overlay modes via `overlayMode` prop.
 */
export function ArtifactViewer({
  imageSrc,
  pageWidth,
  pageHeight,
  overlayMode = 'view',
  splitProposal,
  illustBboxes,
  wordBboxes,
  onWordClick,
  rotationDeg,
  onRotationChange,
  className,
  extraLayersSlot,
}: ArtifactViewerProps) {
  const page = { width: pageWidth, height: pageHeight };

  // Measure the rendered CSS width for the SplitHandle sidecar.
  // The stage is scaled by CSS so natural pageWidth differs from rendered width.
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(pageWidth);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setMeasuredWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    // Seed on mount
    setMeasuredWidth(containerRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  // WordBboxOverlay uses the `selection` slot so clicks are routable.
  // We need selectionLayerListening=true when in 'words' mode.
  const selectionLayerListening = overlayMode === 'words';

  // Build PageImageCanvas slot children using conditional spread to satisfy
  // exactOptionalPropertyTypes (undefined cannot be assigned to optional fn props).
  const canvasSlots: NonNullable<React.ComponentProps<typeof PageImageCanvas>['children']> = {
    ...(overlayMode === 'illust' && illustBboxes !== undefined
      ? {
          underlay: (p) => <IllustOverlay coords={p.coords} illustBboxes={illustBboxes} />,
        }
      : {}),
    ...(overlayMode === 'words' && wordBboxes !== undefined
      ? {
          selection: (p) => (
            <WordBboxOverlay
              coords={p.coords}
              wordBboxes={wordBboxes}
              {...(onWordClick !== undefined ? { onWordClick } : {})}
            />
          ),
        }
      : {}),
    ...(overlayMode === 'split' && splitProposal !== undefined
      ? {
          tool: (p) => (
            <SplitOverlay
              coords={p.coords}
              splitX={splitProposal.splitX}
              {...(splitProposal.onSplitXChange !== undefined
                ? { onSplitXChange: splitProposal.onSplitXChange }
                : {})}
            />
          ),
        }
      : overlayMode === 'rotate'
        ? {
            tool: (p) => (
              <RotateHandle
                coords={p.coords}
                rotationDeg={rotationDeg ?? 0}
                {...(onRotationChange !== undefined ? { onRotationChange } : {})}
              />
            ),
          }
        : {}),
  };

  return (
    <ArtifactPlate {...(className !== undefined ? { className } : {})}>
      <PaperRender>
        {/* Measurement wrapper — used to pass rendered CSS width to SplitHandle */}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        {/* DOM sidecar for split handle role="separator" */}
        {overlayMode === 'split' && splitProposal !== undefined && (
          <SplitHandle splitX={splitProposal.splitX} containerWidth={measuredWidth} />
        )}
        <PageImageCanvas
          src={imageSrc}
          page={page}
          words={EMPTY_WORDS}
          selectionLayerListening={selectionLayerListening}
        >
          {canvasSlots}
        </PageImageCanvas>
        {/* Extra layers slot */}
        {extraLayersSlot}
      </PaperRender>
    </ArtifactPlate>
  );
}

ArtifactViewer.displayName = 'ArtifactViewer';
