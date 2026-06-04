import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComputeTargetPanel } from './ComputeTargetPanel.js';
import { COMPUTE_TARGET_PANEL, COMPUTE_DEVICE_OPTION } from '../testids/index.js';

const localInfo = {
  mode: 'local' as const,
  available: [
    { id: 'cpu', label: 'CPU' },
    { id: 'cuda:0', label: 'GPU', vram_total_mb: 8192, vram_free_mb: 4096 },
  ],
  current: 'cpu',
  effective_source: 'auto',
};

describe('ComputeTargetPanel', () => {
  it('renders device list in local mode', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    expect(screen.getByTestId(COMPUTE_TARGET_PANEL)).toBeInTheDocument();
    expect(screen.getByText('GPU')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  it('hidden when not local mode', () => {
    const { container } = render(
      <ComputeTargetPanel info={{ ...localInfo, mode: 'hosted' }} onSelect={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders device options with correct testids', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    expect(screen.getByTestId(COMPUTE_DEVICE_OPTION('cpu'))).toBeInTheDocument();
    expect(screen.getByTestId(COMPUTE_DEVICE_OPTION('cuda:0'))).toBeInTheDocument();
  });

  it('shows VRAM info for GPU devices', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    // 8192 MB VRAM should be displayed
    expect(screen.getByText(/8192/)).toBeInTheDocument();
  });

  it('calls onSelect when a device is clicked', () => {
    const onSelect = vi.fn();
    render(<ComputeTargetPanel info={localInfo} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId(COMPUTE_DEVICE_OPTION('cuda:0')));
    expect(onSelect).toHaveBeenCalledWith('cuda:0');
  });

  it('marks the current device as selected', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    const cpuOption = screen.getByTestId(COMPUTE_DEVICE_OPTION('cpu'));
    expect(cpuOption).toHaveAttribute('aria-current', 'true');
  });
});
