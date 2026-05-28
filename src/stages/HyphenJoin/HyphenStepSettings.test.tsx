import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  HyphenStepSettings,
  HYPHEN_STEP_SETTINGS_DEFAULT,
  type HyphenSettings,
} from './HyphenStepSettings.js';
import {
  HYPHEN_STEP_SETTINGS,
  HYPHEN_STEP_SETTINGS_CACHE_SIZE,
  HYPHEN_STEP_SETTINGS_CACHE_TTL,
  HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD,
} from '../../testids/index.js';

function makeSettings(overrides?: Partial<HyphenSettings>): HyphenSettings {
  return {
    rules: [...HYPHEN_STEP_SETTINGS_DEFAULT.rules],
    ngramCache: { ...HYPHEN_STEP_SETTINGS_DEFAULT.ngramCache },
    thresholds: { ...HYPHEN_STEP_SETTINGS_DEFAULT.thresholds },
    ...overrides,
  };
}

// ─── Root + testids ───────────────────────────────────────────────────────────

describe('HyphenStepSettings — root and testids', () => {
  it('renders root with default testid', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByTestId(HYPHEN_STEP_SETTINGS)).toBeInTheDocument();
  });

  it('forwards custom data-testid to root element', () => {
    render(
      <HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} data-testid="custom-id" />,
    );
    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });

  it('renders cache-size input with correct testid', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE)).toBeInTheDocument();
  });

  it('renders cache-ttl input with correct testid', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_TTL)).toBeInTheDocument();
  });

  it('renders auto-flag-threshold input with correct testid', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD)).toBeInTheDocument();
  });
});

// ─── Rule library section ─────────────────────────────────────────────────────

describe('HyphenStepSettings — rule library section', () => {
  it('renders "Rule library" heading', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getByText('Rule library')).toBeInTheDocument();
  });

  it('renders a toggle for each rule', () => {
    const settings = makeSettings({
      rules: [
        { id: 'r1', label: 'Always-join beginnings', enabled: true },
        { id: 'r2', label: 'Always-join endings', enabled: false },
        { id: 'r3', label: 'Always-join words', enabled: true },
      ],
    });
    render(<HyphenStepSettings settings={settings} onChange={vi.fn()} />);

    // Radix Switch renders role="switch" with accessible name from label
    expect(screen.getByRole('switch', { name: 'Always-join beginnings' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Always-join endings' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Always-join words' })).toBeInTheDocument();
  });

  it('rule toggle reflects enabled state', () => {
    const settings = makeSettings({
      rules: [
        { id: 'r1', label: 'Always-join beginnings', enabled: true },
        { id: 'r2', label: 'Always-join endings', enabled: false },
      ],
    });
    render(<HyphenStepSettings settings={settings} onChange={vi.fn()} />);

    expect(screen.getByRole('switch', { name: 'Always-join beginnings' })).toHaveAttribute(
      'data-state',
      'checked',
    );
    expect(screen.getByRole('switch', { name: 'Always-join endings' })).toHaveAttribute(
      'data-state',
      'unchecked',
    );
  });

  it('toggling a rule fires onChange with enabled flipped', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({
      rules: [
        { id: 'r1', label: 'Always-join beginnings', enabled: true },
        { id: 'r2', label: 'Always-join endings', enabled: false },
      ],
    });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Always-join beginnings' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    const r1 = next.rules.find((r) => r.id === 'r1');
    expect(r1?.enabled).toBe(false);
  });

  it('toggling a disabled rule fires onChange with enabled flipped to true', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({
      rules: [
        { id: 'r1', label: 'Always-join beginnings', enabled: true },
        { id: 'r2', label: 'Always-join endings', enabled: false },
      ],
    });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Always-join endings' }));

    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    const r2 = next.rules.find((r) => r.id === 'r2');
    expect(r2?.enabled).toBe(true);
  });

  it('toggling one rule preserves other rules unchanged', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({
      rules: [
        { id: 'r1', label: 'Always-join beginnings', enabled: true },
        { id: 'r2', label: 'Always-join endings', enabled: false },
        { id: 'r3', label: 'Always-join words', enabled: true },
      ],
    });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Always-join beginnings' }));

    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    const r2 = next.rules.find((r) => r.id === 'r2');
    const r3 = next.rules.find((r) => r.id === 'r3');
    expect(r2?.enabled).toBe(false); // unchanged
    expect(r3?.enabled).toBe(true); // unchanged
  });
});

// ─── N-gram cache section ─────────────────────────────────────────────────────

