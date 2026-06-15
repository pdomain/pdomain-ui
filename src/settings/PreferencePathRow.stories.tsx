import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PreferencePathRow } from './PreferencePathRow.js';

const meta: Meta<typeof PreferencePathRow> = {
  title: 'Settings/PreferencePathRow',
  component: PreferencePathRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function PreferencePathRowStory() {
  const [path, setPath] = React.useState('/tmp/jobs');

  return (
    <PreferencePathRow
      label="Jobs location"
      path={path}
      onPathChange={setPath}
      onSave={() => undefined}
      onReset={() => {
        setPath('/tmp/jobs');
      }}
    />
  );
}

export const Default: Story = {
  render: () => <PreferencePathRowStory />,
};
