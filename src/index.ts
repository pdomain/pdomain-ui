/**
 * @pdomain/pdomain-ui — root barrel
 *
 * Re-exports all subpath APIs at a single ambient surface.
 * Apps may import from subpaths for tree-shaking, or from the root for convenience.
 *
 * Subpaths:
 *   ./canvas      — PageImageCanvas + slot helpers + canvas hooks
 *   ./worklist    — WordList / LineList / PageList + hooks
 *   ./shell       — AppShell + sub-shells + launcher + context hooks
 *   ./primitives  — design-system primitive wrappers
 *   ./icons       — curated lucide-react re-exports + bespoke SVGs
 *   ./types       — generated TS types + *Like reductions
 *   ./stores      — Zustand store factories + context-bound hooks
 *   ./testids     — data-testid constants catalog
 *   ./templates         — composed molecules and page-level template components
 *   ./stages/Source     — Source ingestion stage components (SourceBanner, …)
 *   ./theme/tokens.css      — dark/light CSS custom properties
 *   ./theme/primitives.css  — component-level CSS classes
 */

// ─── Canvas ───────────────────────────────────────────────────────────────────
export {
  PageImageCanvas,
  BBoxLayer,
  WordHitLayer,
  MarqueeSelectLayer,
  useCanvasCoords,
  useCanvasSelection,
  bboxToRect,
  isValidBBox,
  validatePageDimensions,
  makeRafThrottle,
} from './canvas/index.js';
export type {
  CanvasProps,
  CanvasWord,
  CanvasPage,
  CanvasRect,
  CoordContext,
  SelectionState as CanvasSelectionState,
  ViewportState as CanvasViewportState,
  SlotRenderProps,
  WordSlotProps,
  PageBBox,
  PagePoint,
} from './canvas/index.js';

// ─── Worklist ─────────────────────────────────────────────────────────────────
export {
  WordList,
  LineList,
  PageList,
  StatusPip,
  ConfidenceBar,
  MatchStatusChip,
  useWorklistFilter,
  useWorklistSort,
} from './worklist/index.js';
export type {
  WordListProps,
  LineListProps,
  PageListProps,
  WorklistFilterOptions,
  WorklistSortKey,
} from './worklist/index.js';

// ─── Shell ────────────────────────────────────────────────────────────────────
export {
  AppShell,
  useAppShell,
  LauncherSlot,
  LauncherTile,
  SuiteSiblingsContext,
  Breadcrumb,
  TopNav,
  Drawer,
  Rail,
  RightPanel,
  createApiUIPrefsConfig,
  createApiSuiteSiblingsConfig,
  ComputeTargetPanel,
  UpdatePanel,
  UpdateBadge,
  createApiDeviceConfig,
  createApiUpdateConfig,
} from './shell/index.js';
export type {
  AppShellProps,
  AppShellContextValue,
  NavItem,
  UIPrefsConfig,
  UIPrefs,
  SuiteApp,
  InstalledApp,
  LaunchResult,
  LauncherTileProps,
  BreadcrumbProps,
  TopNavProps,
  DrawerProps,
  RailProps,
  RightPanelProps,
  SuiteSiblingsContextValue,
  ApiSuiteSiblingsOptions,
  ComputeTargetPanelProps,
  UpdatePanelProps,
  UpdateBadgeProps,
  ApiDeviceOptions,
  ApiUpdateOptions,
  DeviceInfo,
  DeviceEntry,
  DevicePutBody,
  UpdateInfo,
  UpdatePolicy,
} from './shell/index.js';

