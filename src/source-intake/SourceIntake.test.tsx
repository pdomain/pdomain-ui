import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
import { FileDropzone } from './FileDropzone.js';
import { PathInputWithRecents } from './PathInputWithRecents.js';
import { SelectedSourceSummary } from './SelectedSourceSummary.js';
import { SourceKindSelector } from './SourceKindSelector.js';
import type { SelectedSource } from './types.js';

describe('source intake kit', () => {
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
        labelText: 'scan001.png',
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
