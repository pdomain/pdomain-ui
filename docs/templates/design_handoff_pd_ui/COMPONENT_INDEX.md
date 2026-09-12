# Component inventory

Auto-extracted from every `.jsx` file in the project. Each identifier is a top-level `const Name = …` or `function Name(…)` where Name starts with a capital — these are React components, hooks, or React-adjacent helpers.

**Use as a starting point, not gospel.** Many entries are local sub-components (e.g. `FakeThumb`, `SrcWBField`, `SrcWBInput`) that should stay co-located with their parent rather than being promoted into pdomain-ui. The PROMPT.md triage rules tell you how to decide.

## Components by file

### `design-system/template.jsx`  ·  7

- `AppHeader`
- `AppTemplate`
- `Breadcrumb`
- `ControlsPlaceholder`
- `JobRow`
- `JobsDrawer`
- `JobsPill`

### `design-system/ui-base.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `final/canvas-nav.jsx`  ·  2

- `CANVAS_LINKS`
- `CanvasNav`

### `final/crop/app.jsx`  ·  1

- `App`

### `final/crop/crop.jsx`  ·  13

- `BboxEditor`
- `CROP_DENSITY`
- `CropBanner`
- `CropBulkBar`
- `CropCard`
- `CropOverview`
- `CropPages`
- `CropStepSettings`
- `CropToolbar`
- `CroppedThumb`
- `FlagChip`
- `MarginField`
- `StatusDot`

### `final/grayscale/app.jsx`  ·  1

- `App`

### `final/grayscale/grayscale.jsx`  ·  21

- `AdvancedParams`
- `AdvancedParamsStacked`
- `AutoDetectBanner`
- `BackendChip`
- `GRAY_PAGES`
- `GrayThumb`
- `GrayscaleBody`
- `GrayscaleOverview`
- `GrayscalePages`
- `GrayscaleStatTile`
- `GrayscaleStepSettings`
- `GrayscaleSubhead`
- `ModeCard`
- `ModePill`
- `ModeRowCompact`
- `PROJECT_PAGES_GS`
- `PageRender`
- `PageViewer`
- `SAMPLE_PAGE_GS`
- `STANDARD_TIME_GS`
- `StageControlsLeft`

### `final/hyphen_join/app.jsx`  ·  1

- `App`

### `final/hyphen_join/hyphen.jsx`  ·  27

- `HJAfterView`
- `HJBeforeView`
- `HJDecisionCard`
- `HJPageCaseRow`
- `HJStateChip`
- `HJStatusPill`
- `HJ_CASE_BY_ID`
- `HJ_COLLAPSE_IDS`
- `HJ_PAGE_CASES`
- `HJ_PAGE_ID`
- `HJ_PAGE_IDX`
- `HJ_PAGE_LINES`
- `HJ_PAGE_PARAGRAPHS`
- `HJ_STATES`
- `HJ_STATES_BY_ID`
- `HJ_STATUS_TONE`
- `HyphenAutoJoined`
- `HyphenBody`
- `HyphenMismatch`
- `HyphenOverview`
- `HyphenPageWorkbench`
- `HyphenStepSettings`
- `HyphenSubhead`
- `HyphenToggle`
- `HyphenUndecided`
- `SelectStub`
- `ThresholdSlider`

### `final/hyphen_join/variations.jsx`  ·  48

