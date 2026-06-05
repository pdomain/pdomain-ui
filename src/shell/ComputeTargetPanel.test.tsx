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
    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toBeInTheDocument();
  });

  it('hides CUDA link when only CPU is available', () => {
    const cpuOnly = { ...localInfo, available: [{ id: 'cpu', label: 'CPU' }] };
    render(<ComputeTargetPanel info={cpuOnly} onSelect={() => {}} />);
    expect(screen.queryByRole('link', { name: /CUDA setup guide/ })).toBeNull();
  });

  it('uses cudaDocsUrl prop for external CUDA setup guide links', () => {
    render(
      <ComputeTargetPanel
        info={localInfo}
        onSelect={() => {}}
        cudaDocsUrl="https://example.test/cuda"
      />,
    );

    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toHaveAttribute(
      'href',
      'https://example.test/cuda',
    );
    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('uses cudaDocsUrl prop for repo CUDA setup guide links', () => {
    render(
      <ComputeTargetPanel
        info={localInfo}
        onSelect={() => {}}
        cudaDocsUrl="/docs/runbooks/cuda-setup.md"
      />,
    );

    const link = screen.getByRole('link', { name: /CUDA setup guide/ });
    expect(link).toHaveAttribute('href', '/docs/runbooks/cuda-setup.md');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('falls back to PyTorch CUDA setup guide when no docs URL is supplied', () => {
    render(<ComputeTargetPanel info={localInfo} onSelect={() => {}} />);

    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toHaveAttribute(
      'href',
      'https://pytorch.org/get-started/locally/',
    );
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
    expect(screen.getByRole('button', { name: 'Force CPU' })).toHaveAttribute('type', 'button');
  });

  it('shows app-forced CPU state and resets app preference', () => {
    const onClear = vi.fn();
    const appForcedCpu = { ...localInfo, current: 'cpu', effective_source: 'app' as const };

    render(<ComputeTargetPanel info={appForcedCpu} onSelect={() => {}} onClear={onClear} />);

    expect(screen.getByText('CPU forced for this app')).toBeInTheDocument();
    const resetButton = screen.getByRole('button', { name: 'Reset to auto' });
    expect(resetButton).toHaveAttribute('type', 'button');
    fireEvent.click(resetButton);
    expect(onClear).toHaveBeenCalledWith('app');
  });

  it('shows app-forced CPU state without reset action when onClear is not provided', () => {
    const appForcedCpu = { ...localInfo, current: 'cpu', effective_source: 'app' as const };

    render(<ComputeTargetPanel info={appForcedCpu} onSelect={() => {}} />);

    expect(screen.getByText('CPU forced for this app')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset to auto' })).toBeNull();
  });

  it('calls onSelect with cpu when Force CPU is clicked for a GPU current device', () => {
    const onSelect = vi.fn();
    const gpuCurrent = { ...localInfo, current: 'cuda:0' };

    render(<ComputeTargetPanel info={gpuCurrent} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Force CPU' }));
    expect(onSelect).toHaveBeenCalledWith('cpu');
  });

  it('renders unavailable NVIDIA hardware without a radio and uses supplied repo CUDA docs', () => {
    const onSelect = vi.fn();
    const nvidiaUnavailable = {
      ...localInfo,
      available: [
        { id: 'cpu', label: 'CPU', available: true, kind: 'cpu' },
        {
          id: 'nvidia:0',
          label: 'NVIDIA GeForce RTX 3070',
          available: false,
          kind: 'nvidia',
          reason: 'NVIDIA GPU detected, but CUDA is not usable by PyTorch.',
        },
      ],
    };

    render(
      <ComputeTargetPanel
        info={nvidiaUnavailable}
        onSelect={onSelect}
        cudaDocsUrl="/docs/runbooks/cuda-setup.md"
      />,
    );

    fireEvent.click(screen.getByText('NVIDIA GeForce RTX 3070'));
    expect(
      screen.getByText('NVIDIA GPU detected, but CUDA is not usable by PyTorch.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId(COMPUTE_DEVICE_OPTION('nvidia:0'))).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /CUDA setup guide/ })).toHaveAttribute(
      'href',
      '/docs/runbooks/cuda-setup.md',
    );
  });
});
