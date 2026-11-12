import type { Meta, StoryObj } from '@storybook/react';
import {
  // Original lucide exports
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Info,
  // New lucide exports (Phase 2 design-handoff additions)
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  CheckCircle,
  Copy,
  Download,
  File,
  FileText,
  Folder,
  GripVertical,
  HardDrive,
  Image,
  Link,
  Moon,
  Package,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  Sun,
  Upload,
  Wrench,
  // Bespoke icons
  LayerBlock,
  LayerPara,
  LayerLine,
  LayerWord,
  ModeSelect,
  ModeRebox,
  ModeErase,
  ModeCharFixer,
  MatchStatusExact,
  MatchStatusFuzzy,
  MatchStatusMismatch,
  // Dispatcher shim
  Icon,
  ICON_NAMES,
} from './index.js';
import type { IconName } from './Icon.js';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Icons/Catalogue',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Icon grid helper ──────────────────────────────────────────────────────────

/** Lucide re-exports and bespoke SVG icons both accept these grid props. */
type AnyIconComponent = React.ComponentType<{ size?: number; color?: string }>;

function IconGrid({
  title,
  icons,
}: {
  title: string;
  icons: { name: string; Icon: AnyIconComponent }[];
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: 'var(--ink-1)', fontSize: 'var(--text-sm)', marginBottom: '12px' }}>
        {title}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '12px',
        }}
      >
        {icons.map(({ name, Icon: IconComp }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              background: 'var(--bg-raised)',
              borderRadius: '6px',
            }}
          >
            <IconComp size={24} color="var(--ink-1)" />
            <span style={{ fontSize: '10px', color: 'var(--ink-3)', textAlign: 'center' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

const LUCIDE_ORIGINAL_ICONS = [
  { name: 'Check', Icon: Check },
  { name: 'X', Icon: X },
  { name: 'ChevronDown', Icon: ChevronDown },
  { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'ChevronLeft', Icon: ChevronLeft },
  { name: 'ChevronRight', Icon: ChevronRight },
  { name: 'Search', Icon: Search },
  { name: 'Settings', Icon: Settings },
  { name: 'Menu', Icon: Menu },
  { name: 'MoreHorizontal', Icon: MoreHorizontal },
  { name: 'MoreVertical', Icon: MoreVertical },
  { name: 'Plus', Icon: Plus },
  { name: 'Minus', Icon: Minus },
  { name: 'Edit', Icon: Edit },
  { name: 'Trash2', Icon: Trash2 },
  { name: 'Eye', Icon: Eye },
  { name: 'EyeOff', Icon: EyeOff },
  { name: 'Loader2', Icon: Loader2 },
  { name: 'AlertCircle', Icon: AlertCircle },
  { name: 'Info', Icon: Info },
];

const LUCIDE_NEW_ICONS = [
  { name: 'AlertTriangle (alert)', Icon: AlertTriangle },
  { name: 'Archive (archive)', Icon: Archive },
  { name: 'ArrowDown (arrowDown)', Icon: ArrowDown },
  { name: 'ArrowLeftRight (swap)', Icon: ArrowLeftRight },
  { name: 'ArrowRight (arrowR)', Icon: ArrowRight },
  { name: 'ArrowUp (arrowUp)', Icon: ArrowUp },
  { name: 'ArrowUpDown (arrowUpDown)', Icon: ArrowUpDown },
  { name: 'Bell (bell)', Icon: Bell },
  { name: 'CheckCircle (checkCircle)', Icon: CheckCircle },
  { name: 'Copy (copy)', Icon: Copy },
  { name: 'Download (download)', Icon: Download },
  { name: 'File (file)', Icon: File },
  { name: 'FileText (fileText)', Icon: FileText },
  { name: 'Folder (folder)', Icon: Folder },
  { name: 'GripVertical (grip)', Icon: GripVertical },
  { name: 'HardDrive (hardDrive)', Icon: HardDrive },
  { name: 'Image (image)', Icon: Image },
  { name: 'Link (link)', Icon: Link },
  { name: 'Moon (moon)', Icon: Moon },
  { name: 'Package (package)', Icon: Package },
  { name: 'Pause (pause)', Icon: Pause },
  { name: 'Play (play)', Icon: Play },
  { name: 'RefreshCw (refresh)', Icon: RefreshCw },
  { name: 'Scissors (scissors)', Icon: Scissors },
  { name: 'Sparkles (sparkles)', Icon: Sparkles },
  { name: 'Sun (sun)', Icon: Sun },
  { name: 'Upload (upload)', Icon: Upload },
  { name: 'Wrench (wrench)', Icon: Wrench },
];

const BESPOKE_ICONS = [
  { name: 'LayerBlock', Icon: LayerBlock },
  { name: 'LayerPara', Icon: LayerPara },
  { name: 'LayerLine', Icon: LayerLine },
  { name: 'LayerWord', Icon: LayerWord },
  { name: 'ModeSelect', Icon: ModeSelect },
  { name: 'ModeRebox', Icon: ModeRebox },
  { name: 'ModeErase', Icon: ModeErase },
  { name: 'ModeCharFixer', Icon: ModeCharFixer },
  { name: 'MatchStatusExact', Icon: MatchStatusExact },
  { name: 'MatchStatusFuzzy', Icon: MatchStatusFuzzy },
  { name: 'MatchStatusMismatch', Icon: MatchStatusMismatch },
];

/** Full catalogue of all curated lucide icons and bespoke OCR-domain icons. */
export const AllIcons: Story = {
  render: () => (
    <div>
      <IconGrid title="Lucide icons (original curated subset)" icons={LUCIDE_ORIGINAL_ICONS} />
      <IconGrid
        title="Lucide icons (Phase 2 design-handoff additions — 28 new)"
        icons={LUCIDE_NEW_ICONS}
      />
      <IconGrid title="Bespoke OCR-domain icons" icons={BESPOKE_ICONS} />
    </div>
  ),
};

/** Size variations for a sample icon. */
export const SizeVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <Settings size={16} color="var(--ink-1)" />
        <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>16px</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Settings size={24} color="var(--ink-1)" />
        <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>24px</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Settings size={32} color="var(--ink-1)" />
        <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>32px</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Settings size={48} color="var(--ink-1)" />
        <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>48px</div>
      </div>
    </div>
  ),
};

/**
 * Demonstrates the <Icon name> dispatcher shim (OQ-1).
 * All 40 design-system icon names rendered via the dispatcher.
 */
export const IconDispatcher: Story = {
  render: () => (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: 'var(--ink-1)', fontSize: 'var(--text-sm)', marginBottom: '12px' }}>
        Icon dispatcher — all 40 design names
      </h3>
      <p style={{ color: 'var(--ink-3)', fontSize: '12px', marginBottom: '16px' }}>
        Usage:{' '}
        <code style={{ background: 'var(--bg-raised)', padding: '2px 6px', borderRadius: '4px' }}>
          {'<Icon name="check" size={16} />'}
        </code>
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '12px',
        }}
      >
        {ICON_NAMES.map((name: IconName) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              background: 'var(--bg-raised)',
              borderRadius: '6px',
            }}
          >
            <Icon name={name} size={24} color="var(--ink-1)" />
            <span style={{ fontSize: '10px', color: 'var(--ink-3)', textAlign: 'center' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
