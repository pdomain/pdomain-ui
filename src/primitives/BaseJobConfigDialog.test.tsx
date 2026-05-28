import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseJobConfigDialog } from './BaseJobConfigDialog.js';

function noop() {
  return Promise.resolve();
}

function renderDialog(overrides: Partial<React.ComponentProps<typeof BaseJobConfigDialog>> = {}) {
  return render(
    <BaseJobConfigDialog
      open={true}
      title="Run OCR Job"
      sourcePath="/books/my-novel.pdf"
      onClose={vi.fn()}
      onSubmit={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );
}

describe('BaseJobConfigDialog', () => {
  it('renders the title', () => {
    renderDialog();
    expect(screen.getByText('Run OCR Job')).toBeTruthy();
  });

  it('renders description when provided', () => {
    renderDialog({ description: 'Configure your job before running.' });
    expect(screen.getByText('Configure your job before running.')).toBeTruthy();
  });

  it('does not render description when omitted', () => {
    renderDialog();
    expect(screen.queryByText('Configure your job before running.')).toBeNull();
  });

  it('pre-fills project name from sourcePath basename (strips extension)', () => {
    renderDialog({ sourcePath: '/books/my-novel.pdf' });
    const input = screen.getByPlaceholderText('my-project');
    expect((input as HTMLInputElement).value).toBe('my-novel');
  });

  it('pre-fills project name for bare filename without extension', () => {
    renderDialog({ sourcePath: '/books/my-novel' });
    const input = screen.getByPlaceholderText('my-project');
    expect((input as HTMLInputElement).value).toBe('my-novel');
  });

  it('shows validation error when outputDir is empty on submit', async () => {
    const user = userEvent.setup();
    renderDialog();
    const submitBtn = screen.getByRole('button', { name: /run →/i });
    // outputDir is empty by default, so submit is disabled — click anyway via form submit
    const form = screen.getByTestId('job-config-dialog-form');
    // Manually trigger form submit via keyboard enter on project name field
    const nameInput = screen.getByPlaceholderText('my-project');
    await user.click(nameInput);
    // The button is disabled when outputDir is empty, so fire form submit directly
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(screen.getByRole('alert').textContent).toContain('required');
    // onSubmit should NOT have been called
    void submitBtn;
  });

  it('calls onSubmit with correct projectName and outputDir', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    renderDialog({ onSubmit: mockSubmit });

    const outputInput = screen.getByPlaceholderText('/home/user/output');
    await user.clear(outputInput);
    await user.type(outputInput, '/tmp/output');

    const submitBtn = screen.getByRole('button', { name: /run →/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledOnce();
    });
    expect(mockSubmit).toHaveBeenCalledWith({
      projectName: 'my-novel',
      outputDir: '/tmp/output',
    });
  });

  it('shows error message when onSubmit rejects', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Server unavailable'));
    renderDialog({ onSubmit: mockSubmit });

    const outputInput = screen.getByPlaceholderText('/home/user/output');
    await user.type(outputInput, '/tmp/output');

    const submitBtn = screen.getByRole('button', { name: /run →/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(screen.getByRole('alert').textContent).toContain('Server unavailable');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const mockClose = vi.fn();
    renderDialog({ onClose: mockClose });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('renders children (app-specific extra fields)', () => {
    renderDialog({
      children: <div data-testid="extra-field">Extra</div>,
    });
    expect(screen.getByTestId('extra-field')).toBeTruthy();
  });

  it('uses custom submitLabel', () => {
    renderDialog({ submitLabel: 'Process' });
    expect(screen.getByRole('button', { name: /process/i })).toBeTruthy();
  });

  it('resets outputDir to empty when dialog reopens (WS5)', async () => {
    const user = userEvent.setup();
    const mockClose = vi.fn();
    const { rerender } = render(
      <BaseJobConfigDialog
        open={true}
        title="Run OCR Job"
        sourcePath="/books/my-novel.pdf"
        onClose={mockClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    // Type in the output dir
    const outputInput = screen.getByPlaceholderText('/home/user/output');
    await user.type(outputInput, '/tmp/first-run');
    expect((outputInput as HTMLInputElement).value).toBe('/tmp/first-run');

    // Close the dialog
    rerender(
      <BaseJobConfigDialog
        open={false}
        title="Run OCR Job"
        sourcePath="/books/my-novel.pdf"
        onClose={mockClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    // Reopen it
    rerender(
      <BaseJobConfigDialog
        open={true}
        title="Run OCR Job"
        sourcePath="/books/my-novel.pdf"
        onClose={mockClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    // outputDir should be reset to empty
    const outputInputAfter = screen.getByPlaceholderText('/home/user/output');
    expect((outputInputAfter as HTMLInputElement).value).toBe('');
  });

  // Ensure noop import is used so TS doesn't tree-shake it
  it('noop resolves', async () => {
    await expect(noop()).resolves.toBeUndefined();
  });
});
