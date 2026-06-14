// Non-Radix primitives
export { BulkActionBar } from './BulkActionBar.js';
export type { BulkActionBarProps, BulkActionBarVariant } from './BulkActionBar.js';

export { AttributesPanel } from './AttributesPanel.js';
export type {
  AttributesPanelProps,
  AttributesPanelProject,
  AttributesPanelSectionKey,
} from './AttributesPanel.js';

export { Button } from './Button.js';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.js';

export { ButtonGroup } from './ButtonGroup.js';
export type { ButtonGroupProps } from './ButtonGroup.js';

export { IconButton } from './IconButton.js';
export type { IconButtonProps, IconButtonSize } from './IconButton.js';

export { Input } from './Input.js';
export type { InputProps, InputSize } from './Input.js';

export { Textarea } from './Textarea.js';
export type { TextareaProps } from './Textarea.js';

export { Badge } from './Badge.js';
export type { BadgeProps, BadgeVariant } from './Badge.js';

export { Chip } from './Chip.js';
export type { ChipProps, ChipVariant } from './Chip.js';

export { TriStateChip } from './TriStateChip.js';
export type { TriStateChipProps, TriStateValue } from './TriStateChip.js';

export { StatusPip } from './StatusPip.js';
export type { StatusPipProps, StatusPipStatus } from './StatusPip.js';

export { CheckIcon } from './CheckIcon.js';
export type { CheckIconProps, CheckIconState } from './CheckIcon.js';

export { JobStatusPip } from './JobStatusPip.js';
export type { JobStatusPipProps, JobState } from './JobStatusPip.js';

export { KeyCap } from './KeyCap.js';
export type { KeyCapProps } from './KeyCap.js';

export { Card } from './Card.js';
export type { CardProps } from './Card.js';

export { Separator } from './Separator.js';
export type { SeparatorProps, SeparatorOrientation } from './Separator.js';

export { Segmented } from './Segmented.js';
export type { SegmentedProps, SegmentedOption, SegmentedSize } from './Segmented.js';

export { Progress } from './Progress.js';
export type { ProgressProps, ProgressStatus } from './Progress.js';

export { StepDots } from './StepDots.js';
export type { StepDotsProps, StepDotsState } from './StepDots.js';

// Radix-layered primitives
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog.js';

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './AlertDialog.js';

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose } from './Popover.js';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip.js';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu.js';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './Select.js';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs.js';

export { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion.js';

// Form helpers
export { Field } from './Field.js';
export type { FieldProps } from './Field.js';

export { FieldContext, useFieldContext } from './FieldContext.js';
export type { FieldContextValue } from './FieldContext.js';

export { FieldRow } from './FieldRow.js';
export type { FieldRowProps } from './FieldRow.js';

export { ColorField } from './ColorField.js';
export type { ColorFieldProps } from './ColorField.js';

// cn utility
export { cn } from './cn.js';

// Layout components
export { PageHeader } from './PageHeader.js';
export type { PageHeaderProps } from './PageHeader.js';

export { PageSplitView } from './PageSplitView.js';
export type { PageSplitViewProps } from './PageSplitView.js';

// Composite dialog shells
export { BaseJobConfigDialog } from './BaseJobConfigDialog.js';
export type { BaseJobConfigDialogProps, BaseJobConfig } from './BaseJobConfigDialog.js';

// Kanban board family
// Note: the kanban-internal drag chip is re-exported as KanbanPageChip to avoid
// collision with the generic PageChip navigation primitive below.
export { KanbanBoard, KanbanColumn, PageChip as KanbanPageChip } from './kanban/index.js';

// Cross-stage molecules (phase 2, #344 batch 1)
export { StatTile } from './StatTile.js';
export type { StatTileProps, StatTileTone } from './StatTile.js';

export { FlagChip } from './FlagChip.js';
export type { FlagChipProps, FlagKind } from './FlagChip.js';

export { RowFlagBadge } from './RowFlagBadge.js';
export type { RowFlagBadgeProps } from './RowFlagBadge.js';

export { Toggle } from './Toggle.js';
export type { ToggleProps } from './Toggle.js';

export { ToggleBadge } from './ToggleBadge.js';
export type { ToggleBadgeProps } from './ToggleBadge.js';

export { DiskCostBanner } from './DiskCostBanner.js';
export type { DiskCostBannerProps } from './DiskCostBanner.js';

export { ViewToggle } from './ViewToggle.js';
export type { ViewToggleProps, ViewMode } from './ViewToggle.js';

export { QualityBanner } from './QualityBanner.js';
export type { QualityBannerProps, QualityBannerFlag } from './QualityBanner.js';

// Cross-stage molecules (phase 2, #344 batch 2)
export { SummaryCell } from './SummaryCell.js';
export type { SummaryCellProps, SummaryCellTone } from './SummaryCell.js';

export { SummaryStrip } from './SummaryStrip.js';
export type { SummaryStripProps, SummaryStripCell } from './SummaryStrip.js';

export { ThumbFlagBadge } from './ThumbFlagBadge.js';
export type { ThumbFlagBadgeProps } from './ThumbFlagBadge.js';

export { ThumbSizeToggle, THUMB_SIZES } from './ThumbSizeToggle.js';
export type { ThumbSizeToggleProps, ThumbSizeOption } from './ThumbSizeToggle.js';

export { FilterToolbar } from './FilterToolbar.js';
export type { FilterToolbarProps } from './FilterToolbar.js';

export { TableHeader } from './TableHeader.js';
export type { TableHeaderProps, TableColumnDef, SortDir } from './TableHeader.js';

export { TableFooter } from './TableFooter.js';
export type { TableFooterProps } from './TableFooter.js';

// Cross-stage molecules (phase 2, #344 batch 3)
export { ConfigureHeader } from './ConfigureHeader.js';
export type { ConfigureHeaderProps, ConfigureHeaderTrailItem } from './ConfigureHeader.js';

export { ConfigureTabs } from './ConfigureTabs.js';
export type { ConfigureTabsProps, ConfigureTabItem } from './ConfigureTabs.js';

export { RunAllDirtyPanel } from './RunAllDirtyPanel.js';
export type { RunAllDirtyPanelProps } from './RunAllDirtyPanel.js';

export { BuildPackagePanel } from './BuildPackagePanel.js';
export type { BuildPackagePanelProps } from './BuildPackagePanel.js';

export { ThumbGrid } from './ThumbGrid.js';
export type { ThumbGridProps } from './ThumbGrid.js';

export type {
  KanbanBoardProps,
  KanbanColumnProps,
  PageChipProps as KanbanPageChipProps,
  KanbanColumnDef,
  KanbanItemDef,
  KanbanMoveEvent,
  KanbanSelectEvent,
  KanbanColumnHeaderProps,
  KanbanChipRenderProps,
} from './kanban/index.js';

// Phase 2 M2 atom promotions
export { BackendChip } from './BackendChip.js';
export type { BackendChipProps, BackendValue } from './BackendChip.js';
// Standalone navigation chip (Phase 2 M2 atom promotion)
export { PageChip } from './PageChip.js';
export type { PageChipProps } from './PageChip.js';

// Slot-based stage primitives (Phase 2 promotion)
export { Banner } from './Banner.js';
export type { BannerProps, BannerTone } from './Banner.js';
export { StageToolbar } from './StageToolbar.js';
export type { StageToolbarProps } from './StageToolbar.js';
export { Thumbnail } from './Thumbnail.js';
export type { ThumbnailProps, ThumbnailDensity } from './Thumbnail.js';

// Keyboard shortcut cheatsheet dialog
export { ShortcutsCheatsheet } from './ShortcutsCheatsheet.js';
export type { ShortcutsCheatsheetProps } from './ShortcutsCheatsheet.js';

// Right-side utility dock primitive
export { SlideOverPanel } from './SlideOverPanel.js';
export type { SlideOverPanelProps } from './SlideOverPanel.js';

export { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
export type { ShortcutsCheatsheetBodyProps } from './ShortcutsCheatsheetBody.js';
