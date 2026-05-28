import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CropStepSettings, CROP_SETTINGS_DEFAULT, type CropSettings } from './CropStepSettings.js';

function makeSettings(overrides?: Partial<CropSettings>): CropSettings {
  return { ...CROP_SETTINGS_DEFAULT, ...overrides };
}

describe('CropStepSettings', () => {
  it('renders all 4 strategy radio labels', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Edge-detect')).toBeInTheDocument();
    expect(screen.getByLabelText('ML model')).toBeInTheDocument();
    expect(screen.getByLabelText('Manual margins')).toBeInTheDocument();
    expect(screen.getByLabelText('From source bbox')).toBeInTheDocument();
  });

  it('strategy radios have correct testids', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} />);

    expect(screen.getByTestId('crop-strategy-edgeDetect')).toBeInTheDocument();
    expect(screen.getByTestId('crop-strategy-mlModel')).toBeInTheDocument();
    expect(screen.getByTestId('crop-strategy-manual')).toBeInTheDocument();
    expect(screen.getByTestId('crop-strategy-fromSource')).toBeInTheDocument();
  });

  it('correct strategy radio is checked based on settings', () => {
    render(
      <CropStepSettings settings={makeSettings({ strategy: 'mlModel' })} onChange={vi.fn()} />,
    );

    const mlRadio = screen.getByTestId('crop-strategy-mlModel');
    const edgeRadio = screen.getByTestId('crop-strategy-edgeDetect');
    expect(mlRadio).toBeChecked();
    expect(edgeRadio).not.toBeChecked();
  });

  it('selecting a strategy fires onChange with updated strategy', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ strategy: 'edgeDetect' });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('crop-strategy-manual'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      strategy: 'manual',
    });
  });

  it('selecting fromSource strategy fires onChange', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ strategy: 'edgeDetect' });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('crop-strategy-fromSource'));

    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      strategy: 'fromSource',
    });
  });

  it('margin slack slider change fires onChange with full settings', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ marginSlackPct: 5 });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    const slider = screen.getByRole('slider', { name: 'Margin slack' });
    fireEvent.change(slider, { target: { value: '12' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      marginSlackPct: 12,
    });
  });

  it('min page area slider change fires onChange with full settings', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ minPageArea: 0.3 });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    const slider = screen.getByRole('slider', { name: 'Min page area' });
    fireEvent.change(slider, { target: { value: '0.6' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      minPageArea: 0.6,
    });
  });

  it('symmetry guard toggle fires onChange with updated symmetryGuard', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ symmetryGuard: true });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    // Radix Switch button role
    const toggle = screen.getByRole('switch', { name: 'Symmetry guard' });
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining<Partial<CropSettings>>({
        symmetryGuard: false,
        strategy: settings.strategy,
        marginSlackPct: settings.marginSlackPct,
      }),
    );
  });

  it('auto-accept toggle fires onChange with updated autoAccept', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ autoAccept: false });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Auto-accept on green' });
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining<Partial<CropSettings>>({
        autoAccept: true,
        marginSlackPct: settings.marginSlackPct,
      }),
    );
  });

  it('redeskew toggle fires onChange with updated redeskewAfterCrop', () => {
    const onChange = vi.fn();
    const settings = makeSettings({ redeskewAfterCrop: true });
    render(<CropStepSettings settings={settings} onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Re-deskew after crop' });
    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining<Partial<CropSettings>>({
        redeskewAfterCrop: false,
        strategy: settings.strategy,
      }),
    );
  });

  it('stale warning does NOT render when stale is false', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} stale={false} />);

    expect(screen.queryByText(/Settings have changed/i)).not.toBeInTheDocument();
  });

  it('stale warning does NOT render when stale is undefined', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} />);

    expect(screen.queryByText(/Settings have changed/i)).not.toBeInTheDocument();
  });

  it('stale warning renders when stale=true', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} stale={true} />);

    expect(screen.getByText(/Settings have changed — re-run to apply/i)).toBeInTheDocument();
  });

  it('Re-run button renders when stale=true and onRerun is provided', () => {
    render(
      <CropStepSettings
        settings={makeSettings()}
        onChange={vi.fn()}
        stale={true}
        onRerun={vi.fn()}
      />,
    );

    expect(screen.getByTestId('crop-step-settings-rerun')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Re-run now/i })).toBeInTheDocument();
  });

  it('Re-run button fires onRerun when clicked', () => {
    const onRerun = vi.fn();
    render(
      <CropStepSettings
        settings={makeSettings()}
        onChange={vi.fn()}
        stale={true}
        onRerun={onRerun}
      />,
    );

    fireEvent.click(screen.getByTestId('crop-step-settings-rerun'));
    expect(onRerun).toHaveBeenCalledTimes(1);
  });

  it('Re-run button does not render when stale=true but onRerun is absent', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} stale={true} />);

    // Banner still shows but no Re-run button
    expect(screen.queryByTestId('crop-step-settings-rerun')).not.toBeInTheDocument();
  });

  it('data-testid is forwarded to the root element', () => {
    render(
      <CropStepSettings
        settings={makeSettings()}
        onChange={vi.fn()}
        data-testid="my-crop-settings"
      />,
    );

    expect(screen.getByTestId('my-crop-settings')).toBeInTheDocument();
  });

  it('displays margin slack value as percentage', () => {
    render(<CropStepSettings settings={makeSettings({ marginSlackPct: 8 })} onChange={vi.fn()} />);

    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('displays min page area as percentage (30% for 0.3)', () => {
    render(<CropStepSettings settings={makeSettings({ minPageArea: 0.3 })} onChange={vi.fn()} />);

    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});

// ── TDD: testid fallback (WS7) ────────────────────────────────────────────────

describe('CropStepSettings — testid fallback', () => {
  it('uses a default testid "crop-step-settings" when none provided', () => {
    render(<CropStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByTestId('crop-step-settings')).toBeInTheDocument();
  });

  it('custom testid overrides the default', () => {
    render(
      <CropStepSettings
        settings={makeSettings()}
        onChange={vi.fn()}
        data-testid="my-crop-settings"
      />,
    );
    expect(screen.getByTestId('my-crop-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('crop-step-settings')).not.toBeInTheDocument();
  });
});
