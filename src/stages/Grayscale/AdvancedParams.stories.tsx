/**
 * AdvancedParams stories.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AdvancedParams, GRAYSCALE_PARAMS_DEFAULT } from './AdvancedParams.js';
import type { GrayscaleParams } from './AdvancedParams.js';

const meta: Meta<typeof AdvancedParams> = {
  title: 'Stages/Grayscale/AdvancedParams',
  component: AdvancedParams,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof AdvancedParams>;

export const Default: Story = {
  args: {
    params: GRAYSCALE_PARAMS_DEFAULT,
    defaultOpen: true,
    onChange: () => undefined,
  },
};

export const NonDefaults: Story = {
  args: {
    params: {
      samplerRadius: 16,
      gamma: 2.2,
      outputRange: [20, 235],
    },
    defaultOpen: true,
    onChange: () => undefined,
  },
};

export const WideRange: Story = {
  args: {
    params: {
      samplerRadius: 32,
      gamma: 3.0,
      outputRange: [0, 255],
    },
    defaultOpen: true,
    onChange: () => undefined,
  },
};

export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook calls this render function as a component; the hook holds example state
    const [params, setParams] = useState<GrayscaleParams>(GRAYSCALE_PARAMS_DEFAULT);
    return (
      <div style={{ maxWidth: '480px' }}>
        <AdvancedParams
          params={params}
          onChange={setParams}
          defaultOpen={true}
          data-testid="adv-params-interactive"
        />
        <pre style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    );
  },
};
