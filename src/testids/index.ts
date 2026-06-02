/**
 * Testid constants catalog.
 *
 * These are the stable identifiers Playwright drivers depend on.
 * Renaming any id here is a breaking change to every consumer driver.
 */

// ─── AppShell ─────────────────────────────────────────────────────────────────

export const APP_SHELL = 'app-shell' as const;
export const APP_SHELL_HEADER = 'app-shell-header' as const;
export const APP_SHELL_RAIL = 'app-shell-rail' as const;
export const APP_SHELL_DRAWER = 'app-shell-drawer' as const;
export const APP_SHELL_MAIN = 'app-shell-main' as const;
export const APP_SHELL_RIGHT = 'app-shell-right' as const;
export const APP_SHELL_FOOTER = 'app-shell-footer' as const;

// ─── ShortcutsHelpButton ──────────────────────────────────────────────────────

/** Ghost icon button in the header that opens the global shortcuts cheatsheet. */
export const SHORTCUTS_HELP_BUTTON = 'shortcuts-help-button' as const;

// ─── SettingsSlot / SettingsModal ─────────────────────────────────────────────

export const SETTINGS_SLOT_TRIGGER = 'settings-slot-trigger' as const;

export const SETTINGS_MODAL = 'settings-modal' as const;
export const SETTINGS_MODAL_CLOSE = 'settings-modal-close' as const;

/** Tab for a specific panel id: `settings-modal-tab-${id}` */
export const settingsModalTab = (id: string) => `settings-modal-tab-${id}` as const;
/** Panel content wrapper for a specific panel id: `settings-modal-panel-${id}` */
export const settingsModalPanel = (id: string) => `settings-modal-panel-${id}` as const;

// ─── AppearancePanel ──────────────────────────────────────────────────────────

export const SETTINGS_APPEARANCE_THEME_DARK = 'settings-appearance-theme-dark' as const;
export const SETTINGS_APPEARANCE_THEME_LIGHT = 'settings-appearance-theme-light' as const;
export const SETTINGS_APPEARANCE_DENSITY_COMPACT = 'settings-appearance-density-compact' as const;
export const SETTINGS_APPEARANCE_DENSITY_NORMAL = 'settings-appearance-density-normal' as const;
export const SETTINGS_APPEARANCE_DENSITY_COMFORTABLE =
  'settings-appearance-density-comfortable' as const;
export const SETTINGS_APPEARANCE_FONT_SCALE_SLIDER =
  'settings-appearance-font-scale-slider' as const;

/** Color input for a given key: `settings-appearance-color-${key}` */
export const settingsAppearanceColor = (key: string) => `settings-appearance-color-${key}` as const;
/** Reset button for a given color key: `settings-appearance-color-${key}-reset` */
export const settingsAppearanceColorReset = (key: string) =>
  `settings-appearance-color-${key}-reset` as const;

// ─── JobRow ───────────────────────────────────────────────────────────────────

export const JOB_ROW = 'job-row' as const;
export const JOB_ROW_OPEN = 'job-row-open' as const;
export const JOB_ROW_STATUS_FAILED = 'job-row-status-failed' as const;

// ─── PipelineTemplate (#345) ──────────────────────────────────────────────────

export const PIPELINE_TEMPLATE = 'pipeline-template' as const;
export const PIPELINE_BREADCRUMB = 'pipeline-breadcrumb' as const;
export const PIPELINE_CONTROLS = 'pipeline-controls' as const;
export const PIPELINE_PROJECT_INFO = 'pipeline-project-info' as const;
export const PIPELINE_STAGE_STRIP = 'pipeline-stage-strip' as const;
export const PIPELINE_TABS = 'pipeline-tabs' as const;
export const PIPELINE_BODY = 'pipeline-body' as const;
export const PIPELINE_EMPTY_SLOT = 'pipeline-empty-slot' as const;
export const COVER_PLACEHOLDER = 'cover-placeholder' as const;

// ─── ProjectInfoBand ──────────────────────────────────────────────────────────

export const PROJECT_INFO_BAND = 'project-info-band' as const;
export const PROJECT_INFO_BAND_TITLE = 'project-info-band-title' as const;
export const PROJECT_INFO_BAND_META = 'project-info-band-meta' as const;
export const PROJECT_INFO_BAND_SETTINGS_BTN = 'project-info-band-settings-btn' as const;

// ─── ProjectSettingsTemplate ──────────────────────────────────────────────────

export const PROJECT_SETTINGS_TEMPLATE = 'project-settings-template' as const;
export const PROJECT_SETTINGS_NAV = 'project-settings-nav' as const;
export const PROJECT_SETTINGS_CONTENT = 'project-settings-content' as const;
/** Nav item for a given group id: `project-settings-nav-item-${id}` */
export const projectSettingsNavItem = (id: string) => `project-settings-nav-item-${id}` as const;

// ─── ProjectsLandingTemplate (#346) ──────────────────────────────────────────