- `AUTO_JOINED_WORDS`
- `AutoJoinedList`
- `AutoJoinedRow`
- `BookContextLine`
- `ContextSnippet`
- `HYPHEN_RULES`
- `HyphenCard`
- `HyphenLibraryTab`
- `HyphenRow`
- `HyphenV1`
- `HyphenV2`
- `HyphenV3`
- `HyphenV4`
- `HyphenV5`
- `InstanceLine`
- `Kbd`
- `LB`
- `MISMATCHED`
- `MismatchRow`
- `MismatchedReportV4`
- `NgramLink`
- `NgramSparklineCell`
- `NgramsBlock`
- `PageBreak`
- `PerBookFrame`
- `Pip`
- `PostBookNotesPreview`
- `ProposalPills`
- `QueueCase`
- `QueueSidebar`
- `ReportHeader`
- `ReportStatTiles`
- `RuleChip`
- `RuleChipInline`
- `SCANNOS`
- `ScannosLibraryTab`
- `ScannosTable`
- `SectionHead`
- `SettingsHyphens`
- `SettingsPageFrame`
- `SettingsScannos`
- `Sparkline`
- `StatTile`
- `TagList`
- `UNDECIDED_CASES`
- `UndecidedListV1`
- `UndecidedListV2`
- `ViewToggle`

### `final/pipeline/app.jsx`  ·  1

- `App`

### `final/pipeline/pipeline-template.jsx`  ·  11

- `PipelineEmptySlot`
- `PipelineTemplate`
- `ProjectInfoBand`
- `ProjectSettingsGeneralExample`
- `ProjectSettingsTemplate`
- `SAMPLE_PROJECT`
- `STAGE_DEFS`
- `STAGE_STATE`
- `STAGE_TABS`
- `StageStrip`
- `TabsBand`

### `final/pipeline/project-settings.jsx`  ·  12

- `FieldRow`
- `ProjectSettings_Bibliographic`
- `ProjectSettings_Danger`
- `ProjectSettings_Format`
- `ProjectSettings_Members`
- `ProjectSettings_PGDP`
- `ProjectSettings_StageDefaults`
- `ProjectSettings_Storage`
- `SettingsCard`
- `SettingsHeader`
- `SettingsRow`
- `Toggle`

### `final/projects/app.jsx`  ·  1

- `App`

### `final/projects/post-import.jsx`  ·  5

- `AnchorProject`
- `IMPORT_JOBS`
- `PostImport_Drawer`
- `PostImport_Rail`
- `PostImport_Redirect`

### `final/projects/projects.jsx`  ·  8

- `AttributesPanel`
- `CoverPlaceholder`
- `PROJECTS`
- `PipelineMini`
- `ProjectsControls`
- `ProjectsEmpty`
- `ProjectsPage`
- `STATUS`

### `final/source/app.jsx`  ·  1

- `App`

### `final/source/source.jsx`  ·  26

- `BulkBar`
- `FakeThumb`
- `FileToolbar`
- `InsertDialog`
- `InsertDivider`
- `InsertedThumb`
- `KIND_LABEL`
- `SOURCE_ROLES`
- `STATE_LABEL`
- `SkeletonThumb`
- `SourceBanner`
- `SourceFiles`
- `SourceMetadata`
- `SourceOverview`
- `SourcePageWorkbench`
- `SourceStageControlsLeft`
- `SourceStepSettings`
- `SourceViewer`
- `SourceWBSubhead`
- `SrcPagePreview`
- `SrcRoleSegment`
- `SrcWBField`
- `SrcWBInput`
- `SrcWBSelect`
- `TagChip`
- `ThumbCard`

### `final/template/app.jsx`  ·  1

- `App`

### `wf-pw/app.jsx`  ·  1

- `App`

### `wf-pw/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf-pw/wf-pw-variations.jsx`  ·  59

