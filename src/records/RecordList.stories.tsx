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
type Story = StoryObj;

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