export const PROJECTS_LANDING = 'projects-landing' as const;
export const PROJECTS_DETAIL = 'projects-detail' as const;
export const PROJECTS_OPEN_BTN = 'projects-open-btn' as const;
export const PROJECTS_STATS_GRID = 'projects-stats-grid' as const;
export const PROJECTS_PIPELINE = 'projects-pipeline' as const;
export const PROJECTS_TAB_STRIP = 'projects-tab-strip' as const;
export const PROJECTS_TAB_BODY = 'projects-tab-body' as const;
export const PROJECTS_EMPTY_HERO = 'projects-empty-hero' as const;
export const PROJECTS_CONTROLS = 'projects-controls' as const;

// ─── ConfigureHeader (#344 batch 3) ──────────────────────────────────────────

export const CONFIGURE_HEADER = 'configure-header' as const;

// ─── ProjectConfigureFrame (#344 batch 3) ────────────────────────────────────

export const PROJECT_CONFIGURE_FRAME = 'project-configure-frame' as const;

// ─── StageJumpPopover (#344 batch 3) ─────────────────────────────────────────

export const STAGE_JUMP_POPOVER = 'stage-jump-popover' as const;
export const STAGE_JUMP_POPOVER_TRIGGER = 'stage-jump-popover-trigger' as const;

// ─── ArtifactViewer / PageWorkbench (Phase 2 M1) ─────────────────────────────

/** Prefix for per-word bbox testids: `word-bbox-{id}`. */
export const WORD_BBOX_PREFIX = 'word-bbox-' as const;
/** Build a testid for a specific word bbox: `word-bbox-{id}`. */
export const wordBboxTestId = (id: string) => `${WORD_BBOX_PREFIX}${id}` as const;

/** Draggable split handle (overlayMode='split'). */
export const SPLIT_HANDLE = 'artifact-split-handle' as const;

/** Rotation drag handle (overlayMode='rotate'). */
export const ROTATE_HANDLE = 'artifact-rotate-handle' as const;

/** Outer plate wrapper (ArtifactPlate). */
export const ARTIFACT_PLATE = 'artifact-plate' as const;

/** Inner paper render surface (PaperRender). */
export const PAPER_RENDER = 'paper-render' as const;

// ─── BackendChip (Phase 2 M2 atom) ───────────────────────────────────────────

/** GPU / CPU / auto status chip. */
export const BACKEND_CHIP = 'backend-chip' as const;

// ─── CheckIcon (Phase 2 M2) ───────────────────────────────────────────────────

/** Outer span wrapper for CheckIcon. */
export const CHECK_ICON = 'check-icon' as const;
// ─── PageChip (Phase 2 M2 atom promotion) ────────────────────────────────────

/** Mono-font page-prefix navigation chip. */
export const PAGE_CHIP = 'page-chip' as const;
// ─── ToggleBadge (Phase 2 M2 atom) ───────────────────────────────────────────

export const TOGGLE_BADGE = 'toggle-badge' as const;

// ─── SourceBanner (Phase 2 M3 — Source stage) ────────────────────────────────

/** Root section for the Source stage banner. */
export const SOURCE_BANNER = 'source-banner' as const;

/** "Generate" CTA button (idle state). */
export const SOURCE_BANNER_GENERATE = 'source-banner-generate' as const;

/** "Re-generate" CTA button (idle state). */
export const SOURCE_BANNER_REGENERATE = 'source-banner-regenerate' as const;

/**
 * Build a testid for a specific bulk-action button in selection state.
 *
 * Example: `sourceBulkActionTestId('remove')` → `'source-bulk-action-remove'`
 *
 * Renaming the pattern here is a breaking change to every consumer driver.
 */
export const sourceBulkActionTestId = (action: string) => `source-bulk-action-${action}` as const;

// ─── EditModeSelector (Phase 2 M2) ───────────────────────────────────────────

/** PageWorkbench segmented mode picker (View / Split / Illustration / Rotate). */
export const EDIT_MODE_SELECTOR = 'edit-mode-selector' as const;
// ─── StageControlsPanel (Phase 2 M2) ─────────────────────────────────────────

/** Outer aside wrapper for StageControlsPanel. */
export const STAGE_CONTROLS_PANEL = 'stage-controls-panel' as const;

/** Revert button in StageControlsPanel footer. */
export const STAGE_CONTROLS_PANEL_REVERT = 'stage-controls-panel-revert' as const;

/** Save-as-default button in StageControlsPanel footer. */
export const STAGE_CONTROLS_PANEL_SAVE = 'stage-controls-panel-save' as const;
// ─── TextReviewPane (Phase 2 M2) ─────────────────────────────────────────────

/** Outer section wrapper for TextReviewPane. */
export const TEXT_REVIEW_PANE = 'text-review-pane' as const;

/** Toggle button inside TextReviewPane header. */
export const TEXT_REVIEW_PANE_TOGGLE = 'text-review-pane-toggle' as const;
// ─── PageAttributesBar (Phase 2 M2) ──────────────────────────────────────────

/** Outer wrapper of the page attributes bar. */
export const PAGE_ATTRIBUTES_BAR = 'page-attributes-bar' as const;

/** Collapse/expand toggle button inside the page attributes bar. */
export const PAGE_ATTRIBUTES_BAR_TOGGLE = 'page-attributes-bar-toggle' as const;

/**
 * Build a testid for a specific attribute chip: `page-attr-chip-{id}`.
 * Playwright drivers use these to click individual chips.
 */