- `ATTR_TYPES`
- `ArtifactPlate`
- `ArtifactViewer`
- `AttrEditorPopover`
- `AttrField`
- `AttrPill`
- `BLOCK_TYPES_CONTENT`
- `BLOCK_TYPES_STRUCTURAL`
- `BlockTypePickerPanel`
- `CanvasMapControls`
- `CheckRow`
- `CollapsedStageStrip`
- `ConfPip`
- `ControlField`
- `CropCompareViewer`
- `CroppedPlate`
- `DeskewControls`
- `Drawer`
- `EditModeSelector`
- `GenericControls`
- `GrayscaleControls`
- `HierarchyTreePanel`
- `IllustOverlay`
- `InitialCropControls`
- `LABEL_TONES`
- `LabelerCanvas`
- `LayerToggle`
- `LineBlockCards`
- `LineBlockRows`
- `LineHeader`
- `MarkerOpt`
- `OCR_LINES`
- `OcrControls`
- `OcrTextPanel`
- `OverlayPlate`
- `PAGE_BLOCKS`
- `PAGE_STAGE_STATUS`
- `PWHeader`
- `PageAttributesBar`
- `PageAttributesPanel`
- `PaperRender`
- `SAMPLE_ATTRS`
- `STAGE_CONTROL`
- `Seg2`
- `Slider`
- `SourcePlate`
- `SplitOverlay`
- `StageControlsPanel`
- `StageSelect`
- `TYPE_CHIP_TONE`
- `TextReviewPane`
- `ThresholdControls`
- `TreeRow`
- `TypeGrid`
- `VariationPW`
- `WordBboxOverlay`
- `WordCard`
- `WordRow`
- `ZoneRow`

### `wf-pw/wf03-variations.jsx`  ·  34

- `BulkActionBar`
- `ConfigureHeader`
- `ConfigureTabs`
- `FLAG_META`
- `FLAG_TONE`
- `FilterToolbar`
- `FlagChip`
- `PAGE_TYPE_BADGE`
- `PageRow`
- `PageThumb`
- `QualityBanner`
- `ROWS_BASE`
- `ROWS_BLURRY_ONLY`
- `ROWS_FLAGGED_ONLY`
- `RowFlagBadge`
- `STAGE_DEFS`
- `STAGE_FLAGS`
- `STAGE_FLAG_DETAIL`
- `STAGE_STATE_BY_INDEX`
- `StageContextStrip`
- `StageJumpPopover`
- `SummaryCell`
- `SummaryStrip`
- `THUMB_SIZE_CFG`
- `TableFooter`
- `TableHeader`
- `ThemedFrame`
- `ThumbFlagBadge`
- `ThumbGrid`
- `ThumbSizeToggle`
- `Toggle`
- `VariationA`
- `VariationB`
- `ViewToggle`

### `wf01/app.jsx`  ·  1

- `App`

### `wf01/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf01/variations.jsx`  ·  37

- `CornerIcon`
- `DropletIdle`
- `EXT_SOURCES`
- `FFooter`
- `FHeader`
- `FRail`
- `FReviewBody`
- `FSourceBody`
- `FUploadBody`
- `F_STEPS`
- `FolderPickerBody`
- `HathiDetectedCard`
- `IADetectedCard`
- `LocalDetectedCard`
- `LocalPathBody`
- `ManifestTable`
- `MetadataGrid`
- `MiniStat`
- `ModalA`
- `ModalB`
- `ModalC`
- `ModalD`
- `ModalE`
- `ModalF`
- `PageRangeBar`
- `PhaseCard`
- `ProgressBar`
- `SegTiny`
- `SourceCard`
- `SourceChip`
- `Stage`
- `Stat`
- `StatTile`
- `Thumb`
- `URLBody`
- `UploadingPhases`
- `ZipPickerBody`

### `wf02/app.jsx`  ·  1

- `App`

### `wf02/pipeline-shell.jsx`  ·  7

- `BuildPackagePanel`
- `DiskCostBanner`
- `ProjectConfigureFrame`
- `RunAllDirtyPanel`
- `STAGE_DEFS`
- `StageContextStrip`
- `Tab`

### `wf02/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf02/validation-panel.jsx`  ·  7

- `CheckIcon`
- `CheckRow`
- `DownloadFooter`
- `PageChip`
- `PanelToolbar`
- `SummaryHeader`
- `ValidationPanel`

### `wf02/variations.jsx`  ·  1

