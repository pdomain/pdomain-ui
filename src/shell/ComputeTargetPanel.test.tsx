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

  it('calls onSelect when a radio is changed', () => {
    const onSelect = vi.fn();
    render(<ComputeTargetPanel info={localInfo} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId(COMPUTE_DEVICE_OPTION('cuda:0')));
    expect(onSelect).toHaveBeenCalledWith('cuda:0');
  });

  it('marks the current device radio as checked', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    const cpuRadio = screen.getByTestId(COMPUTE_DEVICE_OPTION('cpu'));
    expect(cpuRadio).toBeChecked();
    const gpuRadio = screen.getByTestId(COMPUTE_DEVICE_OPTION('cuda:0'));
    expect(gpuRadio).not.toBeChecked();
  });

  it('shows CUDA link only when a non-CPU device is available', () => {
    // With a GPU in the list — link should appear
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    expect(screen.getByText(/CUDA install docs/)).toBeInTheDocument();
  });

  it('hides CUDA link when only CPU is available', () => {
    const cpuOnly = { ...localInfo, available: [{ id: 'cpu', label: 'CPU' }] };
    render(<ComputeTargetPanel info={cpuOnly} onSelect={() => {}} />);
    expect(screen.queryByText(/CUDA install docs/)).toBeNull();
  });

  it('hides Force CPU button when current is null', () => {
    const noCurrent = { ...localInfo, current: null };
    render(<ComputeTargetPanel info={noCurrent} onSelect={() => {}} />);
    expect(screen.queryByText('Force CPU')).toBeNull();
  });

  it('hides Force CPU button when current is already cpu', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);
    expect(screen.queryByText('Force CPU')).toBeNull();
  });

  it('shows Force CPU button when a non-CPU device is current', () => {
    const gpuCurrent = { ...localInfo, current: 'cuda:0' };
    render(<ComputeTargetPanel info={gpuCurrent} onSelect={() => {}} />);
    expect(screen.getByText('Force CPU')).toBeInTheDocument();
  });
});