export const pageAttrChipTestId = (id: string) => `page-attr-chip-${id}` as const;
// ─── PWHeader (Phase 2 M2) ────────────────────────────────────────────────────

/** Outer <header> element of PWHeader. */
export const PW_HEADER = 'pw-header' as const;

/** Prev page button inside PWHeader. */
export const PW_HEADER_PREV = 'pw-header-prev' as const;

/** Next page button inside PWHeader. */
export const PW_HEADER_NEXT = 'pw-header-next' as const;

/** Page counter span inside PWHeader (e.g. "p 5 of 24"). */
export const PW_HEADER_COUNTER = 'pw-header-counter' as const;

// ─── HierarchyTreePanel (Phase 2 M2) ─────────────────────────────────────────

/** Outer nav wrapper for the hierarchy tree panel. */
export const HIERARCHY_TREE_PANEL = 'hierarchy-tree-panel' as const;

/**
 * Build a testid for a specific tree row: `tree-row-{id}`.
 * Playwright drivers use these to interact with individual nodes.
 */
export const treeRowTestId = (id: string) => `tree-row-${id}` as const;

// ─── BlockTypePickerPanel (Phase 2 M2) ───────────────────────────────────────

/** Outer aside wrapper for BlockTypePickerPanel. */
export const BLOCK_TYPE_PICKER_PANEL = 'block-type-picker-panel' as const;

/**
 * Build a testid for a specific block-type option button: `block-type-{value}`.
 * Playwright drivers use these to click individual type options.
 */
export const blockTypePickerOptionTestId = (value: string) => `block-type-${value}` as const;

// ─── PageAttributesPanel (Phase 2 M2) ────────────────────────────────────────

/** Outer aside wrapper for the page attributes panel (right-drawer). */
export const PAGE_ATTRIBUTES_PANEL = 'page-attributes-panel' as const;

/**
 * Build a testid for a specific attribute row: `page-attr-panel-row-{id}`.
 * Playwright drivers use these to target individual attribute rows.
 */
export const pageAttrPanelRowTestId = (id: string) => `page-attr-panel-row-${id}` as const;

// ─── OcrTextPanel (Phase 2 M2) ──────────────────────────────────────────────

/** Outer aside wrapper for OcrTextPanel (right-drawer OCR text review). */
export const OCR_TEXT_PANEL = 'ocr-text-panel' as const;

/** View-mode toggle (Cards/Rows) inside OcrTextPanel header. */
export const OCR_TEXT_PANEL_VIEW_TOGGLE = 'ocr-text-panel-view-toggle' as const;

/**
 * Build a testid for a specific word: `ocr-word-{id}`.
 * Playwright drivers use these to interact with individual words.
 */
export const ocrWordTestId = (id: string) => `ocr-word-${id}` as const;
// ─── LabelerCanvas (Phase 2 M2) ───────────────────────────────────────────────

/** Outer wrapper of the LabelerCanvas annotation component. */
export const LABELER_CANVAS = 'labeler-canvas' as const;

/**
 * Prefix for per-layer toggle testids: `labeler-layer-toggle-{key}`.
 * Key is one of 'blocks', 'words', 'detections'.
 */
export const LABELER_LAYER_TOGGLE_PREFIX = 'labeler-layer-toggle-' as const;

/**
 * Build a testid for a specific layer toggle: `labeler-layer-toggle-{key}`.
 * Key is one of 'blocks', 'words', 'detections'.
 */
export const labelerLayerToggleTestId = (key: string) =>
  `${LABELER_LAYER_TOGGLE_PREFIX}${key}` as const;

/**
 * Build a testid for a specific block bbox rect: `labeler-block-{id}`.
 * Playwright drivers use this to click individual block rects.
 */
export const labelerBlockTestId = (id: string) => `labeler-block-${id}` as const;

// ─── FileToolbar (Phase 2 M3 — Source stage) ─────────────────────────────────

/** Outer wrapper of the FileToolbar filter/density/insert toolbar. */
export const FILE_TOOLBAR = 'file-toolbar' as const;

/** Insert page CTA button inside FileToolbar. */
export const FILE_TOOLBAR_INSERT = 'file-toolbar-insert' as const;

/**
 * Build a testid for a specific filter chip: `file-toolbar-filter-{filter}`.
 * Filter is one of 'all' | 'marked' | 'skipped' | 'unmarked' | 'inserts'.
 */
export const fileToolbarFilterTestId = (filter: string) => `file-toolbar-filter-${filter}` as const;

/**
 * Build a testid for a specific density segment: `file-toolbar-density-{d}`.
 * d is one of 's' | 'm' | 'l'.
 */
export const fileToolbarDensityTestId = (d: string) => `file-toolbar-density-${d}` as const;
// ─── ThumbCard (Phase 2 M3 — Source stage) ───────────────────────────────────

/** Default testid for the ThumbCard article element. */
export const THUMB_CARD = 'thumb-card' as const;

/**
 * Build a testid for a specific ThumbCard: `thumb-card-{id}`.
 * Playwright drivers use this to target individual page cards.
 */
export const thumbCardTestId = (id: string) => `thumb-card-${id}` as const;

