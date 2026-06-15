# Cross-App Common UI Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pdomain-ui common modules needed by PGDP prep, simple OCR GUI, and OCR labeler SPA before migrating those apps.

**Architecture:** Add six new public subpaths plus small primitive re-exports. Each module is presentation-only, typed, slot-based, and app-controlled. Apps keep data loading, state machines, endpoints, OCR policy, source validation, and annotation behavior.

**Tech Stack:** TypeScript, React, Vite library build, Vitest, Testing Library, Storybook, token CSS in `theme/primitives.css`, icons from `src/icons`.

---

## Spec

Follow `docs/specs/2026-06-15-cross-app-common-ui-modules-design.md`.

Do not modify consumer apps in this plan. This plan builds pdomain-ui pieces only.

## File Structure

Create these module folders:

- `src/records/` - generic record lists, tables, grids, empty states, and list toolbar controls.
- `src/source-intake/` - file dropzone, source kind selector, path with recents, selected source summary, directory picker dialog.
- `src/viewport/` - zoom viewport, viewport toolbar, shared zoom types.
- `src/settings/` - settings card, row, value, slider, async section, path row, status/action row, guidance panel.
- `src/status/` - operation status panel, blocking overlay, retry panel.
- `src/workbench/` - layout-only workbench and panel shells.

Modify these packaging files:

- `vite.config.ts` - add library entries for new subpaths.
- `package.json` - add `exports` for new subpaths.
- `tests/build.contract.test.ts` - include new entries and symbol guards.
- `tests/pack.contract.test.ts` - require new entries in the package tarball.
- `src/primitives/index.ts` - re-export settings primitives that are broadly useful from `@pdomain/pdomain-ui/primitives`.
- `theme/primitives.css` - add shared class families with token-only styling.

Do not add new root barrel exports unless a task explicitly says so.

## Shared Implementation Rules

- Use `ReactNode`, typed callbacks, and render slots. Do not add domain-shaped props.
- Use `cn` from `src/primitives/cn.ts` for class composition.
- Import icons only from `src/icons/index.ts`.
- Use `var(--token)` colors only. Do not add hex colors.
- Keep comments sparse. Add comments only for non-obvious behavior.
- Prefer focused files. Do not place all modules in one large file.
- Run focused tests after each task and commit after each green task.
- Run `make ci AI=1` before final integration commit or branch handoff.

## Shared Type Snippets

Use these exact shared type names across tasks.

```ts
export interface RecordSelectionState<T> {
  selectedKeys: ReadonlySet<string>;
  onSelectedKeysChange?(keys: ReadonlySet<string>): void;
  isItemDisabled?(item: T): boolean;
}

export interface DataTableSortState {
  key: string;
  direction: 'asc' | 'desc';
}

export type ZoomFitMode = 'none' | 'fit-width' | 'fit-height' | 'fit-page';
```

---

### Task 1: Package Subpaths And Contract Tests

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `tests/build.contract.test.ts`
- Modify: `tests/pack.contract.test.ts`
- Create: `src/records/index.ts`
- Create: `src/source-intake/index.ts`
- Create: `src/viewport/index.ts`
- Create: `src/settings/index.ts`
- Create: `src/status/index.ts`
- Create: `src/workbench/index.ts`

- [ ] **Step 1: Create empty subpath barrels**

Create each new `index.ts` file with an exported sentinel type so TypeScript and Vite have a valid entry before components exist:

```ts
export type PdomainUiRecordsModule = 'records';
```

Use the matching literal for each folder:

```ts
export type PdomainUiSourceIntakeModule = 'source-intake';
export type PdomainUiViewportModule = 'viewport';
export type PdomainUiSettingsModule = 'settings';
export type PdomainUiStatusModule = 'status';
export type PdomainUiWorkbenchModule = 'workbench';
```

- [ ] **Step 2: Add Vite entries**

In `vite.config.ts`, add these entries inside `build.lib.entry` after `hooks`:

```ts
        records: resolve(__dirname, 'src/records/index.ts'),
        'source-intake': resolve(__dirname, 'src/source-intake/index.ts'),
        viewport: resolve(__dirname, 'src/viewport/index.ts'),
        settings: resolve(__dirname, 'src/settings/index.ts'),
        status: resolve(__dirname, 'src/status/index.ts'),
        workbench: resolve(__dirname, 'src/workbench/index.ts'),
```

- [ ] **Step 3: Add package exports**

In `package.json`, add these entries after `./hooks`:

```json
    "./records": {
      "import": "./dist/records.js",
      "types": "./dist/records.d.ts"
    },
    "./source-intake": {
      "import": "./dist/source-intake.js",
      "types": "./dist/source-intake.d.ts"
    },
    "./viewport": {
      "import": "./dist/viewport.js",
      "types": "./dist/viewport.d.ts"
    },
    "./settings": {
      "import": "./dist/settings.js",
      "types": "./dist/settings.d.ts"
    },
    "./status": {
      "import": "./dist/status.js",
      "types": "./dist/status.d.ts"
    },
    "./workbench": {
      "import": "./dist/workbench.js",
      "types": "./dist/workbench.d.ts"
    }
```

Keep valid JSON comma placement. Do not remove existing exports.

- [ ] **Step 4: Expand build contract tests**

In `tests/build.contract.test.ts`, add these entries to both `entries` and `REQUIRED_ENTRIES`:

```ts
      'records',
      'source-intake',
      'viewport',
      'settings',
      'status',
      'workbench',
```

Update the unexpected entry regex so hyphenated entries are allowed:

```ts
    const jsEntries = files.filter((f) => /^[a-z-]+\.js$/.test(f));
```

Add this test block after the existing `dist/stores.d.ts` block:

```ts
describe('new cross-app common UI subpaths', () => {
  const REQUIRED = {
    records: 'PdomainUiRecordsModule',
    'source-intake': 'PdomainUiSourceIntakeModule',
    viewport: 'PdomainUiViewportModule',
    settings: 'PdomainUiSettingsModule',
    status: 'PdomainUiStatusModule',
    workbench: 'PdomainUiWorkbenchModule',
  } as const;

  for (const [entry, symbol] of Object.entries(REQUIRED)) {
    it(`dist/${entry}.d.ts exports ${symbol}`, () => {
      const dtsPath = resolve(__dirname, `../dist/${entry}.d.ts`);
      expect(existsSync(dtsPath), `dist/${entry}.d.ts missing - run pnpm build`).toBe(true);
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content, `${symbol} must be exported from dist/${entry}.d.ts`).toContain(symbol);
    });
  }
});
```

- [ ] **Step 5: Expand pack contract tests**

In `tests/pack.contract.test.ts`, add these entries to `REQUIRED_DIST_ENTRIES`:

```ts
  'records',
  'settings',
  'source-intake',
  'status',
  'viewport',
  'workbench',
```

Keep the list sorted enough to scan.

- [ ] **Step 6: Run package tests to verify they fail before build**

Run:

```bash
pnpm exec vitest run tests/build.contract.test.ts tests/pack.contract.test.ts
```

Expected: FAIL before a fresh build because new `dist/*.d.ts` files do not exist yet.

- [ ] **Step 7: Build and run package tests**

Run:

```bash
pnpm build
pnpm exec vitest run tests/build.contract.test.ts tests/pack.contract.test.ts
```

Expected: PASS. The new subpaths build to `dist/`.

- [ ] **Step 8: Commit**

```bash
git add vite.config.ts package.json tests/build.contract.test.ts tests/pack.contract.test.ts src/records/index.ts src/source-intake/index.ts src/viewport/index.ts src/settings/index.ts src/status/index.ts src/workbench/index.ts
git commit -m "chore: add common ui package subpaths"
```

---

### Task 2: Records Foundation

**Files:**
- Create: `src/records/types.ts`
- Create: `src/records/EmptyState.tsx`
- Create: `src/records/RecordList.tsx`
- Create: `src/records/RecordList.test.tsx`
- Create: `src/records/EmptyState.test.tsx`
- Create: `src/records/RecordList.stories.tsx`
- Modify: `src/records/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests for `EmptyState`**

Create `src/records/EmptyState.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState.js';

