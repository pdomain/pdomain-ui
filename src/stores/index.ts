/**
 * @pdomain/pdomain-ui/stores
 *
 * Zustand store factories and context-bound hooks for pdomain-* SPAs.
 *
 * Store factories (never singletons — apps instantiate per-AppShell):
 *   createSelectionStore()   → SelectionStore
 *   createViewportStore()    → ViewportStore
 *   createWorklistStore()    → WorklistStore
 *   createUIPrefsStore(cfg)  → UIPrefsStore
 *
 * Context providers (wrap AppShell zones):
 *   SelectionStoreProvider, ViewportStoreProvider,
 *   WorklistStoreProvider, UIPrefsStoreProvider
 *
 * Context-bound hooks (must be inside matching provider):
 *   useSelection()        — selection state + actions
 *   useViewport()         — viewport scale/pan + actions
 *   useWorklist()         — worklist activeIndex/filter + actions
 *   useUIPrefs()          — full UIPrefs state + setters
 *   useTheme()            — 'dark' | 'light'
 *   useDensity()          — 'compact' | 'normal' | 'comfortable'
 *   useFontScale()        — number (0.8–1.4)
 *   useLayerColor(layer)  — CSS color string
 *   useStatusColor(status)— CSS color string
 *   useAccentColor()      — { fg, bg }
 *   useSuiteSiblings()    — { siblings, launch, loading }
 *
 * GPU dispatch hooks (stub-friendly Phase 1 impls):
 *   useStageCall(stageId, pageId, opts)  → StageCallState
 *   useLongJob(jobId, opts)              → LongJobState
 */

// ─── Store factories ──────────────────────────────────────────────────────────
export { createSelectionStore } from './createSelectionStore.js';
export type { SelectionState, SelectionStore } from './createSelectionStore.js';

export { createViewportStore } from './createViewportStore.js';
export type { ViewportState, ViewportStore } from './createViewportStore.js';

export { createWorklistStore } from './createWorklistStore.js';
export type { WorklistStoreState, WorklistStore } from './createWorklistStore.js';

export { createUIPrefsStore } from './createUIPrefsStore.js';
export type { UIPrefsStoreState, UIPrefsStore } from './createUIPrefsStore.js';

// ─── Context providers ────────────────────────────────────────────────────────
export {
  SelectionStoreProvider,
  ViewportStoreProvider,
  WorklistStoreProvider,
  UIPrefsStoreProvider,
} from './StoreContexts.js';
export type {
  SelectionStoreProviderProps,
  ViewportStoreProviderProps,
  WorklistStoreProviderProps,
  UIPrefsStoreProviderProps,
} from './StoreContexts.js';

// ─── Context-bound hooks ──────────────────────────────────────────────────────
export {
  useSelection,
  useViewport,
  useWorklist,
  useUIPrefs,
  useTheme,
  useDensity,
  useFontScale,
  useLayerColor,
  useStatusColor,
  useAccentColor,
  useDockPinned,
  useDockWidth,
} from './StoreContexts.js';

// ─── SuiteSiblings ────────────────────────────────────────────────────────────
export { useSuiteSiblings } from './useSuiteSiblings.js';

// ─── GPU dispatch hooks ───────────────────────────────────────────────────────
export { useStageCall } from './useStageCall.js';
export type { StageCallState, StageCallStatus, UseStageCallOptions } from './useStageCall.js';

export { useLongJob } from './useLongJob.js';
export type { LongJobState, LongJobStatus, LongJobEvent, UseLongJobOptions } from './useLongJob.js';

// ─── Compute-device + update hooks ────────────────────────────────────────────
export { useDeviceInfo } from './useDeviceInfo.js';
export type { UseDeviceInfoOptions, DeviceInfoState } from './useDeviceInfo.js';

export { useUpdateCheck } from './useUpdateCheck.js';
export type { UseUpdateCheckOptions, UpdateCheckState } from './useUpdateCheck.js';