/** Testid for the role-change select inside a ThumbCard. */
export const THUMB_CARD_ROLE_SELECT = 'thumb-card-role-select' as const;
// ─── SourceStepSettings (Phase 2 M3 — Source stage) ─────────────────────────

/** Outer section wrapper for SourceStepSettings. */
export const SOURCE_STEP_SETTINGS = 'source-step-settings' as const;

/** Preset <select> inside SourceStepSettings. */
export const SOURCE_STEP_SETTINGS_PRESET = 'source-step-settings-preset' as const;

/** "Save as preset…" button inside SourceStepSettings. */
export const SOURCE_STEP_SETTINGS_SAVE_PRESET = 'source-step-settings-save-preset' as const;

/** Concurrent workers <input type="range"> inside SourceStepSettings. */
export const SOURCE_STEP_SETTINGS_WORKERS = 'source-step-settings-workers' as const;

/** Auto-confirm row wrapper (contains the Toggle) inside SourceStepSettings. */
export const SOURCE_STEP_SETTINGS_AUTO_CONFIRM = 'source-step-settings-auto-confirm' as const;

/** Re-generate button inside SourceStepSettings (only rendered when onRegenerate is provided). */
export const SOURCE_STEP_SETTINGS_REGENERATE = 'source-step-settings-regenerate' as const;

/**
 * Build a testid for a specific thumbnail quality radio label:
 * `source-step-settings-quality-{q}`.
 * q is one of 'low' | 'medium' | 'high'.
 */
export const sourceStepSettingsQualityTestId = (q: string) =>
  `source-step-settings-quality-${q}` as const;

// ─── BulkBar (Phase 2 M3 — Source stage) ─────────────────────────────────────

/** Outer wrapper of the Source-stage sticky bulk action bar. */
export const BULK_BAR = 'bulk-bar' as const;

/** Clear-selection button inside the BulkBar. */
export const BULK_BAR_CLEAR = 'bulk-bar-clear' as const;

/**
 * Build a testid for a specific bulk action button: `bulk-bar-action-{action}`.
 * Actions: 'page' | 'cover' | 'back' | 'blank' | 'duplicate' | 'remove'.
 */
export const bulkBarActionTestId = (action: string) => `bulk-bar-action-${action}` as const;
// ─── InsertDialog (Phase 2 M3 — Source stage) ────────────────────────────────

/** Outer dialog content wrapper for the insert-page modal. */
export const INSERT_DIALOG = 'insert-dialog' as const;

/** Note textarea inside InsertDialog. */
export const INSERT_DIALOG_NOTE = 'insert-dialog-note' as const;

/** Live character counter span inside InsertDialog. */
export const INSERT_DIALOG_NOTE_COUNTER = 'insert-dialog-note-counter' as const;

/** Hidden file input inside the replacement-image dropzone. */
export const INSERT_DIALOG_FILE = 'insert-dialog-file' as const;

/** Insert/submit button in the InsertDialog footer. */
export const INSERT_DIALOG_SUBMIT = 'insert-dialog-submit' as const;

/** Cancel button in the InsertDialog footer. */
export const INSERT_DIALOG_CANCEL = 'insert-dialog-cancel' as const;

/**
 * Build a testid for the position segmented wrapper: `insert-dialog-position-{p}`.
 * p is one of 'before' | 'after'.
 */
export const insertDialogPositionTestId = (p: string) => `insert-dialog-position-${p}` as const;

/**
 * Build a testid for a kind card button: `insert-dialog-kind-{k}`.
 * k is one of 'missing' | 'blank' | 'errata' | 'manual'.
 */
export const insertDialogKindTestId = (k: string) => `insert-dialog-kind-${k}` as const;
// ─── SourcePageWorkbench (Phase 2 M3 — Source stage) ─────────────────────────

/** Outer wrapper of the SourcePageWorkbench per-page detail view. */
export const SOURCE_PAGE_WORKBENCH = 'source-page-workbench' as const;

/** Apply &amp; Continue button inside SourcePageWorkbench. */
export const SOURCE_PAGE_WORKBENCH_APPLY = 'spw-apply' as const;

/** Prev navigation button inside SourcePageWorkbench. */
export const SOURCE_PAGE_WORKBENCH_PREV = 'spw-prev' as const;

/** Next navigation button inside SourcePageWorkbench. */
export const SOURCE_PAGE_WORKBENCH_NEXT = 'spw-next' as const;

/**
 * Build a testid for a specific role anchor: `spw-role-{role}`.
 * role is one of 'cover' | 'page' | 'back' | 'blank' | 'duplicate'.
 * These hidden anchors are used by Playwright drivers to determine
 * active role state without querying Segmented internals.
 */
export const sourcePageWorkbenchRoleTestId = (role: string) => `spw-role-${role}` as const;

// ─── AutoDetectBanner (Phase 2 M4 — Grayscale stage) ─────────────────────────

/** Root aside for the Grayscale stage auto-detect rationale banner. */
export const AUTO_DETECT_BANNER = 'auto-detect-banner' as const;

/** "Re-detect" button inside the AutoDetectBanner. */
export const AUTO_DETECT_BANNER_REDETECT = 'auto-detect-banner-redetect' as const;