// ─── Stores ───────────────────────────────────────────────────────────────────
export {
  createSelectionStore,
  createViewportStore,
  createWorklistStore,
  createUIPrefsStore,
  SelectionStoreProvider,
  ViewportStoreProvider,
  WorklistStoreProvider,
  UIPrefsStoreProvider,
  useSelection,
  useViewport,
  useWorklist,
  useUIPrefs,
  useTheme,
  useDensity,
  useLayerColor,
  useStatusColor,
  useAccentColor,
  useSuiteSiblings,
  useStageCall,
  useLongJob,
  useDeviceInfo,
  useUpdateCheck,
} from './stores/index.js';
export type {
  SelectionState,
  SelectionStore,
  ViewportState,
  ViewportStore,
  WorklistStoreState,
  WorklistStore,
  UIPrefsStoreState,
  UIPrefsStore,
  StageCallState,
  StageCallStatus,
  UseStageCallOptions,
  LongJobState,
  LongJobStatus,
  LongJobEvent,
  UseLongJobOptions,
  UseDeviceInfoOptions,
  DeviceInfoState,
  UseUpdateCheckOptions,
  UpdateCheckState,
} from './stores/index.js';

// ─── Primitives ───────────────────────────────────────────────────────────────
export {
  Button,
  Input,
  Textarea,
  Badge,
  Chip,
  StatusPip as PrimitivesStatusPip,
  KeyCap,
  Card,
  Separator,
  Progress,
  Accordion,
  FieldRow,
  cn,
  Dialog,
  AlertDialog,
  Popover,
  Tooltip,
  DropdownMenu,
  Select,
  Tabs,
  ToggleGroup,
  StepDots,
  JobStatusPip,
  PopoverClose,
} from './primitives/index.js';
export type {
  StepDotsProps,
  StepDotsState,
  JobStatusPipProps,
  JobState,
} from './primitives/index.js';

// Cross-stage molecules re-exports (batch 1 + batch 2, #344)
export {
  StatTile,
  FlagChip,
  RowFlagBadge,
  Toggle,
  ToggleBadge,
  DiskCostBanner,
  ViewToggle,
  QualityBanner,
  SummaryCell,
  SummaryStrip,
  ThumbFlagBadge,
  ThumbSizeToggle,
  THUMB_SIZES,
  FilterToolbar,
  TableHeader,
  TableFooter,
  ConfigureHeader,
  ConfigureTabs,
  RunAllDirtyPanel,
  BuildPackagePanel,
  ThumbGrid,
  CheckIcon,
  Banner,
  StageToolbar,
  Thumbnail,
} from './primitives/index.js';
export type {
  BannerProps,
  BannerTone,
  StageToolbarProps,
  ThumbnailProps,
  ThumbnailDensity,
} from './primitives/index.js';
export type {
  CheckIconProps,
  CheckIconState,
  StatTileProps,
  StatTileTone,
  FlagChipProps,
  FlagKind,
  RowFlagBadgeProps,
  ToggleProps,
  ToggleBadgeProps,
  DiskCostBannerProps,
  ViewToggleProps,
  ViewMode,
  QualityBannerProps,
  QualityBannerFlag,
  SummaryCellProps,
  SummaryCellTone,
  SummaryStripProps,
  SummaryStripCell,
  ThumbFlagBadgeProps,
  ThumbSizeToggleProps,
  ThumbSizeOption,
  FilterToolbarProps,
  TableHeaderProps,
  TableColumnDef,
  SortDir,
  TableFooterProps,
  ConfigureHeaderProps,
  ConfigureHeaderTrailItem,
  ConfigureTabsProps,
  ConfigureTabItem,
  RunAllDirtyPanelProps,
  BuildPackagePanelProps,
  ThumbGridProps,
} from './primitives/index.js';

// ─── Shortcuts cheatsheet (from primitives) ───────────────────────────────────
export { ShortcutsCheatsheet } from './primitives/index.js';
export type { ShortcutsCheatsheetProps } from './primitives/index.js';

// ─── Utility dock primitives (from primitives) ────────────────────────────────
export { SlideOverPanel, ShortcutsCheatsheetBody } from './primitives/index.js';
export type { SlideOverPanelProps, ShortcutsCheatsheetBodyProps } from './primitives/index.js';