describe('EmptyState', () => {
  it('renders title, description, icon and action', () => {
    render(
      <EmptyState
        title="No projects"
        description="Open a source folder to get started."
        icon={<span aria-hidden="true">Icon</span>}
        action={<button type="button">Open folder</button>}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No projects');
    expect(screen.getByRole('status')).toHaveTextContent('Open a source folder');
    expect(screen.getByRole('button', { name: 'Open folder' })).toBeInTheDocument();
  });

  it('sets the requested tone', () => {
    render(<EmptyState title="Failed" tone="danger" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'danger');
  });
});
```

- [ ] **Step 2: Write failing tests for `RecordList`**

Create `src/records/RecordList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecordList } from './RecordList.js';

interface ProjectRow {
  id: string;
  name: string;
  meta: string;
  status: string;
}

const rows: ProjectRow[] = [
  { id: 'a', name: 'Alpha', meta: '12 pages', status: 'ready' },
  { id: 'b', name: 'Beta', meta: '4 pages', status: 'running' },
];

describe('RecordList', () => {
  it('renders primary, secondary, meta, status and actions', () => {
    render(
      <RecordList
        ariaLabel="Projects"
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderSecondary={(row) => `Project ${row.id}`}
        renderMeta={(row) => row.meta}
        renderStatus={(row) => row.status}
        renderActions={(row) => <button type="button">Open {row.name}</button>}
      />,
    );

    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Alpha/ })).toHaveTextContent('12 pages');
    expect(screen.getByRole('button', { name: 'Open Alpha' })).toBeInTheDocument();
  });

  it('activates rows with click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        onActivate={onActivate}
      />,
    );

    const alpha = screen.getByRole('listitem', { name: /Alpha/ });
    await user.click(alpha);
    alpha.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(3);
    expect(onActivate).toHaveBeenNthCalledWith(1, rows[0]);
  });

  it('does not activate a row when an action is clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    const onAction = vi.fn();
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderActions={() => (
          <button type="button" onClick={onAction}>
            Row action
          </button>
        )}
        onActivate={onActivate}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Row action' })[0]);

    expect(onAction).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('marks selected rows and disabled rows', () => {
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        selection={{
          selectedKeys: new Set(['b']),
          isItemDisabled: (row) => row.id === 'a',
        }}
      />,
    );

    expect(screen.getByRole('listitem', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('listitem', { name: /Alpha/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders loading, error and empty states', () => {
    const { rerender } = render(
      <RecordList items={[]} getKey={(row: ProjectRow) => row.id} renderPrimary={(row) => row.name} loading />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    rerender(
      <RecordList
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        error="Could not load projects"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load projects');

    rerender(
      <RecordList
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        empty={<span>No rows</span>}
      />,
    );
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm exec vitest run src/records/EmptyState.test.tsx src/records/RecordList.test.tsx
```

Expected: FAIL with missing `EmptyState` and `RecordList` modules.

- [ ] **Step 4: Implement records types**

Create `src/records/types.ts`:

```ts
import type { ReactNode } from 'react';

export type RecordDensity = 'compact' | 'comfortable';
export type RecordTone = 'neutral' | 'info' | 'warning' | 'danger';

export interface RecordSelectionState<T> {
  selectedKeys: ReadonlySet<string>;
  onSelectedKeysChange?(keys: ReadonlySet<string>): void;
  isItemDisabled?(item: T): boolean;
}

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: RecordTone;
  className?: string;
}
```

- [ ] **Step 5: Implement `EmptyState`**

Create `src/records/EmptyState.tsx`:

```tsx
import type { EmptyStateProps } from './types.js';
import { cn } from '../primitives/cn.js';

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('pdui-empty-state', className)} data-tone={tone} role="status">
      {icon ? <div className="pdui-empty-state__icon">{icon}</div> : null}
      <div className="pdui-empty-state__body">
        <div className="pdui-empty-state__title">{title}</div>
        {description ? <div className="pdui-empty-state__description">{description}</div> : null}
      </div>
      {action ? <div className="pdui-empty-state__action">{action}</div> : null}
    </div>
  );
}
```

- [ ] **Step 6: Implement `RecordList`**

Create `src/records/RecordList.tsx`:

```tsx
import type { KeyboardEvent, ReactNode } from 'react';
import { EmptyState } from './EmptyState.js';
import type { RecordDensity, RecordSelectionState } from './types.js';
import { cn } from '../primitives/cn.js';

export interface RecordListProps<T> {
  items: readonly T[];
  getKey(item: T): string;
  renderPrimary(item: T): ReactNode;
  renderSecondary?(item: T): ReactNode;
  renderMeta?(item: T): ReactNode;
  renderStatus?(item: T): ReactNode;
  renderActions?(item: T): ReactNode;
  onActivate?(item: T): void;
  selection?: RecordSelectionState<T>;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  density?: RecordDensity;
  ariaLabel?: string;
  className?: string;
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ';
}

export function RecordList<T>({
  items,
  getKey,
  renderPrimary,
  renderSecondary,
  renderMeta,
  renderStatus,
  renderActions,
  onActivate,
  selection,
  loading = false,
  error,
  empty,
  density = 'comfortable',
  ariaLabel,
  className,
}: RecordListProps<T>) {
  if (loading) {
    return (
      <div className={cn('pdui-record-list', className)} role="status">
        Loading records
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('pdui-record-list', className)} role="alert">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return <>{empty ?? <EmptyState title="No records" />}</>;
  }

  return (
    <div className={cn('pdui-record-list', className)} data-density={density} role="list" aria-label={ariaLabel}>
      {items.map((item) => {
        const key = getKey(item);
        const disabled = selection?.isItemDisabled?.(item) ?? false;
        const selected = selection?.selectedKeys.has(key) ?? false;
        const activatable = Boolean(onActivate) && !disabled;

        return (
          <div
            key={key}
            className="pdui-record-list__item"
            role="listitem"
            aria-label={String(renderPrimary(item))}
            aria-selected={selected || undefined}
            aria-disabled={disabled || undefined}
            tabIndex={activatable ? 0 : undefined}
            onClick={() => {
              if (activatable) onActivate?.(item);
            }}
            onKeyDown={(event) => {
              if (!activatable || !isActivationKey(event)) return;
              event.preventDefault();
              onActivate?.(item);
            }}
          >
            <div className="pdui-record-list__content">
              <div className="pdui-record-list__primary">{renderPrimary(item)}</div>
              {renderSecondary ? <div className="pdui-record-list__secondary">{renderSecondary(item)}</div> : null}
              {renderMeta ? <div className="pdui-record-list__meta">{renderMeta(item)}</div> : null}
            </div>
            {renderStatus ? <div className="pdui-record-list__status">{renderStatus(item)}</div> : null}
            {renderActions ? (
              <div
                className="pdui-record-list__actions"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {renderActions(item)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 7: Add CSS**

Append this block to `theme/primitives.css`:

```css
.pdui-empty-state {
  align-items: center;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  color: var(--ink-2);
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  padding: var(--space-6);
  text-align: center;
}

.pdui-empty-state[data-tone='danger'] {
  border-color: var(--mismatch);
  color: var(--mismatch);
}

.pdui-empty-state__title {
  color: var(--ink-1);
  font-weight: 600;
}

.pdui-empty-state__description {
  color: var(--ink-3);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.pdui-record-list {
  display: grid;
  gap: var(--space-2);
}

.pdui-record-list__item {
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(0, 1fr) auto auto;
  min-height: 44px;
  padding: var(--space-3);
}

.pdui-record-list[data-density='compact'] .pdui-record-list__item {
  min-height: 36px;
  padding: var(--space-2);
}

.pdui-record-list__item[tabindex='0'] {
  cursor: pointer;
}

.pdui-record-list__item[aria-selected='true'] {
  border-color: var(--accent);
}

.pdui-record-list__item[aria-disabled='true'] {
  opacity: 0.6;
}

.pdui-record-list__primary {
  color: var(--ink-1);
  font-weight: 600;
  min-width: 0;
}

.pdui-record-list__secondary,
.pdui-record-list__meta {
  color: var(--ink-3);
  font-size: var(--text-sm);
  min-width: 0;
}
```

If any token name is missing, use the closest existing semantic token from `theme/tokens.css`; do not use hex literals.

- [ ] **Step 8: Export records foundation**

Update `src/records/index.ts`:

```ts
export { EmptyState } from './EmptyState.js';
export type { EmptyStateProps, RecordDensity, RecordSelectionState, RecordTone } from './types.js';
export { RecordList } from './RecordList.js';
export type { RecordListProps } from './RecordList.js';
```

- [ ] **Step 9: Add Storybook story**

Create `src/records/RecordList.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { EmptyState } from './EmptyState.js';
import { RecordList } from './RecordList.js';

const rows = [
  { id: 'alpha', name: 'Alpha project', meta: '12 pages', status: 'Ready' },
  { id: 'beta', name: 'Beta project with a longer name', meta: '4 pages', status: 'Running' },
];

const meta = {
  title: 'Records/RecordList',
  component: RecordList,
} satisfies Meta<typeof RecordList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RecordList
      ariaLabel="Projects"
      items={rows}
      getKey={(row) => row.id}
      renderPrimary={(row) => row.name}
      renderSecondary={(row) => row.id}
      renderMeta={(row) => row.meta}
      renderStatus={(row) => row.status}
      renderActions={() => <Button size="sm">Open</Button>}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <RecordList
      items={[]}
      getKey={(row: (typeof rows)[number]) => row.id}
      renderPrimary={(row) => row.name}
      empty={<EmptyState title="No projects" description="Open a source folder to get started." />}
    />
  ),
};
```

- [ ] **Step 10: Run focused tests**

```bash
pnpm exec vitest run src/records/EmptyState.test.tsx src/records/RecordList.test.tsx
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/records theme/primitives.css
git commit -m "feat(records): add empty state and record list"
```

---

### Task 3: DataTable And RecordGrid

**Files:**
- Create: `src/records/DataTable.tsx`
- Create: `src/records/DataTable.test.tsx`
- Create: `src/records/RecordGrid.tsx`
- Create: `src/records/RecordGrid.test.tsx`
- Create: `src/records/DataTable.stories.tsx`
- Create: `src/records/RecordGrid.stories.tsx`
- Modify: `src/records/types.ts`
- Modify: `src/records/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Add table/grid types**

Extend `src/records/types.ts`:

```ts
export interface DataTableSortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell(item: T): ReactNode;
  align?: 'start' | 'center' | 'end';
  width?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
  sortKey?: string;
}
```

- [ ] **Step 2: Write failing `DataTable` tests**

Create `src/records/DataTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable.js';

const rows = [
  { id: '1', name: 'Page 1', status: 'done' },
  { id: '2', name: 'Page 2', status: 'running' },
];

describe('DataTable', () => {
  it('renders headers and cells', () => {
    render(
      <DataTable
        ariaLabel="Pages"
        items={rows}
        getKey={(row) => row.id}
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'status', header: 'Status', cell: (row) => row.status },
        ]}
      />,
    );

    expect(screen.getByRole('table', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Page 1' })).toBeInTheDocument();
  });

  it('activates rows with click and keyboard', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <DataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        onActivate={onActivate}
      />,
    );

    const row = screen.getByRole('row', { name: /Page 1/ });
    await user.click(row);
    row.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it('updates sort when sortable header is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name, sortKey: 'name' }]}
        sort={{ key: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });
});
```

- [ ] **Step 3: Write failing `RecordGrid` tests**

Create `src/records/RecordGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecordGrid } from './RecordGrid.js';

const rows = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Beta' },
];

describe('RecordGrid', () => {
  it('renders cards in a grid', () => {
    render(
      <RecordGrid
        ariaLabel="Projects"
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => <article>{row.title}</article>}
      />,
    );

    expect(screen.getByRole('list', { name: 'Projects' })).toHaveAttribute('data-layout', 'grid');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('activates cards with keyboard', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <RecordGrid
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => row.title}
        onActivate={onActivate}
      />,
    );

    const item = screen.getByRole('listitem', { name: /Alpha/ });
    item.focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledWith(rows[0]);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
pnpm exec vitest run src/records/DataTable.test.tsx src/records/RecordGrid.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 5: Implement `DataTable`**

Create `src/records/DataTable.tsx` with this behavior:

```tsx
import type { KeyboardEvent, ReactNode } from 'react';
import { EmptyState } from './EmptyState.js';
import type { DataTableColumn, DataTableSortState, RecordSelectionState } from './types.js';
import { cn } from '../primitives/cn.js';

export interface DataTableProps<T> {
  items: readonly T[];
  getKey(item: T): string;
  columns: readonly DataTableColumn<T>[];
  onActivate?(item: T): void;
  selection?: RecordSelectionState<T>;
  sort?: DataTableSortState;
  onSortChange?(sort: DataTableSortState): void;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ';
}

function nextSort(current: DataTableSortState | undefined, key: string): DataTableSortState {
  if (current?.key === key && current.direction === 'asc') return { key, direction: 'desc' };
  return { key, direction: 'asc' };
}

export function DataTable<T>({
  items,
  getKey,
  columns,
  onActivate,
  selection,
  sort,
  onSortChange,
  loading = false,
  error,
  empty,
  ariaLabel,
  className,
}: DataTableProps<T>) {
  if (loading) return <div role="status">Loading records</div>;
  if (error) return <div role="alert">{error}</div>;
  if (items.length === 0) return <>{empty ?? <EmptyState title="No records" />}</>;

  return (
    <table className={cn('pdui-data-table', className)} aria-label={ariaLabel}>
      <thead>
        <tr>
          {columns.map((column) => {
            const sorted = column.sortKey && sort?.key === column.sortKey ? sort.direction : undefined;
            return (
              <th
                key={column.id}
                aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                data-align={column.align}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.sortKey && onSortChange ? (
                  <button type="button" onClick={() => onSortChange(nextSort(sort, column.sortKey as string))}>
                    Sort by {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const key = getKey(item);
          const disabled = selection?.isItemDisabled?.(item) ?? false;
          const activatable = Boolean(onActivate) && !disabled;
          return (
            <tr
              key={key}
              aria-selected={selection?.selectedKeys.has(key) || undefined}
              aria-disabled={disabled || undefined}
              tabIndex={activatable ? 0 : undefined}
              onClick={() => {
                if (activatable) onActivate?.(item);
              }}
              onKeyDown={(event) => {
                if (!activatable || !isActivationKey(event)) return;
                event.preventDefault();
                onActivate?.(item);
              }}
            >
              {columns.map((column) => (
                <td key={column.id} data-align={column.align}>
                  {column.cell(item)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 6: Implement `RecordGrid`**

Create `src/records/RecordGrid.tsx`:

```tsx
import type { KeyboardEvent, ReactNode } from 'react';
import { EmptyState } from './EmptyState.js';
import type { RecordSelectionState } from './types.js';
import { cn } from '../primitives/cn.js';

export interface RecordGridProps<T> {
  items: readonly T[];
  getKey(item: T): string;
  renderCard(item: T): ReactNode;
  onActivate?(item: T): void;
  selection?: RecordSelectionState<T>;
  loading?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  minCardWidth?: string;
  ariaLabel?: string;
  className?: string;
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ';
}

export function RecordGrid<T>({
  items,
  getKey,
  renderCard,
  onActivate,
  selection,
  loading = false,
  error,
  empty,
  minCardWidth = '14rem',
  ariaLabel,
  className,
}: RecordGridProps<T>) {
  if (loading) return <div role="status">Loading records</div>;
  if (error) return <div role="alert">{error}</div>;
  if (items.length === 0) return <>{empty ?? <EmptyState title="No records" />}</>;

  return (
    <div
      className={cn('pdui-record-grid', className)}
      role="list"
      aria-label={ariaLabel}
      data-layout="grid"
      style={{ ['--pdui-record-grid-min' as string]: minCardWidth }}
    >
      {items.map((item) => {
        const key = getKey(item);
        const disabled = selection?.isItemDisabled?.(item) ?? false;
        const activatable = Boolean(onActivate) && !disabled;
        return (
          <div
            key={key}
            className="pdui-record-grid__item"
            role="listitem"
            aria-label={String(renderCard(item))}
            aria-selected={selection?.selectedKeys.has(key) || undefined}
            aria-disabled={disabled || undefined}
            tabIndex={activatable ? 0 : undefined}
            onClick={() => {
              if (activatable) onActivate?.(item);
            }}
            onKeyDown={(event) => {
              if (!activatable || !isActivationKey(event)) return;
              event.preventDefault();
              onActivate?.(item);
            }}
          >
            {renderCard(item)}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 7: Add CSS**

Append:

```css
.pdui-data-table {
  border-collapse: collapse;
  color: var(--ink-2);
  font-size: var(--text-sm);
  width: 100%;
}

.pdui-data-table th,
.pdui-data-table td {
  border-bottom: 1px solid var(--border-1);
  padding: var(--space-2) var(--space-3);
  text-align: start;
}

.pdui-data-table th[data-align='center'],
.pdui-data-table td[data-align='center'] {
  text-align: center;
}

.pdui-data-table th[data-align='end'],
.pdui-data-table td[data-align='end'] {
  text-align: end;
}

.pdui-data-table tr[tabindex='0'] {
  cursor: pointer;
}

.pdui-data-table tr[aria-selected='true'] {
  background: var(--accent-subtle);
}

.pdui-record-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(var(--pdui-record-grid-min), 1fr));
}

.pdui-record-grid__item {
  min-width: 0;
}

.pdui-record-grid__item[tabindex='0'] {
  cursor: pointer;
}
```

- [ ] **Step 8: Export modules**

Update `src/records/index.ts`:

```ts
export { DataTable } from './DataTable.js';
export type { DataTableProps } from './DataTable.js';
export { RecordGrid } from './RecordGrid.js';
export type { RecordGridProps } from './RecordGrid.js';
export type { DataTableColumn, DataTableSortState } from './types.js';
```

Keep the exports from Task 2.

- [ ] **Step 9: Add stories**

Create stories that render:

- `DataTable` with two columns and a sortable column;
- `RecordGrid` with three cards and one long title;
- an empty state variant for each.

Use `src/records/DataTable.stories.tsx` and `src/records/RecordGrid.stories.tsx`.

- [ ] **Step 10: Run focused tests**

```bash
pnpm exec vitest run src/records/DataTable.test.tsx src/records/RecordGrid.test.tsx
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/records theme/primitives.css
git commit -m "feat(records): add data table and record grid"
```

---

### Task 4: Rich List Toolbar

**Files:**
- Create: `src/records/SearchField.tsx`
- Create: `src/records/SearchField.test.tsx`
- Create: `src/records/CountFilterGroup.tsx`
- Create: `src/records/CountFilterGroup.test.tsx`
- Create: `src/records/SortSelect.tsx`
- Create: `src/records/ListToolbar.tsx`
- Create: `src/records/ListToolbar.test.tsx`
- Create: `src/records/ListToolbar.stories.tsx`
- Modify: `src/records/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests**

Create `src/records/SearchField.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField, ShortcutSearchField } from './SearchField.js';

describe('SearchField', () => {
  it('calls onValueChange and clears with Escape', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchField value="abc" onValueChange={onValueChange} onClear={onClear} ariaLabel="Search records" />);

    await user.type(screen.getByRole('searchbox', { name: 'Search records' }), 'd');
    await user.keyboard('{Escape}');

    expect(onValueChange).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('renders shortcut button and calls onShortcutClick', async () => {
    const user = userEvent.setup();
    const onShortcutClick = vi.fn();
    render(
      <ShortcutSearchField
        value=""
        onValueChange={() => undefined}
        ariaLabel="Quick search"
        shortcutLabel="Mod K"
        onShortcutClick={onShortcutClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Focus search Mod K' }));
    expect(onShortcutClick).toHaveBeenCalledOnce();
  });
});
```

Create `src/records/CountFilterGroup.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CountFilterGroup } from './CountFilterGroup.js';

describe('CountFilterGroup', () => {
  it('renders counts and updates active filter', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(
      <CountFilterGroup
        ariaLabel="Filter projects"
        activeId="all"
        onActiveChange={onActiveChange}
        filters={[
          { id: 'all', label: 'All', count: 4 },
          { id: 'running', label: 'Running', count: 1 },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'All 4' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Running 1' }));
    expect(onActiveChange).toHaveBeenCalledWith('running');
  });
});
```

Create `src/records/ListToolbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ListToolbar } from './ListToolbar.js';
import { SortSelect } from './SortSelect.js';

describe('ListToolbar and SortSelect', () => {
  it('lays out named toolbar regions', () => {
    render(
      <ListToolbar
        search={<input aria-label="Search" />}
        filters={<button type="button">All</button>}
        resultCount={<span>2 results</span>}
        actions={<button type="button">New</button>}
      />,
    );

    expect(screen.getByRole('toolbar')).toHaveTextContent('2 results');
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('changes sort value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SortSelect
        ariaLabel="Sort projects"
        value="name"
        onValueChange={onValueChange}
        options={[
          { value: 'name', label: 'Name' },
          { value: 'date', label: 'Date' },
        ]}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Sort projects'), 'date');
    expect(onValueChange).toHaveBeenCalledWith('date');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm exec vitest run src/records/SearchField.test.tsx src/records/CountFilterGroup.test.tsx src/records/ListToolbar.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement toolbar modules**

Create `src/records/SearchField.tsx`, `CountFilterGroup.tsx`, `SortSelect.tsx`, and `ListToolbar.tsx` using these prop contracts:

```tsx
export interface SearchFieldProps {
  value: string;
  onValueChange(value: string): void;
  placeholder?: string;
  ariaLabel: string;
  onClear?(): void;
  className?: string;
}

export interface ShortcutSearchFieldProps extends SearchFieldProps {
  shortcutLabel?: string;
  onShortcutClick?(): void;
  inputRef?: React.Ref<HTMLInputElement>;
}

export interface CountFilter {
  id: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface CountFilterGroupProps {
  filters: readonly CountFilter[];
  activeId: string;
  onActiveChange(id: string): void;
  ariaLabel: string;
  className?: string;
}

export interface SortOption {
  value: string;
  label: React.ReactNode;
}

export interface SortSelectProps {
  value: string;
  options: readonly SortOption[];
  onValueChange(value: string): void;
  ariaLabel: string;
  className?: string;
}

export interface ListToolbarProps {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  sort?: React.ReactNode;
  resultCount?: React.ReactNode;
  actions?: React.ReactNode;
  density?: 'compact' | 'comfortable';
  className?: string;
}
```

Implementation requirements:

- `SearchField` renders `<input type="search" role="searchbox">`.
- `ShortcutSearchField` renders a trailing button named `Focus search ${shortcutLabel}`.
- `CountFilterGroup` renders a `role="group"` wrapper and buttons with `aria-pressed`.
- `SortSelect` may use a native `<select>` for the first implementation.
- `ListToolbar` renders `role="toolbar"` and stable region class names.

- [ ] **Step 4: Add CSS**

Append token-only styles for:

```css
.pdui-list-toolbar { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.pdui-list-toolbar__spacer { flex: 1 1 auto; }
.pdui-search-field { align-items: center; display: inline-flex; gap: var(--space-1); }
.pdui-count-filter-group { display: inline-flex; flex-wrap: wrap; gap: var(--space-1); }
.pdui-count-filter-group__button[aria-pressed='true'] { border-color: var(--accent); color: var(--ink-1); }
```

Use existing button/input classes where possible.

- [ ] **Step 5: Export toolbar modules**

Update `src/records/index.ts`:

```ts
export { SearchField, ShortcutSearchField } from './SearchField.js';
export type { SearchFieldProps, ShortcutSearchFieldProps } from './SearchField.js';
export { CountFilterGroup } from './CountFilterGroup.js';
export type { CountFilter, CountFilterGroupProps } from './CountFilterGroup.js';
export { SortSelect } from './SortSelect.js';
export type { SortOption, SortSelectProps } from './SortSelect.js';
export { ListToolbar } from './ListToolbar.js';
export type { ListToolbarProps } from './ListToolbar.js';
```

- [ ] **Step 6: Add Storybook story**

Create `src/records/ListToolbar.stories.tsx` with default, compact, long text, and empty-result examples.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/records/SearchField.test.tsx src/records/CountFilterGroup.test.tsx src/records/ListToolbar.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/records theme/primitives.css
git commit -m "feat(records): add list toolbar controls"
```

---

### Task 5: Source Intake Kit

**Files:**
- Create: `src/source-intake/types.ts`
- Create: `src/source-intake/FileDropzone.tsx`
- Create: `src/source-intake/SourceKindSelector.tsx`
- Create: `src/source-intake/PathInputWithRecents.tsx`
- Create: `src/source-intake/SelectedSourceSummary.tsx`
- Create: `src/source-intake/DirectoryPickerDialog.tsx`
- Create: `src/source-intake/SourceIntake.test.tsx`
- Create: `src/source-intake/SourceIntake.stories.tsx`
- Modify: `src/source-intake/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests**

Create `src/source-intake/SourceIntake.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
import { FileDropzone } from './FileDropzone.js';
import { PathInputWithRecents } from './PathInputWithRecents.js';
import { SelectedSourceSummary } from './SelectedSourceSummary.js';
import { SourceKindSelector } from './SourceKindSelector.js';

describe('source intake kit', () => {
  it('accepts dropped files and ignores drops while disabled', async () => {
    const onFilesAccepted = vi.fn();
    const file = new File(['hello'], 'sample.txt', { type: 'text/plain' });
    const { rerender } = render(<FileDropzone label="Drop source" onFilesAccepted={onFilesAccepted} />);

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm exec vitest run src/source-intake/SourceIntake.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement source intake types**

Create `src/source-intake/types.ts`:

```ts
import type { ReactNode } from 'react';

export interface SourceKindOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectedSource {
  id: string;
  label: ReactNode;
  kind: 'file' | 'folder' | 'archive' | 'path' | 'other';
  meta?: ReactNode;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  kind: 'directory' | 'file';
  disabled?: boolean;
}
```

- [ ] **Step 4: Implement source intake components**

Implement components with the prop names from the spec. Keep each component in its own file.

Required behavior:

- `FileDropzone` uses an `<input type="file">` with an accessible label and calls `onFilesAccepted(Array.from(files))` unless disabled.
- `SourceKindSelector` renders buttons with `aria-pressed`.
- `PathInputWithRecents` renders recent paths as buttons.
- `SelectedSourceSummary` renders each source and `Remove ${label}` buttons when `onRemove` exists.
- `DirectoryPickerDialog` composes `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, and `Button`. It renders current path, path input labelled `Path`, directory entry buttons, cancel, and apply.

- [ ] **Step 5: Add CSS**

Append token-only classes:

```css
.pdui-file-dropzone { border: 1px dashed var(--border-2); border-radius: var(--radius-md); padding: var(--space-4); }
.pdui-file-dropzone[data-dragging='true'] { border-color: var(--accent); }
.pdui-source-kind-selector { display: grid; gap: var(--space-2); grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }
.pdui-selected-source-summary { display: grid; gap: var(--space-2); }
.pdui-directory-picker__entries { display: grid; gap: var(--space-1); max-height: 18rem; overflow: auto; }
```

- [ ] **Step 6: Export source intake modules**

Update `src/source-intake/index.ts`:

```ts
export { FileDropzone } from './FileDropzone.js';
export type { FileDropzoneProps } from './FileDropzone.js';
export { SourceKindSelector } from './SourceKindSelector.js';
export type { SourceKindSelectorProps } from './SourceKindSelector.js';
export { PathInputWithRecents } from './PathInputWithRecents.js';
export type { PathInputWithRecentsProps } from './PathInputWithRecents.js';
export { SelectedSourceSummary } from './SelectedSourceSummary.js';
export type { SelectedSourceSummaryProps } from './SelectedSourceSummary.js';
export { DirectoryPickerDialog } from './DirectoryPickerDialog.js';
export type { DirectoryPickerDialogProps } from './DirectoryPickerDialog.js';
export type { DirectoryEntry, SelectedSource, SourceKindOption } from './types.js';
```

- [ ] **Step 7: Add Storybook story**

Create `src/source-intake/SourceIntake.stories.tsx` with:

- dropzone default;
- source-kind selector;
- path input with recents;
- selected source summary;
- open directory picker with loading and error variants.

- [ ] **Step 8: Run focused tests**

```bash
pnpm exec vitest run src/source-intake/SourceIntake.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/source-intake theme/primitives.css
git commit -m "feat(source-intake): add shared source intake kit"
```

---

### Task 6: Zoom Viewport And Toolbar

**Files:**
- Create: `src/viewport/types.ts`
- Create: `src/viewport/ZoomViewport.tsx`
- Create: `src/viewport/ViewportToolbar.tsx`
- Create: `src/viewport/viewportMath.ts`
- Create: `src/viewport/viewportMath.test.ts`
- Create: `src/viewport/ZoomViewport.test.tsx`
- Create: `src/viewport/ZoomViewport.stories.tsx`
- Modify: `src/viewport/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write math tests**

Create `src/viewport/viewportMath.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clampZoom, resolveFitZoom } from './viewportMath.js';

describe('viewport math', () => {
  it('clamps zoom', () => {
    expect(clampZoom(0.1, 0.25, 4)).toBe(0.25);
    expect(clampZoom(8, 0.25, 4)).toBe(4);
    expect(clampZoom(1.5, 0.25, 4)).toBe(1.5);
  });

  it('resolves fit zoom', () => {
    expect(resolveFitZoom('none', { width: 100, height: 100 }, { width: 500, height: 300 })).toBe(1);
    expect(resolveFitZoom('fit-width', { width: 100, height: 50 }, { width: 500, height: 300 })).toBe(5);
    expect(resolveFitZoom('fit-height', { width: 100, height: 50 }, { width: 500, height: 300 })).toBe(6);
    expect(resolveFitZoom('fit-page', { width: 100, height: 50 }, { width: 500, height: 300 })).toBe(5);
  });
});
```

- [ ] **Step 2: Write component tests**

Create `src/viewport/ZoomViewport.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ViewportToolbar } from './ViewportToolbar.js';
import { ZoomViewport } from './ZoomViewport.js';

describe('ZoomViewport', () => {
  it('renders children at the configured zoom', () => {
    render(
      <ZoomViewport zoom={2} ariaLabel="Page viewport">
        <div>Page</div>
      </ZoomViewport>,
    );

    expect(screen.getByRole('region', { name: 'Page viewport' })).toHaveAttribute('data-zoom', '2');
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('toolbar changes zoom and clamps at bounds', async () => {
    const user = userEvent.setup();
    const onZoomChange = vi.fn();
    render(<ViewportToolbar zoom={1} minZoom={1} maxZoom={2} onZoomChange={onZoomChange} />);

    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onZoomChange).toHaveBeenCalledWith(1.25);
  });

  it('changes fit mode', async () => {
    const user = userEvent.setup();
    const onFitModeChange = vi.fn();
    render(
      <ViewportToolbar
        zoom={1}
        onZoomChange={() => undefined}
        fitMode="none"
        onFitModeChange={onFitModeChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Fit page' }));
    expect(onFitModeChange).toHaveBeenCalledWith('fit-page');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm exec vitest run src/viewport/viewportMath.test.ts src/viewport/ZoomViewport.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 4: Implement viewport types and math**

Create `src/viewport/types.ts`:

```ts
export type ZoomFitMode = 'none' | 'fit-width' | 'fit-height' | 'fit-page';

export interface ViewportSize {
  width: number;
  height: number;
}
```

Create `src/viewport/viewportMath.ts`:

```ts
import type { ViewportSize, ZoomFitMode } from './types.js';

export function clampZoom(value: number, minZoom: number, maxZoom: number) {
  return Math.min(maxZoom, Math.max(minZoom, value));
}

export function resolveFitZoom(mode: ZoomFitMode, content: ViewportSize, container: ViewportSize) {
  if (mode === 'none' || content.width <= 0 || content.height <= 0) return 1;
  const widthZoom = container.width / content.width;
  const heightZoom = container.height / content.height;
  if (mode === 'fit-width') return widthZoom;
  if (mode === 'fit-height') return heightZoom;
  return Math.min(widthZoom, heightZoom);
}
```

- [ ] **Step 5: Implement `ZoomViewport` and `ViewportToolbar`**

Create components with these props from the spec:

```tsx
export interface ZoomViewportProps {
  children: React.ReactNode;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?(zoom: number): void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  fitMode?: ZoomFitMode;
  onFitModeChange?(mode: ZoomFitMode): void;
  contentSize?: { width: number; height: number };
  ariaLabel?: string;
  className?: string;
}

export interface ViewportToolbarProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange(zoom: number): void;
  fitMode?: ZoomFitMode;
  onFitModeChange?(mode: ZoomFitMode): void;
  actions?: React.ReactNode;
  className?: string;
}
```

Implementation requirements:

- `ZoomViewport` renders `role="region"` when `ariaLabel` exists.
- `ZoomViewport` sets `data-zoom={resolvedZoom}`.
- `ZoomViewport` wraps children in an element with `transform: scale(resolvedZoom)`.
- `ViewportToolbar` renders buttons named `Zoom out`, `Zoom in`, `Reset zoom`, `Fit width`, `Fit height`, and `Fit page`.
- The zoom increment is `0.25`.

- [ ] **Step 6: Add CSS**

Append:

```css
.pdui-zoom-viewport { overflow: auto; position: relative; }
.pdui-zoom-viewport__content { transform-origin: top left; }
.pdui-viewport-toolbar { align-items: center; display: inline-flex; gap: var(--space-1); }
```

- [ ] **Step 7: Export viewport modules**

Update `src/viewport/index.ts`:

```ts
export { ZoomViewport } from './ZoomViewport.js';
export type { ZoomViewportProps } from './ZoomViewport.js';
export { ViewportToolbar } from './ViewportToolbar.js';
export type { ViewportToolbarProps } from './ViewportToolbar.js';
export { clampZoom, resolveFitZoom } from './viewportMath.js';
export type { ViewportSize, ZoomFitMode } from './types.js';
```

- [ ] **Step 8: Add Storybook story**

Create `src/viewport/ZoomViewport.stories.tsx` with default, fit-page, max zoom, min zoom, and narrow container examples.

- [ ] **Step 9: Run focused tests**

```bash
pnpm exec vitest run src/viewport/viewportMath.test.ts src/viewport/ZoomViewport.test.tsx
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/viewport theme/primitives.css
git commit -m "feat(viewport): add zoom viewport controls"
```

---

### Task 7: ArtifactViewer Viewport Extension

**Files:**
- Modify: `src/stages/PageWorkbench/ArtifactViewer.tsx`
- Modify: `src/stages/PageWorkbench/ArtifactViewer.test.tsx`
- Modify: `src/stages/PageWorkbench/ArtifactViewer.stories.tsx`
- Modify: `src/stages/PageWorkbench/index.ts`

- [ ] **Step 1: Locate current ArtifactViewer props**

Run:

```bash
sed -n '1,220p' src/stages/PageWorkbench/ArtifactViewer.tsx
```

Confirm the existing prop interface name. Use that exact interface name in the next steps.

- [ ] **Step 2: Add failing tests for viewport props**

In `src/stages/PageWorkbench/ArtifactViewer.test.tsx`, add:

```tsx
it('can render with the viewport toolbar enabled', () => {
  render(
    <ArtifactViewer
      imageUrl="/page.png"
      mode="view"
      showViewportToolbar
      defaultZoom={1}
      fitMode="none"
    />,
  );

  expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Fit page' })).toBeInTheDocument();
});
```

Adjust `imageUrl` and `mode` prop names only if the existing component uses different names. Keep the assertion names.

- [ ] **Step 3: Run focused test to verify it fails**

```bash
pnpm exec vitest run src/stages/PageWorkbench/ArtifactViewer.test.tsx
```

Expected: FAIL because `showViewportToolbar`, `defaultZoom`, or `fitMode` is not accepted or rendered.

- [ ] **Step 4: Extend ArtifactViewer props**

Import:

```ts
import { ViewportToolbar, ZoomViewport, type ZoomFitMode } from '../../viewport/index.js';
```

Add optional props to the existing `ArtifactViewer` props interface:

```ts
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?(zoom: number): void;
  fitMode?: ZoomFitMode;
  onFitModeChange?(mode: ZoomFitMode): void;
  showViewportToolbar?: boolean;
```

- [ ] **Step 5: Compose viewport controls without changing existing modes**

Wrap the existing viewer body in `ZoomViewport` only when a viewport prop is present:

```tsx
const usesViewport =
  showViewportToolbar ||
  zoom != null ||
  defaultZoom != null ||
  fitMode != null ||
  onZoomChange != null ||
  onFitModeChange != null;
```

Render:

```tsx
{showViewportToolbar ? (
  <ViewportToolbar
    zoom={zoom ?? defaultZoom ?? 1}
    onZoomChange={onZoomChange ?? (() => undefined)}
    fitMode={fitMode}
    onFitModeChange={onFitModeChange}
  />
) : null}
{usesViewport ? (
  <ZoomViewport zoom={zoom} defaultZoom={defaultZoom} onZoomChange={onZoomChange} fitMode={fitMode} onFitModeChange={onFitModeChange}>
    {existingViewerBody}
  </ZoomViewport>
) : (
  existingViewerBody
)}
```

Replace `existingViewerBody` with the local JSX currently returned by `ArtifactViewer`. Do not duplicate its internals in two branches.

- [ ] **Step 6: Update story**

Add a `WithViewportToolbar` story to `src/stages/PageWorkbench/ArtifactViewer.stories.tsx` using the same sample image data as existing stories.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/stages/PageWorkbench/ArtifactViewer.test.tsx src/viewport/ZoomViewport.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/stages/PageWorkbench src/viewport
git commit -m "feat(page-workbench): add artifact viewport controls"
```

---

### Task 8: Async Settings Kit

**Files:**
- Create: `src/settings/SettingsCard.tsx`
- Create: `src/settings/SettingsRow.tsx`
- Create: `src/settings/SettingsValue.tsx`
- Create: `src/settings/SettingSlider.tsx`
- Create: `src/settings/SettingsAsyncSection.tsx`
- Create: `src/settings/PreferencePathRow.tsx`
- Create: `src/settings/StatusActionRow.tsx`
- Create: `src/settings/GuidancePanel.tsx`
- Create: `src/settings/SettingsKit.test.tsx`
- Create: `src/settings/SettingsKit.stories.tsx`
- Modify: `src/settings/index.ts`
- Modify: `src/primitives/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests**

Create `src/settings/SettingsKit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GuidancePanel } from './GuidancePanel.js';
import { PreferencePathRow } from './PreferencePathRow.js';
import { SettingSlider } from './SettingSlider.js';
import { SettingsAsyncSection } from './SettingsAsyncSection.js';
import { SettingsCard } from './SettingsCard.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue } from './SettingsValue.js';
import { StatusActionRow } from './StatusActionRow.js';

describe('settings kit', () => {
  it('renders settings card, row and value', () => {
    render(
      <SettingsCard title="OCR" description="OCR settings" actions={<button type="button">Reset</button>}>
        <SettingsRow label="Language" description="OCR language" value={<SettingsValue>eng</SettingsValue>} />
      </SettingsCard>,
    );

    expect(screen.getByText('OCR')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('eng')).toHaveAttribute('data-tone', 'neutral');
  });

  it('changes slider values and clamps range', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SettingSlider value={5} onValueChange={onValueChange} min={0} max={10} step={1} unit="px" ariaLabel="Threshold" />);

    const slider = screen.getByRole('slider', { name: 'Threshold' });
    expect(screen.getByText('5 px')).toBeInTheDocument();
    await user.type(slider, '{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(6);
  });

  it('renders async loading, saving and error states', () => {
    const { rerender } = render(<SettingsAsyncSection title="Models" state="loading">Ready body</SettingsAsyncSection>);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    rerender(<SettingsAsyncSection title="Models" state="saving">Ready body</SettingsAsyncSection>);
    expect(screen.getByRole('status')).toHaveTextContent('Saving');

    rerender(<SettingsAsyncSection title="Models" state="error" error="Failed">Ready body</SettingsAsyncSection>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('calls path row save and reset callbacks', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onReset = vi.fn();
    render(<PreferencePathRow label="Jobs location" path="/tmp/jobs" onPathChange={() => undefined} onSave={onSave} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: 'Save Jobs location' }));
    await user.click(screen.getByRole('button', { name: 'Reset Jobs location' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('renders status action and guidance panels', () => {
    render(
      <>
        <StatusActionRow label="Cache" status="Ready" action={<button type="button">Refresh</button>} />
        <GuidancePanel title="CUDA setup" tone="info">Install matching drivers.</GuidancePanel>
      </>,
    );

    expect(screen.getByText('Cache')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByText('CUDA setup')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run src/settings/SettingsKit.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement settings components**

Create each component with the prop names from the spec. Required behavior:

- `SettingsCard` renders title, optional description, badge, actions, and children.
- `SettingsRow` renders label, description, value, control, actions, disabled, and error.
- `SettingsValue` sets `data-tone` and optional mono style.
- `SettingSlider` uses `<input type="range">`, clamps in `onChange`, and renders the current value plus unit.
- `SettingsAsyncSection` renders loading and saving as `role="status"` and error as `role="alert"`.
- `PreferencePathRow` uses `Input` and `Button`, with buttons named `Save ${label}` and `Reset ${label}`.
- `StatusActionRow` renders label, description, status, action, and details.
- `GuidancePanel` renders title, children, actions, and `data-tone`.

- [ ] **Step 4: Add CSS**

Append:

```css
.pdui-settings-card { border: 1px solid var(--border-1); border-radius: var(--radius-md); background: var(--bg-surface); padding: var(--space-4); }
.pdui-settings-row { align-items: center; display: grid; gap: var(--space-3); grid-template-columns: minmax(0, 1fr) auto auto; padding: var(--space-3) 0; }
.pdui-settings-row + .pdui-settings-row { border-top: 1px solid var(--border-1); }
.pdui-settings-value[data-mono='true'] { font-family: var(--mono-font); }
.pdui-settings-async-section { display: grid; gap: var(--space-3); }
.pdui-guidance-panel { border: 1px solid var(--border-1); border-radius: var(--radius-md); padding: var(--space-3); }
```

- [ ] **Step 5: Export settings modules**

Update `src/settings/index.ts`:

```ts
export { SettingsCard } from './SettingsCard.js';
export type { SettingsCardProps } from './SettingsCard.js';
export { SettingsRow } from './SettingsRow.js';
export type { SettingsRowProps } from './SettingsRow.js';
export { SettingsValue } from './SettingsValue.js';
export type { SettingsValueProps } from './SettingsValue.js';
export { SettingSlider } from './SettingSlider.js';
export type { SettingSliderProps } from './SettingSlider.js';
export { SettingsAsyncSection } from './SettingsAsyncSection.js';
export type { SettingsAsyncSectionProps } from './SettingsAsyncSection.js';
export { PreferencePathRow } from './PreferencePathRow.js';
export type { PreferencePathRowProps } from './PreferencePathRow.js';
export { StatusActionRow } from './StatusActionRow.js';
export type { StatusActionRowProps } from './StatusActionRow.js';
export { GuidancePanel } from './GuidancePanel.js';
export type { GuidancePanelProps } from './GuidancePanel.js';
```

Also add these broadly useful exports to `src/primitives/index.ts`:

```ts
export { SettingsCard, SettingsRow, SettingsValue, SettingSlider } from '../settings/index.js';
export type { SettingsCardProps, SettingsRowProps, SettingsValueProps, SettingSliderProps } from '../settings/index.js';
```

- [ ] **Step 6: Add Storybook story**

Create `src/settings/SettingsKit.stories.tsx` with default, loading, saving, error, disabled, long text, and compact row examples.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/settings/SettingsKit.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/settings src/primitives/index.ts theme/primitives.css
git commit -m "feat(settings): add async settings kit"
```

---

### Task 9: Operation Status Kit

**Files:**
- Create: `src/status/OperationStatusPanel.tsx`
- Create: `src/status/BlockingOperationOverlay.tsx`
- Create: `src/status/RetryActionPanel.tsx`
- Create: `src/status/OperationStatus.test.tsx`
- Create: `src/status/OperationStatus.stories.tsx`
- Modify: `src/status/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests**

Create `src/status/OperationStatus.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlockingOperationOverlay } from './BlockingOperationOverlay.js';
import { OperationStatusPanel } from './OperationStatusPanel.js';
import { RetryActionPanel } from './RetryActionPanel.js';

describe('operation status kit', () => {
  it('renders state, progress and actions', () => {
    render(
      <OperationStatusPanel
        title="OCR running"
        message="Processing page 3"
        state="running"
        progress={45}
        primaryAction={<button type="button">Open</button>}
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'running');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders a blocking overlay with live region semantics', () => {
    render(<BlockingOperationOverlay open message="Saving project" cancelAction={<button type="button">Cancel</button>} bestEffortCancel />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Saving project')).toBeInTheDocument();
    expect(screen.getByText(/best effort/i)).toBeInTheDocument();
  });

  it('does not render a closed overlay', () => {
    render(<BlockingOperationOverlay open={false} message="Saving project" />);
    expect(screen.queryByText('Saving project')).not.toBeInTheDocument();
  });

  it('renders retry panels', () => {
    render(<RetryActionPanel title="OCR failed" error="Timeout" retryAction={<button type="button">Retry</button>} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Timeout');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run src/status/OperationStatus.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement status modules**

Implement with these prop names:

```tsx
export type OperationState = 'idle' | 'queued' | 'running' | 'success' | 'warning' | 'error';

export interface OperationStatusPanelProps {
  title: React.ReactNode;
  message?: React.ReactNode;
  state: OperationState;
  progress?: number;
  details?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export interface BlockingOperationOverlayProps {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  progress?: number;
  cancelAction?: React.ReactNode;
  bestEffortCancel?: boolean;
  ariaLabel?: string;
  className?: string;
}

export interface RetryActionPanelProps {
  title: React.ReactNode;
  message?: React.ReactNode;
  error?: React.ReactNode;
  retryAction?: React.ReactNode;
  detailsAction?: React.ReactNode;
  className?: string;
}
```

Required behavior:

- clamp progress to 0 through 100 before rendering;
- render `role="progressbar"` only when progress exists;
- `OperationStatusPanel` uses `role="alert"` for error state and `role="status"` otherwise;
- `BlockingOperationOverlay` returns `null` when `open` is false;
- `RetryActionPanel` renders error in `role="alert"` when error exists.

- [ ] **Step 4: Add CSS**

Append:

```css
.pdui-operation-status-panel { border: 1px solid var(--border-1); border-radius: var(--radius-md); display: grid; gap: var(--space-3); padding: var(--space-4); }
.pdui-blocking-operation-overlay { align-items: center; background: var(--overlay-scrim); display: flex; inset: 0; justify-content: center; position: fixed; z-index: 50; }
.pdui-blocking-operation-overlay__panel { background: var(--bg-surface); border: 1px solid var(--border-2); border-radius: var(--radius-md); padding: var(--space-5); }
.pdui-retry-action-panel { border: 1px solid var(--mismatch); border-radius: var(--radius-md); padding: var(--space-4); }
```

- [ ] **Step 5: Export status modules**

Update `src/status/index.ts`:

```ts
export { OperationStatusPanel } from './OperationStatusPanel.js';
export type { OperationState, OperationStatusPanelProps } from './OperationStatusPanel.js';
export { BlockingOperationOverlay } from './BlockingOperationOverlay.js';
export type { BlockingOperationOverlayProps } from './BlockingOperationOverlay.js';
export { RetryActionPanel } from './RetryActionPanel.js';
export type { RetryActionPanelProps } from './RetryActionPanel.js';
```

- [ ] **Step 6: Add Storybook story**

Create `src/status/OperationStatus.stories.tsx` with idle, queued, running, success, warning, error, overlay open, overlay closed, and retry examples.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/status/OperationStatus.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/status theme/primitives.css
git commit -m "feat(status): add operation status kit"
```

---

### Task 10: Workbench Layout Kit

**Files:**
- Create: `src/workbench/WorkbenchLayout.tsx`
- Create: `src/workbench/InspectorPanel.tsx`
- Create: `src/workbench/DetailPanelShell.tsx`
- Create: `src/workbench/WorkbenchLayout.test.tsx`
- Create: `src/workbench/WorkbenchLayout.stories.tsx`
- Modify: `src/workbench/index.ts`
- Modify: `theme/primitives.css`

- [ ] **Step 1: Write failing tests**

Create `src/workbench/WorkbenchLayout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailPanelShell } from './DetailPanelShell.js';
import { InspectorPanel } from './InspectorPanel.js';
import { WorkbenchLayout } from './WorkbenchLayout.js';

describe('workbench layout kit', () => {
  it('renders two-pane and three-pane workbench regions', () => {
    render(
      <WorkbenchLayout
        header={<h1>Workbench</h1>}
        toolbar={<button type="button">Run</button>}
        navigation={<nav aria-label="Pages">Pages</nav>}
        viewer={<div>Viewer</div>}
        inspector={<aside>Inspector</aside>}
        footer={<button type="button">Apply</button>}
      />,
    );

    expect(screen.getByRole('region', { name: 'Workbench layout' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('renders without optional side areas', () => {
    render(<WorkbenchLayout viewer={<div>Viewer only</div>} />);
    expect(screen.getByText('Viewer only')).toBeInTheDocument();
  });

  it('renders inspector and detail panel actions', () => {
    render(
      <>
        <InspectorPanel title="Details" actions={<button type="button">Save</button>}>Body</InspectorPanel>
        <DetailPanelShell title="Page 1" meta="300 dpi" actions={<button type="button">Open</button>}>Detail body</DetailPanelShell>
      </>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('300 dpi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run src/workbench/WorkbenchLayout.test.tsx
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement layout modules**

Create components with prop contracts from the spec.

Implementation requirements:

- `WorkbenchLayout` renders `role="region"` and `aria-label="Workbench layout"`.
- `WorkbenchLayout` sets CSS variables `--pdui-workbench-nav-w` and `--pdui-workbench-inspector-w` from prop values.
- `WorkbenchLayout` only renders optional regions when the matching slot exists.
- `InspectorPanel` and `DetailPanelShell` render title, meta/description, actions, children, and footer in stable named regions.

- [ ] **Step 4: Add CSS**

Append:

```css
.pdui-workbench-layout { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; min-height: 0; }
.pdui-workbench-layout__body { display: grid; gap: var(--space-3); grid-template-columns: var(--pdui-workbench-nav-w, 0) minmax(0, 1fr) var(--pdui-workbench-inspector-w, 0); min-height: 0; }
.pdui-workbench-layout__viewer { min-width: 0; min-height: 0; overflow: auto; }
.pdui-inspector-panel,
.pdui-detail-panel-shell { border-left: 1px solid var(--border-1); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; min-height: 0; }
@media (max-width: 720px) {
  .pdui-workbench-layout__body { grid-template-columns: minmax(0, 1fr); }
}
```

- [ ] **Step 5: Export workbench modules**

Update `src/workbench/index.ts`:

```ts
export { WorkbenchLayout } from './WorkbenchLayout.js';
export type { WorkbenchLayoutProps } from './WorkbenchLayout.js';
export { InspectorPanel } from './InspectorPanel.js';
export type { InspectorPanelProps } from './InspectorPanel.js';
export { DetailPanelShell } from './DetailPanelShell.js';
export type { DetailPanelShellProps } from './DetailPanelShell.js';
```

- [ ] **Step 6: Add Storybook story**

Create `src/workbench/WorkbenchLayout.stories.tsx` with:

- two-pane viewer plus inspector;
- three-pane navigation, viewer, inspector;
- viewer-only;
- long text;
- narrow viewport example.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/workbench/WorkbenchLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/workbench theme/primitives.css
git commit -m "feat(workbench): add shared workbench layout shells"
```

---

### Task 11: Final Export Guards, Stories, Formatting, And CI

**Files:**
- Modify: `tests/build.contract.test.ts`
- Modify: `tests/pack.contract.test.ts`
- Modify: `src/records/index.ts`
- Modify: `src/source-intake/index.ts`
- Modify: `src/viewport/index.ts`
- Modify: `src/settings/index.ts`
- Modify: `src/status/index.ts`
- Modify: `src/workbench/index.ts`
- Modify: `README.md`
- Modify: `docs/usage/consumer-bootstrap.md`

- [ ] **Step 1: Add final symbol guards**

In `tests/build.contract.test.ts`, replace the sentinel-only `REQUIRED` map from Task 1 with real required symbols:

```ts
  const REQUIRED = {
    records: ['RecordList', 'DataTable', 'RecordGrid', 'EmptyState', 'ListToolbar', 'SearchField'],
    'source-intake': ['FileDropzone', 'SourceKindSelector', 'PathInputWithRecents', 'DirectoryPickerDialog'],
    viewport: ['ZoomViewport', 'ViewportToolbar', 'ZoomFitMode'],
    settings: ['SettingsCard', 'SettingsRow', 'SettingSlider', 'SettingsAsyncSection'],
    status: ['OperationStatusPanel', 'BlockingOperationOverlay', 'RetryActionPanel'],
    workbench: ['WorkbenchLayout', 'InspectorPanel', 'DetailPanelShell'],
  } as const;
```

Update the loop:

```ts
  for (const [entry, symbols] of Object.entries(REQUIRED)) {
    for (const symbol of symbols) {
      it(`dist/${entry}.d.ts exports ${symbol}`, () => {
        const dtsPath = resolve(__dirname, `../dist/${entry}.d.ts`);
        expect(existsSync(dtsPath), `dist/${entry}.d.ts missing - run pnpm build`).toBe(true);
        const content = readFileSync(dtsPath, 'utf-8');
        expect(content, `${symbol} must be exported from dist/${entry}.d.ts`).toContain(symbol);
      });
    }
  }
```

- [ ] **Step 2: Add usage docs**

In `README.md`, add a short section named `Cross-app modules`:

```md
## Cross-app modules

`pdomain-ui` exports presentation-only modules for repeated suite patterns:

- `@pdomain/pdomain-ui/records`
- `@pdomain/pdomain-ui/source-intake`
- `@pdomain/pdomain-ui/viewport`
- `@pdomain/pdomain-ui/settings`
- `@pdomain/pdomain-ui/status`
- `@pdomain/pdomain-ui/workbench`

These modules render typed UI and call app callbacks. Apps still own data
loading, routing, jobs, OCR policy, source validation, and stage machines.
```

In `docs/usage/consumer-bootstrap.md`, add the same import guidance near the existing package import section.

- [ ] **Step 3: Run format**

```bash
pnpm format
```

Expected: Prettier updates only files touched by this plan.

- [ ] **Step 4: Run focused test sweep**

```bash
pnpm exec vitest run src/records src/source-intake src/viewport src/settings src/status src/workbench src/stages/PageWorkbench/ArtifactViewer.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run full CI**

```bash
make ci AI=1
```

Expected: PASS. If CI emits jsdom console errors from tests that assert provider guard behavior, confirm the final exit code is still 0.

- [ ] **Step 6: Inspect public package output**

```bash
ls dist | rg 'records|source-intake|viewport|settings|status|workbench'
```

Expected output includes:

```text
records.d.ts
records.js
settings.d.ts
settings.js
source-intake.d.ts
source-intake.js
status.d.ts
status.js
viewport.d.ts
viewport.js
workbench.d.ts
workbench.js
```

- [ ] **Step 7: Commit**

```bash
git add README.md docs/usage/consumer-bootstrap.md tests/build.contract.test.ts tests/pack.contract.test.ts src theme/primitives.css package.json vite.config.ts
git commit -m "feat: add cross-app common ui modules"
```

---

## Parallel Agent Notes

Safe parallel groups after Task 1 is merged:

- Task 2 and Task 4 should be sequential because toolbar exports live in `src/records`.
- Task 5, Task 6, Task 8, Task 9, and Task 10 can run in parallel after Task 1.
- Task 7 depends on Task 6.
- Task 11 depends on every feature task.

Suggested subagent assignment:

- Agent A: Tasks 2, 3, and 4.
- Agent B: Task 5.
- Agent C: Tasks 6 and 7.
- Agent D: Task 8.
- Agent E: Task 9.
- Agent F: Task 10.
- Integrator: Task 11.

Each agent must work in its own branch or worktree and commit only its task files.

## Self-Review Checklist

- Spec coverage: all seven module families from `docs/specs/2026-06-15-cross-app-common-ui-modules-design.md` map to tasks.
- Export coverage: every public subpath has Vite, package, build contract, and pack contract coverage.
- Type consistency: shared names are `RecordSelectionState`, `DataTableSortState`, and `ZoomFitMode`.
- Consumer boundary: no task edits consumer apps or moves app state into pdomain-ui.
- Verification: focused tests after each task, `pnpm build` for package output, and `make ci AI=1` at final integration.
