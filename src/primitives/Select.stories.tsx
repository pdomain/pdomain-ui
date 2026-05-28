import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from './Select.js';

const meta: Meta = {
  title: 'Primitives/Select',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue placeholder="Select option..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger style={{ width: '220px' }}>
        <SelectValue placeholder="Select layer..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>OCR Layers</SelectLabel>
          <SelectItem value="words">Words</SelectItem>
          <SelectItem value="lines">Lines</SelectItem>
          <SelectItem value="paragraphs">Paragraphs</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Layout Layers</SelectLabel>
          <SelectItem value="blocks">Blocks</SelectItem>
          <SelectItem value="regions">Regions</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// WS7: add missing coverage stories

/** Disabled select — the trigger is visible but not interactive. */
export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Error / invalid state — trigger with an error-tone variant. */
export const Error: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Select>
        <SelectTrigger style={{ width: '200px' }} aria-invalid="true">
          <SelectValue placeholder="Select a value" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
      <span style={{ color: 'var(--mismatch)', fontSize: '12px' }}>This field is required.</span>
    </div>
  ),
};

/** Pre-selected — opens with an initial value already chosen. */
export const PreSelected: Story = {
  render: () => (
    <Select defaultValue="lines">
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="words">Words</SelectItem>
        <SelectItem value="lines">Lines</SelectItem>
        <SelectItem value="paragraphs">Paragraphs</SelectItem>
      </SelectContent>
    </Select>
  ),
};