// ─── ModeCard (Phase 2 M4 — Grayscale stage) ─────────────────────────────────
/** Outer radiogroup wrapper for the two-up mode chooser. */
export const MODE_CARD_GROUP = 'mode-card-group' as const;
/**
 * Build a testid for a specific mode radio card: `mode-card-{mode}`.
 * mode is one of 'standard' | 'perceptual'.
 */
export const modeCardTestId = (mode: string) => `mode-card-${mode}` as const;

// ─── AdvancedParams (Phase 2 M4 — Grayscale stage) ───────────────────────────
/** Outer wrapper of the AdvancedParams accordion. */
export const ADVANCED_PARAMS = 'advanced-params' as const;
export const advancedParamsSliderTestId = (
  key: 'samplerRadius' | 'gamma' | 'outputMin' | 'outputMax',
) => `advanced-params-slider-${key}` as const;
export const advancedParamsResetTestId = (key: 'samplerRadius' | 'gamma' | 'outputRange') =>
  `advanced-params-reset-${key}` as const;

// ─── GrayscaleOverview (Phase 2 M4) ──────────────────────────────────────────
export const GRAYSCALE_OVERVIEW = 'grayscale-overview' as const;
export const GRAYSCALE_OVERVIEW_STAT_PROCESSED = 'grayscale-overview-stat-processed' as const;
export const GRAYSCALE_OVERVIEW_STAT_FLAGGED = 'grayscale-overview-stat-flagged' as const;
export const GRAYSCALE_OVERVIEW_STAT_AVG = 'grayscale-overview-stat-avg' as const;
export const GRAYSCALE_OVERVIEW_STAT_TOTAL = 'grayscale-overview-stat-total' as const;

// ─── GrayThumb (Phase 2 M4 — Grayscale stage) ────────────────────────────────
export const GRAY_THUMB = 'gray-thumb' as const;
export const grayThumbTestId = (id: string) => `gray-thumb-${id}` as const;

// ─── PageViewer (Phase 2 M4 — Grayscale stage) ───────────────────────────────
export const PAGE_VIEWER = 'page-viewer' as const;
export const PAGE_VIEWER_RERUN = 'page-viewer-rerun' as const;
export const pageViewerThumbTestId = (id: string) => `page-viewer-thumb-${id}` as const;

// ─── StageControlsLeft (Phase 2 M4 — Grayscale stage) ────────────────────────
export const STAGE_CONTROLS_LEFT = 'stage-controls-left' as const;

// ─── Slot-based stage primitives (Phase 2 promotion) ─────────────────────────
/** Outer wrapper of the Banner primitive. */
export const BANNER = 'banner' as const;
/** Outer wrapper of the StageToolbar primitive. */
export const STAGE_TOOLBAR = 'stage-toolbar' as const;
/** Outer wrapper of the Thumbnail primitive. */
export const THUMBNAIL = 'thumbnail' as const;
/** Build a per-instance Thumbnail testid: `thumbnail-{id}`. */
export const thumbnailTestId = (id: string) => `thumbnail-${id}` as const;

// ─── Stages / Crop (Phase 2 M5) ──────────────────────────────────────────────
export const CROP_BANNER = 'crop-banner' as const;
export const CROP_BANNER_RERUN = 'crop-banner-rerun' as const;

export const CROP_TOOLBAR = 'crop-toolbar' as const;
export const CROP_TOOLBAR_RERUN = 'crop-toolbar-rerun' as const;
export const cropToolbarFilterTestId = (filter: string) => `crop-toolbar-filter-${filter}` as const;
export const cropToolbarFlagTestId = (kind: string) => `crop-toolbar-flag-${kind}` as const;
export const cropToolbarDensityTestId = (d: string) => `crop-toolbar-density-${d}` as const;

export const CROP_CARD = 'crop-card' as const;
export const cropCardTestId = (id: string) => `crop-card-${id}` as const;
export const cropCardFlagTestId = (id: string, kind: string) =>
  `crop-card-flag-${id}-${kind}` as const;

export const CROP_BULK_BAR = 'crop-bulk-bar' as const;
export const cropBulkBarActionTestId = (action: string) =>
  `crop-bulk-bar-action-${action}` as const;

export const BBOX_EDITOR = 'bbox-editor' as const;
export const BBOX_EDITOR_APPLY = 'bbox-editor-apply' as const;
export const bboxEditorMarginTestId = (side: string) => `bbox-editor-margin-${side}` as const;

export const CROP_OVERVIEW = 'crop-overview' as const;
export const CROP_OVERVIEW_DISTRIBUTION = 'crop-overview-distribution' as const;
export const CROP_OVERVIEW_ACTIVITY = 'crop-overview-activity' as const;
export const cropOverviewActivityTestId = (id: string) => `crop-overview-activity-${id}` as const;

export const CROP_STEP_SETTINGS = 'crop-step-settings' as const;
export const CROP_STEP_SETTINGS_RERUN = 'crop-step-settings-rerun' as const;
export const cropStrategyTestId = (s: string) => `crop-strategy-${s}` as const;

// ─── HJStatusPill (Phase 2 M6 — HyphenJoin stage) ────────────────────────────

/** Status pill for a hyphen-join decision row. */
export const HJ_STATUS_PILL = 'hj-status-pill' as const;