- `VariationFrame`

### `wf03/app.jsx`  ·  1

- `App`

### `wf03/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf03/wf03-variations.jsx`  ·  34

- `BulkActionBar`
- `ConfigureHeader`
- `ConfigureTabs`
- `FLAG_META`
- `FLAG_TONE`
- `FilterToolbar`
- `FlagChip`
- `PAGE_TYPE_BADGE`
- `PageRow`
- `PageThumb`
- `QualityBanner`
- `ROWS_BASE`
- `ROWS_BLURRY_ONLY`
- `ROWS_FLAGGED_ONLY`
- `RowFlagBadge`
- `STAGE_DEFS`
- `STAGE_FLAGS`
- `STAGE_FLAG_DETAIL`
- `STAGE_STATE_BY_INDEX`
- `StageContextStrip`
- `StageJumpPopover`
- `SummaryCell`
- `SummaryStrip`
- `THUMB_SIZE_CFG`
- `TableFooter`
- `TableHeader`
- `ThemedFrame`
- `ThumbFlagBadge`
- `ThumbGrid`
- `ThumbSizeToggle`
- `Toggle`
- `VariationA`
- `VariationB`
- `ViewToggle`

### `wf05/app.jsx`  ·  1

- `App`

### `wf05/library-variations.jsx`  ·  36

- `ALWAYS_JOIN_PROV`
- `CheckRow`
- `DialogShell`
- `FilePicker`
- `ImportDiffSummary`
- `ImportSourceTab`
- `InboxCard`
- `JsonLine`
- `KindPill`
- `LIB_TREE`
- `LibL3`
- `LibL4`
- `LibL5`
- `LibL6`
- `LibL7`
- `LibL8`
- `LibL9`
- `LibraryRail`
- `LibraryShell`
- `ModalOverlay`
- `PENDING`
- `PROV_META`
- `PackChip`
- `ProvFilters`
- `ProvPip`
- `QuickAddRow`
- `RadioRow`
- `RuleRow`
- `SOURCE_TABS`
- `STARTER_PACKS`
- `SearchBox`
- `SearchGroup`
- `SearchHit`
- `SegTab`
- `StarterPack`
- `Tk`

### `wf05/pipeline-shell.jsx`  ·  7

- `BuildPackagePanel`
- `DiskCostBanner`
- `ProjectConfigureFrame`
- `RunAllDirtyPanel`
- `STAGE_DEFS`
- `StageContextStrip`
- `Tab`

### `wf05/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf05/variations.jsx`  ·  47

- `AUTO_JOINED_WORDS`
- `AutoJoinedList`
- `AutoJoinedRow`
- `BookContextLine`
- `ContextSnippet`
- `HYPHEN_RULES`
- `HyphenCard`
- `HyphenLibraryTab`
- `HyphenRow`
- `HyphenV1`
- `HyphenV2`
- `HyphenV3`
- `HyphenV4`
- `HyphenV5`
- `InstanceLine`
- `Kbd`
- `LB`
- `MISMATCHED`
- `MismatchRow`
- `MismatchedReportV4`
- `NgramLink`
- `NgramsBlock`
- `PageBreak`
- `PerBookFrame`
- `Pip`
- `PostBookNotesPreview`
- `ProposalPills`
- `QueueCase`
- `QueueSidebar`
- `ReportHeader`
- `ReportStatTiles`
- `RuleChip`
- `RuleChipInline`
- `SCANNOS`
- `ScannosLibraryTab`
- `ScannosTable`
- `SectionHead`
- `SettingsHyphens`
- `SettingsPageFrame`
- `SettingsScannos`
- `Sparkline`
- `StatTile`
- `TagList`
- `UNDECIDED_CASES`
- `UndecidedListV1`
- `UndecidedListV2`
- `ViewToggle`

### `wf05b/app.jsx`  ·  1

- `App`

### `wf05b/pipeline-shell.jsx`  ·  7

