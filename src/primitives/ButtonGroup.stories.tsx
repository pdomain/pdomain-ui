import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup.js';
import { Button } from './Button.js';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default — three buttons',
  render: () => (
    <ButtonGroup aria-label="Text formatting">
      <Button variant="ghost" size="sm">
        Bold
      </Button>
      <Button variant="ghost" size="sm">
        Italic
      </Button>
      <Button variant="ghost" size="sm">
        Underline
      </Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  name: 'With separator dividers',
  render: () => (
    <ButtonGroup aria-label="View actions" separator>
      <Button variant="ghost" size="sm">
        List
      </Button>
      <Button variant="ghost" size="sm">
        Grid
      </Button>
      <Button variant="ghost" size="sm">
        Kanban
      </Button>
    </ButtonGroup>
  ),
};

export const MixedVariants: Story = {
  name: 'Mixed variants',
  render: () => (
    <ButtonGroup aria-label="Actions">
      <Button variant="ghost" size="sm">
        Cancel
      </Button>
      <Button variant="primary" size="sm">
        Save
      </Button>
    </ButtonGroup>
  ),
};

export const SingleChild: Story = {
  name: 'Single button (valid — group still provides accessible label)',
  render: () => (
    <ButtonGroup aria-label="Export actions">
      <Button variant="primary" size="sm">
        Export
      </Button>
    </ButtonGroup>
  ),
};
