import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState.js';
import { DataTable } from './DataTable.js';

const rows = [
  { id: 'page-1', name: 'Page 1', status: 'Done' },
  { id: 'page-2', name: 'Page 2', status: 'Running' },
];

type PageRow = (typeof rows)[number];
const PageDataTable = DataTable<PageRow>;

const meta = {
  title: 'Records/DataTable',
  component: PageDataTable,
} satisfies Meta<typeof PageDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Pages',
    items: rows,
    getKey: (row) => row.id,
    columns: [
      { id: 'name', header: 'Name', cell: (row) => row.name, sortKey: 'name' },
      { id: 'status', header: 'Status', cell: (row) => row.status, align: 'end' },
    ],
    sort: { key: 'name', direction: 'asc' },
    onSortChange: () => undefined,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    getKey: (row) => row.id,
    columns: [
      { id: 'name', header: 'Name', cell: (row) => row.name, sortKey: 'name' },
      { id: 'status', header: 'Status', cell: (row) => row.status },
    ],
    empty: <EmptyState title="No pages" description="Run OCR to populate this table." />,
  },
};