// ─── Utility dock shell API ───────────────────────────────────────────────────
export {
  UtilityDockContext,
  useUtilityDock,
  UtilityDock,
  SettingsPanel,
  JobsPanelBody,
} from './shell/index.js';
export type {
  UtilityDockContextValue,
  DockSurface,
  UtilityDockProps,
  SettingsPanelProps,
  JobsPanelBodyProps,
} from './shell/index.js';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useShortcuts, formatShortcut } from './hooks/index.js';
export type { ShortcutBinding, UseShortcutsOptions } from './hooks/index.js';

// ─── Templates ───────────────────────────────────────────────────────────────
export { StageStrip, PIPELINE_STAGES } from './templates/index.js';
export type { StageStripProps, StageDef } from './templates/index.js';

// ─── Icons ────────────────────────────────────────────────────────────────────
export * from './icons/index.js';

// ─── Templates ────────────────────────────────────────────────────────────────
export { TabsBand } from './templates/index.js';
export type { TabsBandItem, TabsBandProps } from './templates/index.js';

export {
  PipelineTemplate,
  PipelineEmptySlot,
  ProjectInfoBand,
  CoverPlaceholder,
  getTabsForStage,
} from './templates/index.js';
export type {
  PipelineTemplateProps,
  PipelineProject,
  TrailItem,
  ProjectInfoBandProps,
  CoverPlaceholderProps,
} from './templates/index.js';

export { ProjectSettingsTemplate } from './templates/index.js';
export type { ProjectSettingsTemplateProps, ProjectSettingsGroup } from './templates/index.js';

export { StageJumpPopover } from './templates/index.js';
export type { StageJumpPopoverProps } from './templates/index.js';

export { ProjectConfigureFrame } from './templates/index.js';
export type { ProjectConfigureFrameProps } from './templates/index.js';

// ─── Stages / PageWorkbench ───────────────────────────────────────────────────
export { ArtifactViewer } from './stages/PageWorkbench/index.js';
export type {
  ArtifactViewerProps,
  OverlayMode,
  SplitProposal,
  IllustBbox,
  WordBbox,
} from './stages/PageWorkbench/index.js';
export {
  SplitOverlay,
  SplitHandle,
  IllustOverlay,
  WordBboxOverlay,
  RotateHandle,
} from './stages/PageWorkbench/index.js';
export type {
  SplitOverlayProps,
  SplitHandleProps,
  IllustOverlayProps,
  WordBboxOverlayProps,
  RotateHandleProps,
} from './stages/PageWorkbench/index.js';
export { EditModeSelector } from './stages/PageWorkbench/index.js';
export type { EditModeSelectorProps, EditMode } from './stages/PageWorkbench/index.js';
export { StageControlsPanel } from './stages/PageWorkbench/index.js';
export type { StageControlsPanelProps, Inheritance } from './stages/PageWorkbench/index.js';
export { TextReviewPane } from './stages/PageWorkbench/index.js';
export type { TextReviewPaneProps } from './stages/PageWorkbench/index.js';

// PageAttributesBar (Phase 2 M2)
export { PageAttributesBar } from './stages/PageWorkbench/index.js';
export type { PageAttributesBarProps, PageAttribute } from './stages/PageWorkbench/index.js';

// PWHeader (Phase 2 M2)
export { PWHeader } from './stages/PageWorkbench/index.js';
export type { PWHeaderProps } from './stages/PageWorkbench/index.js';
// HierarchyTreePanel (Phase 2 M2)
export { HierarchyTreePanel } from './stages/PageWorkbench/index.js';
export type {
  HierarchyTreePanelProps,
  TreeNode,
  TreeNodeType,
} from './stages/PageWorkbench/index.js';
// BlockTypePickerPanel (Phase 2 M2)
export { BlockTypePickerPanel } from './stages/PageWorkbench/index.js';
export type { BlockTypePickerPanelProps, BlockTypeOption } from './stages/PageWorkbench/index.js';
// PageAttributesPanel (Phase 2 M2)
export { PageAttributesPanel } from './stages/PageWorkbench/index.js';
export type { PageAttributesPanelProps } from './stages/PageWorkbench/index.js';
// OcrTextPanel (Phase 2 M2)
export { OcrTextPanel } from './stages/PageWorkbench/index.js';
export type {
  OcrTextPanelProps,
  OcrLine,
  OcrWord,
  OcrViewMode,
} from './stages/PageWorkbench/index.js';

