import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../primitives/Card.js';
import { EmptyState } from './EmptyState.js';
import { RecordGrid } from './RecordGrid.js';

const rows = [
  { id: 'alpha', title: 'Alpha project', meta: '12 pages' },
  {
    id: 'beta',
    title: 'Beta project with a deliberately long title for wrapping',
    meta: '4 pages',
  },
  { id: 'gamma', title: 'Gamma project', meta: '22 pages' },
];

type ProjectRow = (typeof rows)[number];
const ProjectRecordGrid = RecordGrid<ProjectRow>;

const meta = {
  title: 'Records/RecordGrid',
  component: ProjectRecordGrid,
} satisfies Meta<typeof ProjectRecordGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Projects',
    items: rows,
    getKey: (row) => row.id,
    renderCard: (row) => (
      <Card style={{ padding: 'var(--space-3)' }}>
        <div style={{ color: 'var(--ink-1)', fontWeight: 600, minWidth: 0 }}>{row.title}</div>
        <div
          style={{ color: 'var(--ink-3)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}
        >
          {row.meta}
        </div>
      </Card>
    ),
  },
};

export const Empty: Story = {
  args: {
    items: [],
    getKey: (row) => row.id,
    renderCard: (row) => row.title,
    empty: <EmptyState title="No projects" description="Open a source folder to get started." />,
  },
};
