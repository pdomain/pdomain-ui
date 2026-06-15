import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { GuidancePanel } from './GuidancePanel.js';
import { PreferencePathRow } from './PreferencePathRow.js';
import { SettingSlider } from './SettingSlider.js';
import { SettingsAsyncSection } from './SettingsAsyncSection.js';
import { SettingsCard } from './SettingsCard.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue } from './SettingsValue.js';
import { StatusActionRow } from './StatusActionRow.js';

const meta: Meta = {
  title: 'Settings/SettingsKit',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function SettingsKitExample({
  state = 'ready',
  disabled = false,
  longText = false,
  compact = false,
}: {
  state?: 'ready' | 'loading' | 'saving' | 'error';
  disabled?: boolean;
  longText?: boolean;
  compact?: boolean;
}) {
  const [threshold, setThreshold] = React.useState(5);
  const [path, setPath] = React.useState('/var/tmp/pdomain/jobs');

  return (
    <div className="pdui-settings-kit-story">
      <SettingsAsyncSection
        title="OCR models"
        description="Manage model paths and runtime defaults."
        state={state}
        error={state === 'error' ? 'Model registry could not be loaded.' : undefined}
        actions={
          <Button type="button" size="sm" variant="secondary">
            Refresh
          </Button>
        }
      >
        <SettingsCard
          title="OCR"
          description={
            longText
              ? 'These preferences control language selection, cache placement, retry behavior, and advanced recognition thresholds for long-running OCR jobs.'
              : 'OCR settings'
          }
          badge={<SettingsValue tone="info">async</SettingsValue>}
          actions={
            <Button type="button" size="sm" variant="outline">
              Reset
            </Button>
          }
        >
          <SettingsRow
            label="Language"
            description="OCR language"
            value={<SettingsValue mono>eng</SettingsValue>}
            disabled={disabled}
          />
          <SettingsRow
            label="Threshold"
            description="Minimum recognition confidence"
            control={
              <SettingSlider
                value={threshold}
                onValueChange={setThreshold}
                min={0}
                max={10}
                step={1}
                unit="px"
                ariaLabel="Threshold"
                disabled={disabled}
              />
            }
          />
          <PreferencePathRow
            label="Jobs location"
            description="Where async job metadata is stored"
            path={path}
            onPathChange={setPath}
            onSave={() => undefined}
            onReset={() => {
              setPath('/var/tmp/pdomain/jobs');
            }}
            disabled={disabled}
          />
          <StatusActionRow
            label="Cache"
            description={compact ? undefined : 'Shared model cache status'}
            status={disabled ? 'Disabled' : 'Ready'}
            action={
              <Button type="button" size="sm" variant="secondary" disabled={disabled}>
                Refresh
              </Button>
            }
          />
        </SettingsCard>
      </SettingsAsyncSection>
      <GuidancePanel
        title="CUDA setup"
        tone="info"
        actions={
          <Button type="button" size="sm" variant="ghost">
            Open docs
          </Button>
        }
      >
        Install matching drivers before enabling GPU-backed OCR.
      </GuidancePanel>
    </div>
  );
}

export const Default: Story = {
  render: () => <SettingsKitExample />,
};

export const Loading: Story = {
  render: () => <SettingsKitExample state="loading" />,
};

export const Saving: Story = {
  render: () => <SettingsKitExample state="saving" />,
};

export const Error: Story = {
  render: () => <SettingsKitExample state="error" />,
};

export const Disabled: Story = {
  render: () => <SettingsKitExample disabled />,
};

export const LongText: Story = {
  render: () => <SettingsKitExample longText />,
};

export const CompactRows: Story = {
  render: () => <SettingsKitExample compact />,
};
