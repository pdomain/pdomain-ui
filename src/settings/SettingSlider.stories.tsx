import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SettingSlider } from './SettingSlider.js';

const meta: Meta<typeof SettingSlider> = {
  title: 'Settings/SettingSlider',
  component: SettingSlider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function SettingSliderStory() {
  const [value, setValue] = React.useState(5);

  return (
    <SettingSlider
      value={value}
      onValueChange={setValue}
      min={0}
      max={10}
      step={1}
      unit="px"
      ariaLabel="Threshold"
    />
  );
}

export const Default: Story = {
  render: () => <SettingSliderStory />,
};