// ─── HJDecisionCard (Phase 2 M6 — HyphenJoin stage) ─────────────────────────

/** Root element of the HJDecisionCard case detail block. */
export const HJ_DECISION_CARD = 'hj-decision-card' as const;

/** Accept-join action button inside HJDecisionCard (keyboard: Y). */
export const HJ_DECISION_CARD_ACCEPT = 'hj-decision-card-accept' as const;

/** Keep-hyphen action button inside HJDecisionCard (keyboard: N). */
export const HJ_DECISION_CARD_KEEP = 'hj-decision-card-keep' as const;

/** Flag-for-post-book action button inside HJDecisionCard (keyboard: F). */
export const HJ_DECISION_CARD_FLAG = 'hj-decision-card-flag' as const;

/** Navigate to next case button inside HJDecisionCard (keyboard: J). */
export const HJ_DECISION_CARD_NEXT = 'hj-decision-card-next' as const;

/** Navigate to previous case button inside HJDecisionCard (keyboard: K). */
export const HJ_DECISION_CARD_PREV = 'hj-decision-card-prev' as const;

/** Ngrams sparkline SVG inside HJDecisionCard (absent when ngrams undefined). */
export const HJ_DECISION_CARD_SPARKLINE = 'hj-decision-card-sparkline' as const;

// ─── HyphenOverview (Phase 2 M6 — HyphenJoin stage) ──────────────────────────

/** Root section for the HyphenJoin overview panel. */
export const HYPHEN_OVERVIEW = 'hyphen-overview' as const;

// ─── HyphenUndecided (Phase 2 M6 — HyphenJoin stage) ────────────────────────

/** Root element of the HyphenUndecided queue sidebar + focused detail block. */
export const HYPHEN_UNDECIDED = 'hyphen-undecided' as const;

/**
 * Build a testid for a specific undecided queue sidebar item: `hyphen-undecided-item-{id}`.
 * Playwright drivers use these to click individual sidebar rows.
 */
export const hyphenUndecidedItemTestId = (id: string) => `hyphen-undecided-item-${id}` as const;

// ─── HyphenMismatch (Phase 2 M6 — HyphenJoin stage) ──────────────────────────

/** Root section for the HyphenMismatch mismatch-report table. */
export const HYPHEN_MISMATCH = 'hyphen-mismatch' as const;

/**
 * Build a testid for a specific mismatch row: `hyphen-mismatch-row-{id}`.
 * Playwright drivers use these to target individual mismatch rows.
 */
export const hyphenMismatchRowTestId = (id: string) => `hyphen-mismatch-row-${id}` as const;

// ─── HyphenPageWorkbench (Phase 2 M6 — HyphenJoin stage) ─────────────────────

/** Root div of the HyphenPageWorkbench per-page workbench. */
export const HYPHEN_PAGE_WORKBENCH = 'hyphen-page-workbench' as const;

/** ArtifactViewer slot inside HyphenPageWorkbench (top half). */
export const HYPHEN_PAGE_WORKBENCH_VIEWER = 'hyphen-page-workbench-viewer' as const;

/** Scrollable decisions list container inside HyphenPageWorkbench (bottom). */
export const HYPHEN_PAGE_WORKBENCH_DECISIONS = 'hyphen-page-workbench-decisions' as const;

// ─── HyphenStepSettings (Phase 2 M6 — HyphenJoin stage) ──────────────────────

/** Root div of the HyphenStepSettings panel. */
export const HYPHEN_STEP_SETTINGS = 'hyphen-step-settings' as const;

/** N-gram cache size (MB) numeric input. */
export const HYPHEN_STEP_SETTINGS_CACHE_SIZE = 'hyphen-step-settings-cache-size' as const;

/** N-gram cache TTL (minutes) numeric input. */
export const HYPHEN_STEP_SETTINGS_CACHE_TTL = 'hyphen-step-settings-cache-ttl' as const;

/** Auto-join confidence threshold numeric input. */
export const HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD =
  'hyphen-step-settings-auto-flag-threshold' as const;

// ─── HyphenAutoJoined (Phase 2 M6 — HyphenJoin stage) ────────────────────────

/** Root section for the HyphenAutoJoined grouped-by-word validation panel. */
export const HYPHEN_AUTO_JOINED = 'hyphen-auto-joined' as const;

/**
 * Build a testid for a specific word group section: `hyphen-auto-joined-group-${word}`.
 * Playwright drivers use these to target individual group sections.
 */
export const hyphenAutoJoinedGroupTestId = (word: string) =>
  `hyphen-auto-joined-group-${word}` as const;

// ─── Stages / Validation (Phase 2 M9) ────────────────────────────────────────

/** Root Banner element of the Validation SummaryHeader. */
export const VALIDATION_SUMMARY_HEADER = 'validation-summary-header' as const;

/** Primary CTA button inside the Validation SummaryHeader (Download or Fix All). */
export const VALIDATION_SUMMARY_HEADER_CTA = 'validation-summary-header-cta' as const;

export const VALIDATION_PANEL_TOOLBAR = 'validation-panel-toolbar' as const;
export const VALIDATION_PANEL_TOOLBAR_REVALIDATE = 'validation-panel-toolbar-revalidate' as const;

// ─── QualityFlags ─────────────────────────────────────────────────────────────

