import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
import { FileDropzone } from './FileDropzone.js';
import { PathInputWithRecents } from './PathInputWithRecents.js';
import { SelectedSourceSummary } from './SelectedSourceSummary.js';
import { SourceKindSelector } from './SourceKindSelector.js';
import type { SelectedSource } from './types.js';

describe('source intake kit', () => {
  function describedByText(element: HTMLElement) {
    return (element.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' ');
  }

  it('accepts dropped files and ignores drops while disabled', async () => {
    const onFilesAccepted = vi.fn();
    const file = new File(['hello'], 'sample.txt', { type: 'text/plain' });
    const { rerender } = render(
      <FileDropzone label="Drop source" onFilesAccepted={onFilesAccepted} />,
    );

    await userEvent.upload(screen.getByLabelText('Drop source'), file);
    expect(onFilesAccepted).toHaveBeenCalledWith([file]);

    rerender(<FileDropzone label="Drop source" onFilesAccepted={onFilesAccepted} disabled />);
    await userEvent.upload(screen.getByLabelText('Drop source'), file);
    expect(onFilesAccepted).toHaveBeenCalledTimes(1);
  });

  it('accepts direct dropped files and ignores direct drops while disabled', () => {
    const onFilesAccepted = vi.fn();
    const file = new File(['hello'], 'sample.txt', { type: 'text/plain' });
    const { rerender } = render(
      <FileDropzone label="Drop source" onFilesAccepted={onFilesAccepted} />,
    );
    const dropzone = screen.getByText('Drop source').closest('.pdui-file-dropzone');
    expect(dropzone).not.toBeNull();

    fireEvent.drop(dropzone as Element, { dataTransfer: { files: [file] } });
    expect(onFilesAccepted).toHaveBeenCalledWith([file]);

    rerender(<FileDropzone label="Drop source" onFilesAccepted={onFilesAccepted} disabled />);
    const disabledDropzone = screen.getByText('Drop source').closest('.pdui-file-dropzone');
    expect(disabledDropzone).not.toBeNull();
    fireEvent.drop(disabledDropzone as Element, { dataTransfer: { files: [file] } });
    expect(onFilesAccepted).toHaveBeenCalledTimes(1);
  });

  it('describes file, path, and directory inputs with helper and error text', () => {
    render(
      <>
        <FileDropzone
          label="Drop source"
          description="Use images or archives"
          error="Unsupported source"
          onFilesAccepted={() => undefined}
        />
        <PathInputWithRecents
          ariaLabel="Source path"
          value="/tmp/book"
          onValueChange={() => undefined}
          hint="Use an absolute path"
          error="Path not found"
        />
        <DirectoryPickerDialog
          open
          onOpenChange={() => undefined}
          currentPath="/books"
          onCurrentPathChange={() => undefined}
          inputPath="/books"
          onInputPathChange={() => undefined}
          entries={[]}
          error="Directory unavailable"
          onApply={() => undefined}
        />
      </>,
    );

    const fileInput = screen.getByLabelText('Drop source');
    expect(fileInput).toHaveAttribute('aria-invalid', 'true');
    expect(describedByText(fileInput)).toBe('Use images or archives Unsupported source');

    const pathInput = screen.getByLabelText('Source path');
    expect(pathInput).toHaveAttribute('aria-invalid', 'true');
    expect(describedByText(pathInput)).toBe('Use an absolute path Path not found');

    const directoryInput = screen.getByLabelText('Path');
    expect(directoryInput).toHaveAttribute('aria-invalid', 'true');
    expect(describedByText(directoryInput)).toBe('Directory unavailable');
  });

  it('selects source kinds', async () => {
    const user = userEvent.setup();
    const onActiveKindChange = vi.fn();
    render(
      <SourceKindSelector
        ariaLabel="Source kind"
        activeKind="file"
        onActiveKindChange={onActiveKindChange}
        kinds={[
          { id: 'file', label: 'Files' },
          { id: 'folder', label: 'Folder' },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Folder' }));
    expect(onActiveKindChange).toHaveBeenCalledWith('folder');
  });

  it('does not select disabled source kinds', async () => {
    const user = userEvent.setup();
    const onActiveKindChange = vi.fn();
    render(
      <SourceKindSelector
        ariaLabel="Source kind"
        activeKind="file"
        onActiveKindChange={onActiveKindChange}
        kinds={[
          { id: 'file', label: 'Files' },
          { id: 'folder', label: 'Folder', disabled: true },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Folder' }));
    expect(onActiveKindChange).not.toHaveBeenCalled();
  });

  it('applies a directory path after navigating to an entry', async () => {
    const user = userEvent.setup();
    const onCurrentPathChange = vi.fn();
    const onInputPathChange = vi.fn();
    const onApply = vi.fn();
    render(
      <DirectoryPickerDialog
        open
        onOpenChange={() => undefined}
        currentPath="/books"
        onCurrentPathChange={onCurrentPathChange}
        inputPath="/books"
        onInputPathChange={onInputPathChange}
        entries={[{ name: 'novel', path: '/books/novel', kind: 'directory' }]}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'novel' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onCurrentPathChange).toHaveBeenCalledWith('/books/novel');
    expect(onInputPathChange).toHaveBeenCalledWith('/books/novel');
    expect(onApply).toHaveBeenCalledWith('/books/novel');
  });

  it('selects recent paths and removes selected sources', async () => {
    const user = userEvent.setup();
    const onRecentPathSelect = vi.fn();
    const onRemove = vi.fn();
    render(
      <>
        <PathInputWithRecents
          ariaLabel="Source path"
          value="/tmp/book"
          onValueChange={() => undefined}
          recentPaths={['/tmp/book', '/tmp/other']}
          onRecentPathSelect={onRecentPathSelect}
        />
        <SelectedSourceSummary
          sources={[{ id: 'one', kind: 'file', label: 'scan001.png', meta: '1 MB' }]}
          onRemove={onRemove}
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '/tmp/other' }));
    await user.click(screen.getByRole('button', { name: 'Remove scan001.png' }));
    expect(onRecentPathSelect).toHaveBeenCalledWith('/tmp/other');
    expect(onRemove).toHaveBeenCalledWith('one');
  });

  it('names remove buttons from source text labels when labels are JSX', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const sources = [
      {
        id: 'one',
        kind: 'file',
        label: <span>scan001.png</span>,
        meta: '1 MB',
      },
    ] satisfies readonly SelectedSource[];

    render(<SelectedSourceSummary sources={sources} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove scan001.png' }));
    expect(onRemove).toHaveBeenCalledWith('one');
  });

  it('navigates and applies paths in the directory picker', async () => {
    const user = userEvent.setup();
    const onCurrentPathChange = vi.fn();
    const onInputPathChange = vi.fn();
    const onApply = vi.fn();
    render(
      <DirectoryPickerDialog
        open
        onOpenChange={() => undefined}
        currentPath="/books"
        onCurrentPathChange={onCurrentPathChange}
        inputPath="/books"
        onInputPathChange={onInputPathChange}
        entries={[{ name: 'novel', path: '/books/novel', kind: 'directory' }]}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'novel' }));
    expect(onCurrentPathChange).toHaveBeenCalledWith('/books/novel');

    const input = screen.getByLabelText('Path');
    await user.clear(input);
    await user.type(input, '/books/typed');
    await user.keyboard('{Control>}{Enter}{/Control}');
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('/books/typed'));
  });
});