// LabelerCanvas (Phase 2 M2 — annotation-mode canvas)
export { LabelerCanvas } from './stages/PageWorkbench/index.js';
export type {
  LabelerCanvasProps,
  LabelerBlock,
  LayerVisibility,
} from './stages/PageWorkbench/index.js';

// ─── Phase 2 M2 atom promotions ───────────────────────────────────────────────
export { BackendChip } from './primitives/index.js';
export type { BackendChipProps, BackendValue } from './primitives/index.js';
// ─── PageChip (Phase 2 M2 atom promotion) ────────────────────────────────────
export { PageChip } from './primitives/index.js';
export type { PageChipProps } from './primitives/index.js';

// ─── Stages / Source (Phase 2 M3) ────────────────────────────────────────────
export {
  SourceBanner,
  FileToolbar,
  ThumbCard,
  BulkBar,
  InsertDialog,
  SourcePageWorkbench,
  SourceStepSettings,
} from './stages/Source/index.js';
export type {
  SourceBannerProps,
  SourceBannerState,
  SourceBulkAction,
  FileToolbarProps,
  SourceFilter,
  SourceDensity,
  SourceFilterCounts,
  ThumbCardProps,
  SourcePage,
  SourcePageRole,
  SourcePageStatus,
  ThumbDensity,
  BulkBarProps,
  BulkAction,
  InsertDialogProps,
  InsertPosition,
  InsertKind,
  InsertAnchorOption,
  InsertSubmission,
  SourcePageWorkbenchProps,
  SourceStepSettingsProps,
  SourceSettings,
  PresetOption,
  ThumbQuality,
} from './stages/Source/index.js';

// ─── Stages / Grayscale (Phase 2 M4) ─────────────────────────────────────────
export {
  AutoDetectBanner,
  ModeCard,
  AdvancedParams,
  GRAYSCALE_PARAMS_DEFAULT,
  GrayscaleOverview,
  GrayThumb,
  PageViewer,
  StageControlsLeft,
} from './stages/Grayscale/index.js';
export type {
  AutoDetectBannerProps,
  GrayscaleMode,
  ModeCardProps,
  ModeEstimate,
  EstimateTone,
  AdvancedParamsProps,
  GrayscaleParams,
  GrayscaleOverviewProps,
  GrayscaleStats,
  GrayThumbProps,
  GrayPage,
  PageViewerProps,
  PageViewerMode,
  PageViewerPage,
  PageViewerThumb,
  StageControlsLeftProps,
} from './stages/Grayscale/index.js';

// ─── Stages / Crop (Phase 2 M5) ──────────────────────────────────────────────
export {
  CropBanner,
  CropToolbar,
  CropCard,
  CropBulkBar,
  BboxEditor,
  CropOverview,
  CropStepSettings,
  CROP_SETTINGS_DEFAULT,
} from './stages/Crop/index.js';
export type {
  CropBannerProps,
  CropState,
  CropFlagCounts,
  CropToolbarProps,
  CropFilter,
  CropFlagKind,
  CropDensity,
  CropFilterCounts,
  CropFlagDrillCounts,
  CropCardProps,
  CropPage,
  CropStatus,
  CropBbox,
  CropBulkBarProps,
  CropBulkAction,
  BboxEditorProps,
  BboxEditorPage,
  BboxMargins,
  BboxUnit,
  BboxScope,
  CropOverviewProps,
  FlagDistributionEntry,
  CropActivityEntry,
  CropStepSettingsProps,
  CropSettings,
  CropStrategy,
} from './stages/Crop/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────
export * from './types/index.js';
