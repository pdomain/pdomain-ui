/**
 * SourceStepSettings stories — Source stage settings panel.
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { SourceStepSettings } from './SourceStepSettings.js';
import type { SourceSettings, PresetOption } from './SourceStepSettings.js';

const meta: Meta<typeof SourceStepSettings> = {
  title: 'Stages/Source/SourceStepSettings',
  component: SourceStepSettings,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SourceStepSettings>;

// ── Shared fixtures ────────────────────────────────────────────────────────

const SAMPLE_PRESETS: ReadonlyArray<PresetOption> = [
  { value: 'draft', label: 'Draft (fast)' },
  { value: 'standard', label: 'Standard' },
  { value: 'archive', label: 'Archive (slow + lossless)' },
];

const DEFAULT_SETTINGS: SourceSettings = {
  preset: null,
  thumbQuality: 'medium',
  workers: 4,
  autoConfirm: false,
};

// ── Stories ────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default',
  args: {
    settings: DEFAULT_SETTINGS,
    presets: SAMPLE_PRESETS,
    onChange: (next) => console.log('onChange:', next),
    onSavePreset: (name) => console.log('onSavePreset:', name),
    onRegenerate: () => console.log('onRegenerate'),
    'data-testid': 'source-step-settings',
  },
};

export const HighQualityMaxWorkers: Story = {
  name: 'HighQualityMaxWorkers',
  args: {
    settings: {
      preset: 'archive',
      thumbQuality: 'high',
      workers: 8,
      autoConfirm: true,
    },
    presets: SAMPLE_PRESETS,
    onChange: (next) => console.log('onChange:', next),
    onSavePreset: (name) => console.log('onSavePreset:', name),
    onRegenerate: () => console.log('onRegenerate'),
    'data-testid': 'source-step-settings',
  },
};

export const WithPresets: Story = {
  name: 'WithPresets (preset selected)',
  args: {
    settings: {
      preset: 'standard',
      thumbQuality: 'medium',
      workers: 2,
      autoConfirm: false,
    },
    presets: SAMPLE_PRESETS,
    onChange: (next) => console.log('onChange:', next),
    onSavePreset: (name) => console.log('onSavePreset:', name),
    'data-testid': 'source-step-settings',
  },
};

// SavingPreset — inline form open by default (interactive story).
function SavingPresetStory() {
  const [settings, setSettings] = React.useState<SourceSettings>(DEFAULT_SETTINGS);

  return (
    <div style={{ padding: '1.5rem', minWidth: '360px' }}>
      <p style={{ color: 'var(--ink-3)', marginTop: 0 }}>
        Click "Save as preset…" to open the inline form.
      </p>
      <SourceStepSettings
        settings={settings}
        presets={SAMPLE_PRESETS}
        onChange={setSettings}
        onSavePreset={(name) => {
          console.log('onSavePreset:', name);
          window.alert(`Saved preset: "${name}"`);
        }}
        onRegenerate={() => console.log('onRegenerate')}
        data-testid="source-step-settings"
      />
    </div>
  );
}

export const SavingPreset: Story = {
  name: 'SavingPreset (form open)',
  render: () => <SavingPresetStory />,
};

export const Minimal: Story = {
  name: 'Minimal (no onSavePreset/onRegenerate)',
  args: {
    settings: DEFAULT_SETTINGS,
    presets: [],
    onChange: (next) => console.log('onChange:', next),
    'data-testid': 'source-step-settings',
  },
};

// Interactive controlled story.
function InteractiveStory() {
  const [settings, setSettings] = React.useState<SourceSettings>(DEFAULT_SETTINGS);
  const [savedPresets, setSavedPresets] = React.useState<PresetOption[]>([...SAMPLE_PRESETS]);
  const [lastEvent, setLastEvent] = React.useState<string | null>(null);

  function handleSavePreset(name: string) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setSavedPresets((prev) => [...prev, { value: id, label: name }]);
    setSettings((s) => ({ ...s, preset: id }));
    setLastEvent(`Saved preset: "${name}"`);
  }

  function handleRegenerate() {
    setLastEvent('Re-generate triggered');
  }

  return (
    <div style={{ padding: '1.5rem', minWidth: '360px' }}>
      {lastEvent !== null && (
        <p style={{ color: 'var(--ink-3)', marginTop: 0 }}>
          Last event: <strong>{lastEvent}</strong>
        </p>
      )}
      <SourceStepSettings
        settings={settings}
        presets={savedPresets}
        onChange={setSettings}
        onSavePreset={handleSavePreset}
        onRegenerate={handleRegenerate}
        data-testid="source-step-settings"
      />
    </div>
  );
}

export const Interactive: Story = {
  name: 'Interactive',
  render: () => <InteractiveStory />,
};