export const QUALITY_PAGE_ROW = 'quality-page-row' as const;
export const qualityPageRowTestId = (id: string) => `quality-page-row-${id}` as const;
export const qualityPageRowScoreTestId = (pageId: string, key: string) =>
  `quality-page-row-score-${pageId}-${key}` as const;

/** Default testid for QualityFlags PageThumb root element. */
export const QUALITY_PAGE_THUMB = 'quality-page-thumb' as const;

/**
 * Build a testid for a specific QualityFlags PageThumb: `quality-page-thumb-{pageId}`.
 * Playwright drivers use this to target individual page thumbnails.
 */
export const qualityPageThumbTestId = (pageId: string) => `quality-page-thumb-${pageId}` as const;

export const SCANNO_TOKEN = 'scanno-token' as const;

// ─── Stages / PageReorder (Phase 2 M8) ───────────────────────────────────────
export const REORDER_AFTER_APPLY_STRIP = 'reorder-after-apply-strip' as const;
export const REORDER_AFTER_APPLY_STRIP_UNDO = 'reorder-after-apply-strip-undo' as const;

// ─── Stages / Validation / DownloadFooter (Phase 2 M9) ───────────────────────

/** Root element of the Validation DownloadFooter contextual CTA footer. */
export const VALIDATION_DOWNLOAD_FOOTER = 'validation-download-footer' as const;

/** Download / Download anyway button inside DownloadFooter. */
export const VALIDATION_DOWNLOAD_FOOTER_DOWNLOAD = 'validation-download-footer-download' as const;

/** Fix & rebuild / Fix all (N) button inside DownloadFooter. */
export const VALIDATION_DOWNLOAD_FOOTER_FIX = 'validation-download-footer-fix' as const;

// ─── Stages / Validation / CheckRow (Phase 2 M9) ─────────────────────────────

/** Root element of a CheckRow (collapsible validation check). */
export const VALIDATION_CHECK_ROW = 'validation-check-row' as const;

/** Returns a stable testid for a specific check row by its id. */
export const validationCheckRowTestId = (id: string) => `validation-check-row-${id}` as const;

// ─── Stages / Scannos / NavGroup (Phase 2 M7) ────────────────────────────────

/** Root element of the Scannos NavGroup (side-nav category group). */
export const SCANNO_NAV_GROUP = 'scanno-nav-group' as const;

/** Per-instance testid helper for NavGroup (e.g. `scannoNavGroupTestId('punctuation')`). */
export const scannoNavGroupTestId = (id: string) => `scanno-nav-group-${id}` as const;

/** Count badge inside a NavGroup header. */
export const SCANNO_NAV_GROUP_COUNT = 'scanno-nav-group-count' as const;

// ─── Stages / Scannos / CandidateDetail (Phase 2 M7) ────────────────────────

/** Root element of the Scannos CandidateDetail right-pane panel. */
export const SCANNO_CANDIDATE_DETAIL = 'scanno-candidate-detail' as const;

/** Promote action button inside CandidateDetail. */
export const SCANNO_CANDIDATE_DETAIL_PROMOTE = 'scanno-candidate-detail-promote' as const;

/** Dismiss action button inside CandidateDetail. */
export const SCANNO_CANDIDATE_DETAIL_DISMISS = 'scanno-candidate-detail-dismiss' as const;

/** Editable suggested-replacement input inside CandidateDetail. */
export const SCANNO_CANDIDATE_DETAIL_SUGGESTED_INPUT =
  'scanno-candidate-detail-suggested-input' as const;

// ─── Stages / Scannos / InlineMarkPopover (Phase 2 M7) ───────────────────────

/** Root content element of the InlineMarkPopover (inline token action popover). */
export const SCANNO_INLINE_MARK_POPOVER = 'scanno-inline-mark-popover' as const;

/** Accept action button inside InlineMarkPopover. */
export const SCANNO_INLINE_MARK_POPOVER_ACCEPT = 'scanno-inline-mark-popover-accept' as const;

/** Dismiss action button inside InlineMarkPopover. */
export const SCANNO_INLINE_MARK_POPOVER_DISMISS = 'scanno-inline-mark-popover-dismiss' as const;

/** Promote action button inside InlineMarkPopover. */
export const SCANNO_INLINE_MARK_POPOVER_PROMOTE = 'scanno-inline-mark-popover-promote' as const;

// ─── Stages / PageReorder / SwapRow + PageThumb (Phase 2 M8) ─────────────────

/** Root element of a SwapRow decision row. */
export const REORDER_SWAP_ROW = 'reorder-swap-row' as const;

/** Returns a stable testid for a specific swap row by its swap id. */
export const reorderSwapRowTestId = (id: string) => `reorder-swap-row-${id}` as const;

/** Root element of a PageThumb pair inside a SwapRow. */
export const REORDER_PAGE_THUMB = 'reorder-page-thumb' as const;

// ─── Stages / PageReorder / ReorderScansBanner (Phase 2 M8) ──────────────────

