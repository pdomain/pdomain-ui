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
import type {
  GuidancePanelTone,
  SettingsAsyncSectionState,
  SettingsRowControlProps,
  SettingsValueTone,
} from './index.js';

const exportedTone: SettingsValueTone = 'info';
const exportedState: SettingsAsyncSectionState = 'saving';
const exportedGuidanceTone: GuidancePanelTone = 'warning';

function TypeExportProbe(props: SettingsRowControlProps) {
  if (props.invalid) return null;
  return null;
}

describe('settings kit', () => {
  it('keeps supporting union types exported', () => {
    expect([exportedTone, exportedState, exportedGuidanceTone]).toEqual([
      'info',
      'saving',
      'warning',
    ]);
    expect(TypeExportProbe).toBeTypeOf('function');
  });

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
    expect(slider).toHaveAttribute('aria-valuetext', '5 px');
    await user.type(slider, '{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(6);
  });

  it('clamps slider values at min and max and ignores disabled input', async () => {
    const user = userEvent.setup();
    const onMaxValueChange = vi.fn();
    const { rerender } = render(
      <SettingSlider
        value={12}
        onValueChange={onMaxValueChange}
        min={0}
        max={10}
        step={1}
        unit="px"
        ariaLabel="Max threshold"
      />,
    );

    const maxSlider = screen.getByRole('slider', { name: 'Max threshold' });
    expect(maxSlider).toHaveValue('10');
    expect(screen.getByText('10 px')).toBeInTheDocument();
    await user.type(maxSlider, '{ArrowRight}');
    expect(onMaxValueChange).toHaveBeenCalledWith(10);

    const onMinValueChange = vi.fn();
    rerender(
      <SettingSlider
        value={-4}
        onValueChange={onMinValueChange}
        min={0}
        max={10}
        step={1}
        ariaLabel="Min threshold"
      />,
    );

    const minSlider = screen.getByRole('slider', { name: 'Min threshold' });
    expect(minSlider).toHaveValue('0');
    await user.type(minSlider, '{ArrowLeft}');
    expect(onMinValueChange).toHaveBeenCalledWith(0);

    const onDisabledValueChange = vi.fn();
    rerender(
      <SettingSlider
        value={5}
        onValueChange={onDisabledValueChange}
        min={0}
        max={10}
        step={1}
        ariaLabel="Disabled threshold"
        disabled
      />,
    );

    await user.type(screen.getByRole('slider', { name: 'Disabled threshold' }), '{ArrowRight}');
    expect(onDisabledValueChange).not.toHaveBeenCalled();
  });

  it('binds row label, help and error IDs to cloned controls', () => {
    render(
      <SettingsRow
        label="Language"
        description="OCR language"
        error="Required"
        control={<input type="text" />}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Language' });
    expect(input).toHaveAccessibleDescription('OCR language Required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes row accessibility props through the control render function', () => {
    render(
      <SettingsRow
        label="Workers"
        description="Parallel OCR workers"
        error="Too many"
        disabled
        control={({ id, labelledBy, describedBy, invalid, disabled }) => (
          <input
            id={id}
            type="number"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={disabled}
          />
        )}
      />,
    );

    const input = screen.getByRole('spinbutton', { name: 'Workers' });
    expect(input).toHaveAccessibleDescription('Parallel OCR workers Too many');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeDisabled();
  });

  it('disables single cloned row controls and actions', async () => {
    const user = userEvent.setup();
    const onControlClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <SettingsRow
        label="Cache"
        disabled
        control={
          <button type="button" onClick={onControlClick}>
            Toggle cache
          </button>
        }
        actions={
          <button type="button" onClick={onActionClick}>
            Refresh
          </button>
        }
      />,
    );

    const control = screen.getByRole('button', { name: 'Cache' });
    const action = screen.getByRole('button', { name: 'Refresh' });
    expect(control).toBeDisabled();
    expect(action).toBeDisabled();
    await user.click(control);
    await user.click(action);
    expect(onControlClick).not.toHaveBeenCalled();
    expect(onActionClick).not.toHaveBeenCalled();
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

  it('binds path input to row help and error and disables owned actions', async () => {
    const user = userEvent.setup();
    const onPathChange = vi.fn();
    const onSave = vi.fn();
    const onReset = vi.fn();

    render(
      <PreferencePathRow
        label="Jobs location"
        description="Where async job metadata is stored"
        path="/tmp/jobs"
        onPathChange={onPathChange}
        onSave={onSave}
        onReset={onReset}
        error="Path is not writable"
        disabled
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Jobs location' });
    expect(input).toHaveAccessibleDescription(
      'Where async job metadata is stored Path is not writable',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Save Jobs location' }));
    await user.click(screen.getByRole('button', { name: 'Reset Jobs location' }));
    expect(onPathChange).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
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