- `BuildPackagePanel`
- `DiskCostBanner`
- `ProjectConfigureFrame`
- `RunAllDirtyPanel`
- `STAGE_DEFS`
- `StageContextStrip`
- `Tab`

### `wf05b/scanno-capture.jsx`  ·  10

- `C1_PAGE_TITLE`
- `C1_PARAGRAPHS`
- `C1_SELECTED`
- `C1_SUSPICIONS`
- `InlineMarkPopover`
- `SRC_LABEL`
- `SRC_TONE`
- `SRC_UNDERLINE`
- `ScannoCapture`
- `ScannoToken`

### `wf05b/scanno-configure.jsx`  ·  8

- `C3_MATCH_TONE`
- `C3_RULES`
- `NavGroup`
- `Row`
- `RuleDetail`
- `ScannoConfigure`
- `Stat`
- `ToggleBadge`

### `wf05b/scanno-pipeline.jsx`  ·  2

- `P0_PAGES`
- `ScannoPipeline`

### `wf05b/scanno-promote.jsx`  ·  7

- `C2_CANDIDATES`
- `C2_SRC_LABEL`
- `C2_SRC_TONE`
- `C2_STATUS_LABEL`
- `C2_STATUS_TONE`
- `CandidateDetail`
- `ScannoPromote`

### `wf05b/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf09/app.jsx`  ·  1

- `App`

### `wf09/pages-tab.jsx`  ·  16

- `CheckIconSquare`
- `DragGhost`
- `DropIndicator`
- `MenuRow`
- `PageRow`
- `PageThumb`
- `PagesHeader`
- `PagesToolbar`
- `ReorderScansBanner`
- `ReorderScansStage`
- `RowActionsMenu`
- `SAMPLE_ROWS`
- `SWAPS`
- `SwapRow`
- `TYPE_TONE`
- `UndoStrip`

### `wf09/pipeline-shell.jsx`  ·  7

- `BuildPackagePanel`
- `DiskCostBanner`
- `ProjectConfigureFrame`
- `RunAllDirtyPanel`
- `STAGE_DEFS`
- `StageContextStrip`
- `Tab`

### `wf09/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf09/variations.jsx`  ·  9

- `PagesActionsMenu`
- `PagesDragMulti`
- `PagesDragSingle`
- `PagesDropped`
- `PagesEdgeOutOfRange`
- `PagesHoverGrip`
- `PagesIdle`
- `PipelineRunningDialog`
- `ROW_WINDOW`

### `wf10/app.jsx`  ·  1

- `App`

### `wf10/crops-grid.jsx`  ·  11

- `BulkActionBar`
- `CROP_FLAGS`
- `CROP_ROWS`
- `CropThumb`
- `CropsGrid`
- `CropsGridPage`
- `DENSITY_CFG`
- `DensitySeg`
- `FilterChip`
- `FlagPill`
- `GridToolbar`

### `wf10/pipeline-shell.jsx`  ·  7

- `BuildPackagePanel`
- `DiskCostBanner`
- `ProjectConfigureFrame`
- `RunAllDirtyPanel`
- `STAGE_DEFS`
- `StageContextStrip`
- `Tab`

### `wf10/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf10/variations.jsx`  ·  10

- `CropBboxEditor`
- `GridBboxEditor`
- `GridFiltered`
- `GridFlagCropped`
- `GridHover`
- `GridIdleL`
- `GridIdleM`
- `GridIdleS`
- `GridSelected`
- `GridSelectedRange`

### `wf11/app.jsx`  ·  1

- `App`

### `wf11/ui.jsx`  ·  12

- `AppFrame`
- `Badge`
- `Button`
- `Divider`
- `Icon`
- `Input`
- `KeyCap`
- `PageHeader`
- `ProjectListBackdrop`
- `ServerFooter`
- `StepDots`
- `TopNav`