export const REORDER_SCANS_BANNER = 'reorder-scans-banner' as const;
export const REORDER_SCANS_BANNER_SKIP = 'reorder-scans-banner-skip' as const;
export const REORDER_SCANS_BANNER_AUTO_APPLY = 'reorder-scans-banner-auto-apply' as const;
export const REORDER_SCANS_BANNER_REDETECT = 'reorder-scans-banner-redetect' as const;
export const REORDER_SCANS_BANNER_SORT = 'reorder-scans-banner-sort' as const;

// ─── Stages / Projects / ProjectsEmpty (Phase 2 M11) ────────────────────────

/** Root container of the ProjectsEmpty hero. */
export const PROJECTS_EMPTY = 'projects-empty' as const;

/** Primary CTA button inside ProjectsEmpty (e.g. "Create new project"). */
export const PROJECTS_EMPTY_PRIMARY_CTA = 'projects-empty-primary-cta' as const;

/**
 * Secondary CTA button inside ProjectsEmpty (e.g. "Paste source URL").
 * Only rendered when `secondaryAction` prop is provided.
 */
export const PROJECTS_EMPTY_SECONDARY_CTA = 'projects-empty-secondary-cta' as const;

// ─── Stages / Projects / PipelineMini (Phase 2 M11) ──────────────────────────

/** Root element of the Projects PipelineMini progress strip. */
export const PROJECTS_PIPELINE_MINI = 'projects-pipeline-mini' as const;

// ─── Stages / Projects / ProjectsAttributesPanel (Phase 2 M11) ───────────────

/** Root wrapper of the ProjectsAttributesPanel (collapsible 2-column attributes). */
export const PROJECTS_ATTRIBUTES_PANEL = 'projects-attributes-panel' as const;

/** Per-stage dot testid: `projects-pipeline-mini-dot-${stageId}`. */
export const projectsPipelineMiniDotTestId = (stageId: string) =>
  `projects-pipeline-mini-dot-${stageId}` as const;

// ─── Stages / Upload — ModalB (Phase 2 M12) ──────────────────────────────────

/** Root dialog content of ModalB (compact drop-target upload modal). */
export const UPLOAD_MODAL_B = 'upload-modal-b' as const;

/** Drop zone div inside ModalB — role="button", aria-label="Upload images". */
export const UPLOAD_MODAL_B_DROP_ZONE = 'upload-modal-b-drop-zone' as const;

/** Hidden file input inside ModalB (fallback for keyboard / click). */
export const UPLOAD_MODAL_B_FILE_INPUT = 'upload-modal-b-file-input' as const;

// ─── Stages / Upload — ModalC (Phase 2 M12) ──────────────────────────────────

/** Root dialog content of ModalC (desktop 4-step right-side sheet). */
export const UPLOAD_MODAL_C = 'upload-modal-c' as const;

/** Left rail nav wrapper inside ModalC. */
export const UPLOAD_MODAL_C_RAIL = 'upload-modal-c-rail' as const;

/**
 * Build a testid for a specific step rail item: `upload-modal-c-step-${step}`.
 * step is one of 'name' | 'source' | 'review' | 'upload'.
 * Playwright drivers use these to click individual rail items.
 */
export const uploadModalCStepTestId = (step: string) => `upload-modal-c-step-${step}` as const;

// ─── Stages / Scannos — RuleDetail (Phase 2 M7) ──────────────────────────────

/** Root container of the Scannos RuleDetail right-pane panel. */
export const SCANNO_RULE_DETAIL = 'scanno-rule-detail' as const;

/** ToggleBadge for the auto-apply toggle inside RuleDetail. */
export const SCANNO_RULE_DETAIL_AUTO_APPLY = 'scanno-rule-detail-auto-apply' as const;

/** Conflicts warning Banner inside RuleDetail — only present when conflicts non-empty. */
export const SCANNO_RULE_DETAIL_CONFLICTS = 'scanno-rule-detail-conflicts' as const;

// ─── SlideOverPanel / UtilityDock (right-side utility panels) ────────────────

/** Root div of the SlideOverPanel (role="dialog", aria-modal="false"). */
export const SLIDE_OVER_PANEL = 'slide-over-panel' as const;
/** ✕ close button inside the SlideOverPanel header. */
export const SLIDE_OVER_PANEL_CLOSE = 'slide-over-panel-close' as const;
/** Pin/unpin toggle button inside the SlideOverPanel header. */
export const SLIDE_OVER_PANEL_PIN = 'slide-over-panel-pin' as const;
/** Left-edge resize handle — rendered only when pinned. */
export const SLIDE_OVER_PANEL_RESIZE = 'slide-over-panel-resize' as const;
/** Wrapper rendered by UtilityDock when a surface is active. */
export const UTILITY_DOCK = 'utility-dock' as const;
/** Root of SettingsPanel (the dock body for the Settings surface). */
export const SETTINGS_PANEL = 'settings-panel' as const;
/** Root of ShortcutsCheatsheetBody (the dock body for the Keybinds surface). */
export const SHORTCUTS_CHEATSHEET_BODY = 'shortcuts-cheatsheet-body' as const;
/** Root of JobsPanelBody (the dock body for the Jobs surface). */
export const JOBS_PANEL_BODY = 'jobs-panel-body' as const;
/** "View all jobs" footer button inside JobsPanelBody. */
export const JOBS_PANEL_BODY_VIEW_ALL = 'jobs-panel-body-view-all' as const;
