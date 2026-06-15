import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../primitives/Button.js';
import { FileDropzone } from './FileDropzone.js';

const meta = {
  title: 'Source Intake/FileDropzone',
  component: FileDropzone,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Drop source files',
    description: 'PNG, JPG, PDF, or ZIP files.',
    accept: 'image/*,.pdf,.zip',
    multiple: true,
    onFilesAccepted: () => undefined,
  },
};

export const WithActions: Story = {
  args: {
    ...Default.args,
    actions: <Button size="sm">Browse</Button>,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'This source type is not supported.',
  },
};