### `wf11/wf-pw-variations.jsx`  ·  59

- `ATTR_TYPES`
- `ArtifactPlate`
- `ArtifactViewer`
- `AttrEditorPopover`
- `AttrField`
- `AttrPill`
- `BLOCK_TYPES_CONTENT`
- `BLOCK_TYPES_STRUCTURAL`
- `BlockTypePickerPanel`
- `CanvasMapControls`
- `CheckRow`
- `CollapsedStageStrip`
- `ConfPip`
- `ControlField`
- `CropCompareViewer`
- `CroppedPlate`
- `DeskewControls`
- `Drawer`
- `EditModeSelector`
- `GenericControls`
- `GrayscaleControls`
- `HierarchyTreePanel`
- `IllustOverlay`
- `InitialCropControls`
- `LABEL_TONES`
- `LabelerCanvas`
- `LayerToggle`
- `LineBlockCards`
- `LineBlockRows`
- `LineHeader`
- `MarkerOpt`
- `OCR_LINES`
- `OcrControls`
- `OcrTextPanel`
- `OverlayPlate`
- `PAGE_BLOCKS`
- `PAGE_STAGE_STATUS`
- `PWHeader`
- `PageAttributesBar`
- `PageAttributesPanel`
- `PaperRender`
- `SAMPLE_ATTRS`
- `STAGE_CONTROL`
- `Seg2`
- `Slider`
- `SourcePlate`
- `SplitOverlay`
- `StageControlsPanel`
- `StageSelect`
- `TYPE_CHIP_TONE`
- `TextReviewPane`
- `ThresholdControls`
- `TreeRow`
- `TypeGrid`
- `VariationPW`
- `WordBboxOverlay`
- `WordCard`
- `WordRow`
- `ZoneRow`

### `wf11/wf03-variations.jsx`  ·  34

- `BulkActionBar`
- `ConfigureHeader`
- `ConfigureTabs`
- `FLAG_META`
- `FLAG_TONE`
- `FilterToolbar`
- `FlagChip`
- `PAGE_TYPE_BADGE`
- `PageRow`
- `PageThumb`
- `QualityBanner`
- `ROWS_BASE`
- `ROWS_BLURRY_ONLY`
- `ROWS_FLAGGED_ONLY`
- `RowFlagBadge`
- `STAGE_DEFS`
- `STAGE_FLAGS`
- `STAGE_FLAG_DETAIL`
- `STAGE_STATE_BY_INDEX`
- `StageContextStrip`
- `StageJumpPopover`
- `SummaryCell`
- `SummaryStrip`
- `THUMB_SIZE_CFG`
- `TableFooter`
- `TableHeader`
- `ThemedFrame`
- `ThumbFlagBadge`
- `ThumbGrid`
- `ThumbSizeToggle`
- `Toggle`
- `VariationA`
- `VariationB`
- `ViewToggle`

### `wf11/wf11-variations.jsx`  ·  29

- `AdvancedAccordion`
- `AutoBanner`
- `AutoBannerF`
- `BackendChip`
- `BodyA`
- `BodyB`
- `BodyC`
- `BodyD`
- `BodyE`
- `BodyF`
- `CachedNote`
- `ModeCard`
- `ModeCardCompact`
- `ModeRow`
- `PerceptualCallout`
- `RadioDot`
- `SAMPLE_PAGE`
- `STANDARD_TIME`
- `SplitPreview`
- `Thumb`
- `VariationWF11`
- `WF11Field`
- `WF11Panel`
- `WF11_A`
- `WF11_B`
- `WF11_C`
- `WF11_D`
- `WF11_E`
- `WF11_F`

## Cross-file frequency — likely shared primitives

