/**
 * <Icon name> dispatcher shim (OQ-1 resolution).
 *
 * Maps design-system icon name keys (Table 3 of design-handoff-port-plan)
 * to the corresponding named lucide or bespoke exports.  Lets ported stage
 * code use the design API verbatim (`<Icon name="check" size={14}/>`) while
 * individual named exports remain available for direct use.
 *
 * Name mapping notes:
 *   - "alert"   → AlertTriangle  (lucide ^0.400.0, OQ-7)
 *   - "swap"    → ArrowLeftRight (OQ-8)
 *   - "loader"  → Loader2
 *   - "trash"   → Trash2
 *   - "moreH"   → MoreHorizontal
 *   - "grip"    → GripVertical
 *   - "refresh" → RefreshCw
 *   - "chevR"   → ChevronRight
 *   - "chevL"   → ChevronLeft
 *   - "chevD"   → ChevronDown
 *   - "chevU"   → ChevronUp
 *   - "arrowR"  → ArrowRight
 *   - "arrowUp" → ArrowUp
 *   - "arrowDown" → ArrowDown
 *   - "arrowUpDown" → ArrowUpDown
 */
import React from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Eye,
  File,
  FileText,
  Folder,
  GripVertical,
  HardDrive,
  Image,
  Info,
  Link,
  Loader2,
  Minus,
  Moon,
  MoreHorizontal,
  Package,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wrench,
  X,
} from './lucide.js';

// ---------------------------------------------------------------------------
// Name → component map
// ---------------------------------------------------------------------------

const ICON_MAP = {
  upload: Upload,
  folder: Folder,
  file: File,
  image: Image,
  archive: Archive,
  link: Link,
  hardDrive: HardDrive,
  check: Check,
  checkCircle: CheckCircle,
  x: X,
  alert: AlertTriangle,
  info: Info,
  chevR: ChevronRight,
  chevL: ChevronLeft,
  chevD: ChevronDown,
  chevU: ChevronUp,
  arrowR: ArrowRight,
  search: Search,
  bell: Bell,
  plus: Plus,
  minus: Minus,
  moon: Moon,
  sun: Sun,
  grip: GripVertical,
  pause: Pause,
  download: Download,
  wrench: Wrench,
  refresh: RefreshCw,
  eye: Eye,
  loader: Loader2,
  fileText: FileText,
  play: Play,
  package: Package,
  moreH: MoreHorizontal,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowUpDown: ArrowUpDown,
  scissors: Scissors,
  trash: Trash2,
  sparkles: Sparkles,
  swap: ArrowLeftRight,
  copy: Copy,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, React.ComponentType<any>>;

/** All valid design icon name keys. */
export const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

/** Union of all valid design icon name strings. */
export type IconName = keyof typeof ICON_MAP;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface IconProps {
  /** Design-system icon name (Table 3 of design-handoff-port-plan). */
  name: IconName;
  /** Icon size in pixels (width + height). Default: 24. */
  size?: number;
  /** CSS class to forward to the underlying SVG element. */
  className?: string;
  /** Stroke color. Inherits `currentColor` by default. */
  color?: string;
  /** Additional props forwarded to the underlying lucide component. */
  strokeWidth?: number;
  /**
   * Accessible label for the icon.
   *
   * When provided, the icon is announced to screen readers with this label
   * and `aria-hidden` is NOT set.
   *
   * When absent (default), the icon is decorative: `aria-hidden="true"` is
   * applied so screen readers skip it entirely (audit WS6 / P2).
   */
  'aria-label'?: string;
}

/**
 * Name-dispatching icon component.
 *
 * Renders the lucide icon corresponding to the given design-system `name`.
 * All 40 names from the design-handoff Table 3 are supported.
 *
 * Icons are decorative by default (`aria-hidden="true"`). Pass `aria-label`
 * to make an icon meaningful to screen readers.
 *
 * @example
 *   <Icon name="check" size={16} />
 *   <Icon name="alert" size={20} color="var(--mismatch)" aria-label="Warning" />
 */
export function Icon({
  name,
  size = 24,
  className,
  color,
  strokeWidth,
  'aria-label': ariaLabel,
}: IconProps): React.ReactElement {
  const LucideIcon = ICON_MAP[name];
  const a11y = ariaLabel
    ? ({ 'aria-label': ariaLabel } as const)
    : ({ 'aria-hidden': true } as const);
  return (
    <LucideIcon
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      {...a11y}
    />
  );
}
