import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UpdatePanel, UpdateBadge } from './UpdatePanel.js';
import { UPDATE_PANEL, UPDATE_BADGE, UPDATE_APPLY_BUTTON } from '../testids/index.js';

const updateInfo = {
  current: '0.9.0',
  latest: '0.10.0',
  update_available: true,
  changelog_url: 'https://example.com/changelog',
  channel: 'stable',
};

describe('UpdatePanel', () => {
  it('renders with correct testid', () => {
    render(
      <UpdatePanel
        info={updateInfo}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.getByTestId(UPDATE_PANEL)).toBeInTheDocument();
  });

  it('apply button fires onApply', () => {
    const apply = vi.fn();
    render(
      <UpdatePanel
        info={updateInfo}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={apply}
      />,
    );
    fireEvent.click(screen.getByTestId(UPDATE_APPLY_BUTTON));
    expect(apply).toHaveBeenCalled();
  });

  it('shows current and latest versions', () => {
    render(
      <UpdatePanel
        info={updateInfo}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.getByText(/0\.9\.0/)).toBeInTheDocument();
    expect(screen.getByText(/0\.10\.0/)).toBeInTheDocument();
  });

  it('shows changelog link', () => {
    render(
      <UpdatePanel
        info={updateInfo}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.getByRole('link', { name: /changelog/i })).toBeInTheDocument();
  });

  it('calls onPolicyChange when policy is changed', () => {
    const onPolicyChange = vi.fn();
    render(
      <UpdatePanel
        info={updateInfo}
        policy="notify"
        onPolicyChange={onPolicyChange}
        onApply={() => {}}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'manual' } });
    expect(onPolicyChange).toHaveBeenCalledWith('manual');
  });

  it('hides apply button when no update available', () => {
    render(
      <UpdatePanel
        info={{ ...updateInfo, update_available: false }}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.queryByTestId(UPDATE_APPLY_BUTTON)).not.toBeInTheDocument();
  });

  it('renders even with null info', () => {
    render(
      <UpdatePanel
        info={null}
        policy="notify"
        onPolicyChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.getByTestId(UPDATE_PANEL)).toBeInTheDocument();
  });
});

describe('UpdateBadge', () => {
  it('renders badge testid when available', () => {
    render(<UpdateBadge available />);
    expect(screen.getByTestId(UPDATE_BADGE)).toBeInTheDocument();
  });

  it('renders nothing when not available', () => {
    const { container } = render(<UpdateBadge available={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
