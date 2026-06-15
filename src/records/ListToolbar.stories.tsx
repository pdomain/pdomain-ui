import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { CountFilterGroup } from './CountFilterGroup.js';
import { ListToolbar } from './ListToolbar.js';
import { SearchField, ShortcutSearchField } from './SearchField.js';
import { SortSelect } from './SortSelect.js';

const filterOptions = [
  { id: 'all', label: 'All', count: 18 },
  { id: 'running', label: 'Running', count: 3 },
  { id: 'review', label: 'Review', count: 6 },
  { id: 'done', label: 'Done', count: 9 },
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Last updated' },
  { value: 'status', label: 'Status' },
];

interface ToolbarExampleProps {
  density?: 'compact' | 'comfortable';
  resultCount: string;
  searchPlaceholder?: string;
  useShortcutSearch?: boolean;
}

function ToolbarExample({
  density,
  resultCount,
  searchPlaceholder = 'Search projects',
  useShortcutSearch = false,
}: ToolbarExampleProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const search = useShortcutSearch ? (
    <ShortcutSearchField
      value={query}
      onValueChange={setQuery}
      onClear={() => setQuery('')}
      ariaLabel="Quick search"
      placeholder={searchPlaceholder}
      shortcutLabel="Mod K"
      onShortcutClick={() => undefined}
    />
  ) : (
    <SearchField
      value={query}
      onValueChange={setQuery}
      onClear={() => setQuery('')}
      ariaLabel="Search projects"
      placeholder={searchPlaceholder}
    />
  );

  return (
    <ListToolbar
      {...(density !== undefined ? { density } : {})}
      search={search}
      filters={
        <CountFilterGroup
          ariaLabel="Filter projects"
          activeId={activeFilter}
          onActiveChange={setActiveFilter}
          filters={filterOptions}
        />
      }
      sort={
        <SortSelect
          ariaLabel="Sort projects"
          value={sort}
          onValueChange={setSort}
          options={sortOptions}
        />
      }
      resultCount={<span>{resultCount}</span>}
      actions={
        <Button type="button" size="sm">
          New
        </Button>
      }
    />
  );
}

const meta = {
  title: 'Records/ListToolbar',
  component: ListToolbar,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ListToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ToolbarExample resultCount="18 results" useShortcutSearch />,
};

export const Compact: Story = {
  render: () => <ToolbarExample density="compact" resultCount="18 results" />,
};

export const LongText: Story = {
  render: () => (
    <ToolbarExample
      resultCount="128 matching records across imported projects"
      searchPlaceholder="Search by project name, source folder, operator, or current processing status"
      useShortcutSearch
    />
  ),
};

export const EmptyResults: Story = {
  render: () => <ToolbarExample resultCount="No results" />,
};
