import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InsertDialog } from './InsertDialog.js';
import type { InsertAnchorOption, InsertSubmission } from './InsertDialog.js';
import {
  INSERT_DIALOG,
  INSERT_DIALOG_NOTE,
  INSERT_DIALOG_NOTE_COUNTER,
  INSERT_DIALOG_FILE,
  INSERT_DIALOG_SUBMIT,
  INSERT_DIALOG_CANCEL,
} from '../../testids/index.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const ANCHORS: InsertAnchorOption[] = [
  { value: 'p001.png', label: 'p001.png' },
  { value: 'p002.png', label: 'p002.png' },
  { value: 'p019.png', label: 'p019.png' },
];

function renderOpen(overrides: Partial<React.ComponentProps<typeof InsertDialog>> = {}) {
  const onInsert = vi.fn<(arg: InsertSubmission) => void>();
  const onOpenChange = vi.fn<(arg: boolean) => void>();

  render(
    <InsertDialog
      open={true}
      onOpenChange={onOpenChange}
      anchorOptions={ANCHORS}
      onInsert={onInsert}
      {...overrides}
    />,
  );

  return { onInsert, onOpenChange };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InsertDialog', () => {
  it('renders when open=true', () => {
    renderOpen();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Insert page' })).toBeInTheDocument();
  });

  it('does not render dialog content when open=false', () => {
    render(
      <InsertDialog
        open={false}
        onOpenChange={vi.fn()}
        anchorOptions={ANCHORS}
        onInsert={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('forwards data-testid to dialog content', () => {
    renderOpen({ 'data-testid': 'custom-id' });
    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });

  it('uses INSERT_DIALOG testid by default', () => {
    renderOpen();
    expect(screen.getByTestId(INSERT_DIALOG)).toBeInTheDocument();
  });

  describe('position toggle', () => {
    it('defaults to Before', () => {
      renderOpen();
      const before = screen.getByRole('radio', { name: 'Before' });
      const after = screen.getByRole('radio', { name: 'After' });
      expect(before).toHaveAttribute('aria-checked', 'true');
      expect(after).toHaveAttribute('aria-checked', 'false');
    });

    it('clicking After switches position', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.click(screen.getByRole('radio', { name: 'After' }));
      expect(screen.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'Before' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });
  });

  describe('kind selector', () => {
    it('defaults to Missing selected', () => {
      renderOpen();
      expect(screen.getByRole('radio', { name: /Missing/ })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('clicking Blank selects Blank', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.click(screen.getByRole('radio', { name: /Blank/ }));
      expect(screen.getByRole('radio', { name: /Blank/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /Missing/ })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('clicking Errata selects Errata', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.click(screen.getByRole('radio', { name: /Errata/ }));
      expect(screen.getByRole('radio', { name: /Errata/ })).toHaveAttribute('aria-checked', 'true');
    });

    it('clicking Manual selects Manual', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.click(screen.getByRole('radio', { name: /Manual/ }));
      expect(screen.getByRole('radio', { name: /Manual/ })).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('anchor select', () => {
    it('Insert button is disabled when no anchor selected', () => {
      renderOpen();
      expect(screen.getByTestId(INSERT_DIALOG_SUBMIT)).toBeDisabled();
    });

    it('selecting an anchor enables Insert button', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.selectOptions(screen.getByRole('combobox', { name: /Anchor page/i }), 'p001.png');
      expect(screen.getByTestId(INSERT_DIALOG_SUBMIT)).not.toBeDisabled();
    });

    it('pre-selects defaultAnchor when provided', () => {
      renderOpen({ defaultAnchor: 'p019.png' });
      const selectEl = screen.getByRole('combobox', { name: /Anchor page/i });
      expect(selectEl).toHaveValue('p019.png');
      expect(screen.getByTestId(INSERT_DIALOG_SUBMIT)).not.toBeDisabled();
    });
  });

  describe('note counter', () => {
    it('renders initial counter 0/280', () => {
      renderOpen();
      expect(screen.getByTestId(INSERT_DIALOG_NOTE_COUNTER)).toHaveTextContent('0/280');
    });

    it('updates counter as user types', async () => {
      const user = userEvent.setup();
      renderOpen();
      await user.type(screen.getByTestId(INSERT_DIALOG_NOTE), 'hello');
      expect(screen.getByTestId(INSERT_DIALOG_NOTE_COUNTER)).toHaveTextContent('5/280');
    });

    it('disables Insert when note exceeds 280 chars (even with anchor set)', () => {
      renderOpen({ defaultAnchor: 'p001.png' });
      // Insert is initially enabled because defaultAnchor is set
      expect(screen.getByTestId(INSERT_DIALOG_SUBMIT)).not.toBeDisabled();
      const overLimit = 'a'.repeat(281);
      fireEvent.change(screen.getByTestId(INSERT_DIALOG_NOTE), {
        target: { value: overLimit },
      });
      expect(screen.getByTestId(INSERT_DIALOG_SUBMIT)).toBeDisabled();
    });
  });

  describe('file dropzone', () => {
    it('shows browse hint initially', () => {
      renderOpen();
      expect(screen.getByText(/Drop a JP2 \/ PNG \/ JPG/)).toBeInTheDocument();
    });

    it('selecting a file shows filename and size', async () => {
      const user = userEvent.setup();
      renderOpen();
      const input = screen.getByTestId(INSERT_DIALOG_FILE);
      const testFile = new File(['pixel'], 'scan_p019.png', { type: 'image/png' });
      await user.upload(input, testFile);
      expect(screen.getByText('scan_p019.png')).toBeInTheDocument();
    });
  });

  describe('Insert button submission', () => {
    it('fires onInsert with assembled InsertSubmission', async () => {
      const user = userEvent.setup();
      const { onInsert } = renderOpen({ defaultAnchor: 'p001.png' });
      // Switch to After
      await user.click(screen.getByRole('radio', { name: 'After' }));
      // Select Blank kind
      await user.click(screen.getByRole('radio', { name: /Blank/ }));
      // Type a note
      await user.type(screen.getByTestId(INSERT_DIALOG_NOTE), 'Test note');
      // Submit
      await user.click(screen.getByTestId(INSERT_DIALOG_SUBMIT));

      expect(onInsert).toHaveBeenCalledOnce();
      expect(onInsert).toHaveBeenCalledWith(
        expect.objectContaining<Partial<InsertSubmission>>({
          position: 'after',
          anchor: 'p001.png',
          kind: 'blank',
          note: 'Test note',
        }),
      );
      const [arg] = onInsert.mock.lastCall ?? [];
      expect(arg?.file).toBeUndefined();
    });

    it('includes file in submission when file was selected', async () => {
      const user = userEvent.setup();
      const { onInsert } = renderOpen({ defaultAnchor: 'p002.png' });
      const testFile = new File(['x'], 'replacement.png', { type: 'image/png' });
      await user.upload(screen.getByTestId(INSERT_DIALOG_FILE), testFile);
      await user.click(screen.getByTestId(INSERT_DIALOG_SUBMIT));

      expect(onInsert).toHaveBeenCalledOnce();
      const [arg] = onInsert.mock.lastCall ?? [];
      expect(arg?.file).toBe(testFile);
    });
  });

  describe('Cancel button', () => {
    it('calls onOpenChange(false) when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderOpen();
      await user.click(screen.getByTestId(INSERT_DIALOG_CANCEL));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ── WS5: Insert submit closes dialog ─────────────────────────────────────
  describe('Insert submit (WS5)', () => {
    it('calls onOpenChange(false) after successful insert', async () => {
      const user = userEvent.setup();
      const { onInsert, onOpenChange } = renderOpen({ defaultAnchor: 'p001.png' });
      await user.click(screen.getByTestId(INSERT_DIALOG_SUBMIT));
      expect(onInsert).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