Identifiers that show up in **2+ files** are strong candidates for pdomain-ui promotion (they're already being copy-pasted across explorations).

| name | files | likely category |
|---|---|---|
| `App` | 16 | ? |
| `Icon` | 10 | atom |
| `Button` | 10 | atom |
| `Input` | 10 | ? |
| `Badge` | 10 | atom |
| `KeyCap` | 10 | atom |
| `Divider` | 10 | atom |
| `StepDots` | 10 | ? |
| `TopNav` | 10 | ? |
| `ServerFooter` | 10 | molecule |
| `PageHeader` | 10 | molecule |
| `ProjectListBackdrop` | 10 | ? |
| `AppFrame` | 10 | template |
| `STAGE_DEFS` | 9 | ? |
| `StageContextStrip` | 8 | molecule |
| `ViewToggle` | 5 | ? |
| `RunAllDirtyPanel` | 5 | molecule |
| `BuildPackagePanel` | 5 | molecule |
| `DiskCostBanner` | 5 | ? |
| `Tab` | 5 | ? |
| `ProjectConfigureFrame` | 5 | template |
| `FlagChip` | 4 | ? |
| `Toggle` | 4 | atom |
| `CheckRow` | 4 | ? |
| `PageThumb` | 4 | ? |
| `BulkActionBar` | 4 | molecule |
| `PageRow` | 4 | ? |
| `StatTile` | 3 | ? |
| `ConfigureHeader` | 3 | molecule |
| `ConfigureTabs` | 3 | ? |
| `QualityBanner` | 3 | ? |
| `STAGE_FLAGS` | 3 | ? |
| `STAGE_FLAG_DETAIL` | 3 | ? |
| `FLAG_TONE` | 3 | ? |
| `FLAG_META` | 3 | ? |
| `RowFlagBadge` | 3 | ? |
| `STAGE_STATE_BY_INDEX` | 3 | ? |
| `StageJumpPopover` | 3 | template |
| `THUMB_SIZE_CFG` | 3 | ? |
| `ThumbFlagBadge` | 3 | ? |
| `ThumbGrid` | 3 | ? |
| `ThumbSizeToggle` | 3 | ? |
| `FilterToolbar` | 3 | molecule |
| `PAGE_TYPE_BADGE` | 3 | ? |
| `ROWS_BASE` | 3 | ? |
| `ROWS_FLAGGED_ONLY` | 3 | ? |
| `ROWS_BLURRY_ONLY` | 3 | ? |
| `TableHeader` | 3 | molecule |
| `TableFooter` | 3 | molecule |
| `SummaryStrip` | 3 | molecule |
| `SummaryCell` | 3 | ? |
| `VariationA` | 3 | ? |
| `VariationB` | 3 | ? |
| `ThemedFrame` | 3 | template |
| `BackendChip` | 2 | ? |
| `ModeCard` | 2 | molecule |
| `UNDECIDED_CASES` | 2 | ? |
| `MISMATCHED` | 2 | ? |
| `HYPHEN_RULES` | 2 | ? |
| `AUTO_JOINED_WORDS` | 2 | ? |
| `SCANNOS` | 2 | ? |
| `Pip` | 2 | ? |
| `Kbd` | 2 | ? |
| `LB` | 2 | ? |
| `PageBreak` | 2 | ? |
| `NgramLink` | 2 | ? |
| `Sparkline` | 2 | ? |
| `NgramsBlock` | 2 | ? |
| `ContextSnippet` | 2 | ? |
| `ProposalPills` | 2 | ? |
| `SectionHead` | 2 | ? |
| `ReportHeader` | 2 | molecule |
| `ReportStatTiles` | 2 | ? |
| `HyphenRow` | 2 | ? |
| `UndecidedListV1` | 2 | ? |
| `BookContextLine` | 2 | ? |
| `HyphenCard` | 2 | molecule |
| `UndecidedListV2` | 2 | ? |
| `QueueSidebar` | 2 | molecule |
| `QueueCase` | 2 | ? |
| `InstanceLine` | 2 | ? |
| `RuleChipInline` | 2 | ? |
| `AutoJoinedRow` | 2 | ? |
| `AutoJoinedList` | 2 | ? |
| `MismatchRow` | 2 | ? |
| `MismatchedReportV4` | 2 | ? |
| `PerBookFrame` | 2 | template |
| `HyphenV1` | 2 | ? |
| `HyphenV2` | 2 | ? |
| `PostBookNotesPreview` | 2 | ? |
| `HyphenV3` | 2 | ? |
| `HyphenV4` | 2 | ? |
| `HyphenV5` | 2 | ? |
| `SettingsPageFrame` | 2 | template |
| `RuleChip` | 2 | ? |
| `TagList` | 2 | ? |
| `HyphenLibraryTab` | 2 | ? |
| `ScannosTable` | 2 | ? |
| `ScannosLibraryTab` | 2 | ? |
| `SettingsHyphens` | 2 | ? |
| `SettingsScannos` | 2 | ? |
| `PAGE_STAGE_STATUS` | 2 | ? |
| `PWHeader` | 2 | molecule |
| `EditModeSelector` | 2 | ? |
| `ATTR_TYPES` | 2 | ? |
| `PageAttributesBar` | 2 | molecule |
| `AttrPill` | 2 | ? |
| `AttrEditorPopover` | 2 | ? |
| `MarkerOpt` | 2 | ? |
| `Seg2` | 2 | ? |
| `ArtifactPlate` | 2 | ? |
| `PaperRender` | 2 | ? |
| `SplitOverlay` | 2 | ? |
| `IllustOverlay` | 2 | ? |
| `WordBboxOverlay` | 2 | ? |
| `ArtifactViewer` | 2 | ? |
| `StageSelect` | 2 | template |
| `STAGE_CONTROL` | 2 | ? |
| `StageControlsPanel` | 2 | molecule |
| `GenericControls` | 2 | ? |
| `ControlField` | 2 | ? |
| `ThresholdControls` | 2 | ? |
| `CanvasMapControls` | 2 | template |
| `GrayscaleControls` | 2 | ? |
| `DeskewControls` | 2 | ? |
| `InitialCropControls` | 2 | ? |
| `OcrControls` | 2 | ? |
| `ZoneRow` | 2 | ? |
| `Slider` | 2 | ? |
| `TextReviewPane` | 2 | ? |
| `SAMPLE_ATTRS` | 2 | ? |
| `VariationPW` | 2 | ? |
| `CollapsedStageStrip` | 2 | molecule |
| `CropCompareViewer` | 2 | ? |
| `SourcePlate` | 2 | ? |
| `CroppedPlate` | 2 | ? |
| `OverlayPlate` | 2 | ? |
| `LABEL_TONES` | 2 | ? |
| `LayerToggle` | 2 | ? |
| `PAGE_BLOCKS` | 2 | ? |
| `LabelerCanvas` | 2 | template |
| `TYPE_CHIP_TONE` | 2 | ? |
| `HierarchyTreePanel` | 2 | molecule |
| `TreeRow` | 2 | ? |
| `BLOCK_TYPES_STRUCTURAL` | 2 | ? |
| `BLOCK_TYPES_CONTENT` | 2 | ? |
| `BlockTypePickerPanel` | 2 | molecule |
| `TypeGrid` | 2 | ? |
| `PageAttributesPanel` | 2 | molecule |
| `AttrField` | 2 | ? |
| `Drawer` | 2 | molecule |
| `OCR_LINES` | 2 | ? |
| `OcrTextPanel` | 2 | molecule |
| `LineBlockCards` | 2 | molecule |
| `LineBlockRows` | 2 | ? |
| `LineHeader` | 2 | molecule |
| `WordCard` | 2 | molecule |
| `WordRow` | 2 | ? |
| `ConfPip` | 2 | ? |
| `Stat` | 2 | ? |
| `Thumb` | 2 | ? |
