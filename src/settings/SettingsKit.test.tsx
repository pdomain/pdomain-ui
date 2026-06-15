import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GuidancePanel } from './GuidancePanel.js';
import { PreferencePathRow } from './PreferencePathRow.js';
import { SettingSlider } from './SettingSlider.js';
import { SettingsAsyncSection } from './SettingsAsyncSection.js';
import { SettingsCard } from './SettingsCard.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue } from './SettingsValue.js';
import { StatusActionRow } from './StatusActionRow.js';

describe('settings kit', () => {
  it('renders settings card, row and value', () => {
    render(
      <SettingsCard
        title="OCR"
        description="OCR settings"
        actions={<button type="button">Reset</button>}
      >
        <SettingsRow
          label="Language"
          description="OCR language"
          value={<SettingsValue>eng</SettingsValue>}
        />
      </SettingsCard>,
    );

    expect(screen.getByText('OCR')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('eng')).toHaveAttribute('data-tone', 'neutral');
  });

  it('changes slider values and clamps range', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SettingSlider
        value={5}
        onValueChange={onValueChange}
        min={0}
        max={10}
        step={1}
        unit="px"
        ariaLabel="Threshold"
      />,
    );

    const slider = screen.getByRole('slider', { name: 'Threshold' });
    expect(screen.getByText('5 px')).toBeInTheDocument();
    await user.type(slider, '{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(6);
  });

  it('renders async loading, saving and error states', () => {
    const { rerender } = render(
      <SettingsAsyncSection title="Models" state="loading">
        Ready body
      </SettingsAsyncSection>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    rerender(
      <SettingsAsyncSection title="Models" state="saving">
        Ready body
      </SettingsAsyncSection>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saving');

    rerender(
      <SettingsAsyncSection title="Models" state="error" error="Failed">
        Ready body
      </SettingsAsyncSection>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('calls path row save and reset callbacks', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onReset = vi.fn();
    render(
      <PreferencePathRow
        label="Jobs location"
        path="/tmp/jobs"
        onPathChange={() => undefined}
        onSave={onSave}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save Jobs location' }));
    await user.click(screen.getByRole('button', { name: 'Reset Jobs location' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('renders status action and guidance panels', () => {
    render(
      <>
        <StatusActionRow
          label="Cache"
          status="Ready"
          action={<button type="button">Refresh</button>}
        />
        <GuidancePanel title="CUDA setup" tone="info">
          Install matching drivers.
        </GuidancePanel>
      </>,
    );

    expect(screen.getByText('Cache')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByText('CUDA setup')).toBeInTheDocument();
  });
});