describe('HyphenStepSettings — n-gram cache section', () => {
  it('renders "N-gram cache" heading', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    // Use getAllByText because the sub-description also contains "n-gram cache"
    expect(screen.getAllByText(/n-gram cache/i).length).toBeGreaterThan(0);
  });

  it('cache-size input shows current sizeMB value', () => {
    render(
      <HyphenStepSettings
        settings={makeSettings({ ngramCache: { sizeMB: 64, ttlMinutes: 120 } })}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE);
    expect((input as HTMLInputElement).value).toBe('64');
  });

  it('cache-ttl input shows current ttlMinutes value', () => {
    render(
      <HyphenStepSettings
        settings={makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 90 } })}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_TTL);
    expect((input as HTMLInputElement).value).toBe('90');
  });

  it('changing cache-size fires onChange with new sizeMB', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 120 } });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE);
    fireEvent.change(input, { target: { value: '128' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.sizeMB).toBe(128);
    expect(next.ngramCache.ttlMinutes).toBe(120); // unchanged
  });

  it('changing cache-ttl fires onChange with new ttlMinutes', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 120 } });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_TTL);
    fireEvent.change(input, { target: { value: '60' } });

    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.ttlMinutes).toBe(60);
    expect(next.ngramCache.sizeMB).toBe(32); // unchanged
  });

  it('cache field changes preserve other settings sections', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({
      rules: [{ id: 'r1', label: 'Always-join beginnings', enabled: true }],
      ngramCache: { sizeMB: 32, ttlMinutes: 120 },
      thresholds: { autoFlagBelow: 0.8 },
    });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE), {
      target: { value: '64' },
    });

    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.thresholds.autoFlagBelow).toBe(0.8);
    expect(next.rules).toHaveLength(1);
  });
});

// ─── Auto-flag thresholds section ─────────────────────────────────────────────

describe('HyphenStepSettings — auto-flag thresholds section', () => {
  it('renders "Auto-flag thresholds" heading', () => {
    render(<HyphenStepSettings settings={makeSettings()} onChange={vi.fn()} />);
    expect(screen.getAllByText(/auto-flag thresholds/i).length).toBeGreaterThan(0);
  });

  it('auto-flag-threshold input shows current value', () => {
    render(
      <HyphenStepSettings
        settings={makeSettings({ thresholds: { autoFlagBelow: 0.75 } })}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD);
    expect((input as HTMLInputElement).value).toBe('0.75');
  });

  it('changing auto-flag-threshold fires onChange with new value', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({ thresholds: { autoFlagBelow: 0.8 } });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    const input = screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD);
    fireEvent.change(input, { target: { value: '0.6' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.thresholds.autoFlagBelow).toBe(0.6);
  });

  it('threshold change preserves ngramCache and rules', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    const settings = makeSettings({
      rules: [{ id: 'r1', label: 'Always-join beginnings', enabled: true }],
      ngramCache: { sizeMB: 32, ttlMinutes: 120 },
      thresholds: { autoFlagBelow: 0.8 },
    });
    render(<HyphenStepSettings settings={settings} onChange={onChange} />);

    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD), {
      target: { value: '0.5' },
    });

    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.sizeMB).toBe(32);
    expect(next.ngramCache.ttlMinutes).toBe(120);
    expect(next.rules).toHaveLength(1);
  });

  it('clamps autoFlagBelow to 1 when value > 1', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    render(
      <HyphenStepSettings
        settings={makeSettings({ thresholds: { autoFlagBelow: 0.8 } })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD), {
      target: { value: '1.5' },
    });
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.thresholds.autoFlagBelow).toBe(1);
  });
});

// ─── NaN / min guards ─────────────────────────────────────────────────────────

describe('HyphenStepSettings — NaN / min guards', () => {
  it('NaN cache-size input does not call onChange with NaN — keeps previous value', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    render(
      <HyphenStepSettings
        settings={makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 120 } })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE), {
      target: { value: '' },
    });
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.sizeMB).toBe(32);
  });

  it('sub-min (0) cache-size input keeps previous value', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    render(
      <HyphenStepSettings
        settings={makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 120 } })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_SIZE), {
      target: { value: '0' },
    });
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.sizeMB).toBe(32);
  });

  it('NaN cache-ttl input keeps previous value', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    render(
      <HyphenStepSettings
        settings={makeSettings({ ngramCache: { sizeMB: 32, ttlMinutes: 120 } })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_CACHE_TTL), {
      target: { value: 'abc' },
    });
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.ngramCache.ttlMinutes).toBe(120);
  });

  it('NaN autoFlagBelow input keeps previous value', () => {
    const onChange = vi.fn<(arg: HyphenSettings) => void>();
    render(
      <HyphenStepSettings
        settings={makeSettings({ thresholds: { autoFlagBelow: 0.9 } })}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId(HYPHEN_STEP_SETTINGS_AUTO_FLAG_THRESHOLD), {
      target: { value: '' },
    });
    const [next] = onChange.mock.calls[0] as [HyphenSettings];
    expect(next.thresholds.autoFlagBelow).toBe(0.9);
  });
});
