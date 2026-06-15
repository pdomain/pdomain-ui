import '../theme/tokens.css';
import '../theme/reset.css';
import '../theme/primitives.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark (default)' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals['theme'] as string | undefined;
      document.documentElement.dataset['theme'] =
        theme === 'light' ? 'light' : '';
      return Story();
    },
  ],
};

export default preview;
