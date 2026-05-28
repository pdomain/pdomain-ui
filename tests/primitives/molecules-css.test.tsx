/**
 * molecules-css.test.tsx
 *
 * CSS class-presence regression guards for the six molecules that had
 * missing CSS rules: Banner, ColorField, FilterToolbar, PageChip,
 * RunAllDirtyPanel, BuildPackagePanel.
 *
 * These tests verify that every class the component applies to the DOM
 * is recognised by (i.e. appears in) theme/primitives.css, and that the
 * rendered DOM node carries the expected class strings.  They do NOT test
 * visual appearance — that is the responsibility of Storybook / visual
 * regression.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Components under test
import { Banner } from '../../src/primitives/Banner.js';
import { ColorField } from '../../src/primitives/ColorField.js';
import { FilterToolbar } from '../../src/primitives/FilterToolbar.js';
import { PageChip } from '../../src/primitives/PageChip.js';
import { RunAllDirtyPanel } from '../../src/primitives/RunAllDirtyPanel.js';
import { BuildPackagePanel } from '../../src/primitives/BuildPackagePanel.js';

// ─── Shared: load primitives.css once ────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const primitivesCss = readFileSync(resolve(__dirname, '../../theme/primitives.css'), 'utf-8');

/** Assert that a CSS class selector appears in primitives.css. */
function expectClassDefined(cls: string): void {
  // Match `.cls` as a CSS selector token (followed by space, comma, :, or {)
  const pattern = new RegExp(`\\.${cls.replace('-', '\\-').replace('--', '\\-\\-')}[\\s{,:\\[]`);
  expect(primitivesCss, `Expected .${cls} to be defined in theme/primitives.css`).toMatch(pattern);
}

// ─── Banner ───────────────────────────────────────────────────────────────────

describe('Banner — CSS class presence', () => {
  const rootClasses = ['banner'] as const;
  const subClasses = [
    'banner__leading',
    'banner__body',
    'banner__headline',
    'banner__subtext',
    'banner__footer',
    'banner__actions',
  ] as const;

  for (const cls of [...rootClasses, ...subClasses]) {
    it(`primitives.css defines .${cls}`, () => {
      expectClassDefined(cls);
    });
  }

  it('root element carries .banner class', () => {
    const { container } = render(
      <Banner
        headline="Test headline"
        subtext="Supporting text"
        leadingSlot={<span>icon</span>}
        actions={<button type="button">Act</button>}
        footer={<span>footer</span>}
      >
        body
      </Banner>,
    );
    const root = container.firstElementChild;
    expect(root?.classList.contains('banner')).toBe(true);
  });

  it('renders .banner__body when headline or children present', () => {
    const { container } = render(<Banner headline="Hi" />);
    expect(container.querySelector('.banner__body')).not.toBeNull();
  });

  it('renders .banner__headline when headline prop set', () => {
    const { container } = render(<Banner headline="Hi" />);
    expect(container.querySelector('.banner__headline')).not.toBeNull();
  });

  it('renders .banner__subtext when subtext prop set', () => {
    const { container } = render(<Banner headline="Hi" subtext="Sub" />);
    expect(container.querySelector('.banner__subtext')).not.toBeNull();
  });

  it('renders .banner__leading when leadingSlot prop set', () => {
    const { container } = render(<Banner headline="Hi" leadingSlot={<span>L</span>} />);
    expect(container.querySelector('.banner__leading')).not.toBeNull();
  });

  it('renders .banner__actions when actions prop set', () => {
    const { container } = render(
      <Banner headline="Hi" actions={<button type="button">X</button>} />,
    );
    expect(container.querySelector('.banner__actions')).not.toBeNull();
  });

  it('renders .banner__footer when footer prop set', () => {
    const { container } = render(<Banner headline="Hi" footer={<span>F</span>} />);
    expect(container.querySelector('.banner__footer')).not.toBeNull();
  });

  it('sets data-tone attribute matching tone prop', () => {
    const { container } = render(<Banner tone="danger" headline="Watch out" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset['tone']).toBe('danger');
  });

  it('defaults data-tone to "neutral"', () => {
    const { container } = render(<Banner headline="Neutral" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset['tone']).toBe('neutral');
  });
});

// ─── ColorField ───────────────────────────────────────────────────────────────

describe('ColorField — CSS class presence', () => {
  const classes = [
    'color-field',
    'color-field-label',
    'color-field-control',
    'color-field-swatch',
    'color-field-input',
    'color-field-reset',
  ] as const;

  for (const cls of classes) {
    it(`primitives.css defines .${cls}`, () => {
      expectClassDefined(cls);
    });
  }

  it('root element carries .color-field class', () => {
    const { container } = render(
      <ColorField id="c1" label="Accent" value="#ff6600" onChange={() => undefined} />,
    );
    const root = container.firstElementChild;
    expect(root?.classList.contains('color-field')).toBe(true);
  });

  it('renders .color-field-swatch element', () => {
    const { container } = render(
      <ColorField id="c2" label="Accent" value="#ff6600" onChange={() => undefined} />,
    );
    expect(container.querySelector('.color-field-swatch')).not.toBeNull();
  });

  it('renders .color-field-input element', () => {
    const { container } = render(
      <ColorField id="c3" label="Accent" value="#ff6600" onChange={() => undefined} />,
    );
    expect(container.querySelector('.color-field-input')).not.toBeNull();
  });

  it('renders .color-field-reset only when value differs from defaultValue', () => {
    const { container } = render(
      <ColorField
        id="c4"
        label="Accent"
        value="#ff6600"
        defaultValue="#000000"
        onChange={() => undefined}
      />,
    );
    expect(container.querySelector('.color-field-reset')).not.toBeNull();
  });

  it('does not render .color-field-reset when value equals defaultValue', () => {
    const { container } = render(
      <ColorField
        id="c5"
        label="Accent"
        value="#000000"
        defaultValue="#000000"
        onChange={() => undefined}
      />,
    );
    expect(container.querySelector('.color-field-reset')).toBeNull();
  });
});

// ─── FilterToolbar ────────────────────────────────────────────────────────────

describe('FilterToolbar — CSS class presence', () => {
  const classes = ['filter-toolbar'] as const;

  for (const cls of classes) {
    it(`primitives.css defines .${cls}`, () => {
      expectClassDefined(cls);
    });
  }

  it('root element carries .filter-toolbar class', () => {
    const { container } = render(<FilterToolbar value="" onValueChange={() => undefined} />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('filter-toolbar')).toBe(true);
  });

  it('renders a search input', () => {
    render(<FilterToolbar value="" onValueChange={() => undefined} placeholder="Search…" />);
    expect(screen.getByRole('searchbox')).not.toBeNull();
  });
});

// ─── PageChip ─────────────────────────────────────────────────────────────────

describe('PageChip — CSS class presence', () => {
  const classes = ['page-chip', 'page-chip--selected'] as const;

  for (const cls of classes) {
    it(`primitives.css defines .${cls}`, () => {
      expectClassDefined(cls);
    });
  }

  it('span variant carries .page-chip class', () => {
    const { container } = render(<PageChip prefix="p019" />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('page-chip')).toBe(true);
    expect(root?.tagName.toLowerCase()).toBe('span');
  });

  it('button variant carries .page-chip class', () => {
    const { container } = render(<PageChip prefix="p019" onClick={() => undefined} />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('page-chip')).toBe(true);
    expect(root?.tagName.toLowerCase()).toBe('button');
  });

  it('selected variant carries .page-chip--selected class', () => {
    const { container } = render(
      <PageChip prefix="p019" onClick={() => undefined} selected={true} />,
    );
    const root = container.firstElementChild;
    expect(root?.classList.contains('page-chip--selected')).toBe(true);
  });

  it('non-selected does not carry .page-chip--selected class', () => {
    const { container } = render(<PageChip prefix="p019" selected={false} />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('page-chip--selected')).toBe(false);
  });
});

// ─── RunAllDirtyPanel ─────────────────────────────────────────────────────────

describe('RunAllDirtyPanel — CSS class presence', () => {
  const classes = [
    'run-all-dirty-panel',
    'run-all-dirty-panel__info',
    'run-all-dirty-panel__count',
    'run-all-dirty-panel__count--dirty',
    'run-all-dirty-panel__label',
  ] as const;

  for (const cls of classes) {
    it(`primitives.css defines .${cls}`, () => {
      expectClassDefined(cls);
    });
  }

  it('root element carries .run-all-dirty-panel class', () => {
    const { container } = render(<RunAllDirtyPanel dirtyCount={3} onRunAll={() => undefined} />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('run-all-dirty-panel')).toBe(true);
  });

  it('count element carries .run-all-dirty-panel__count--dirty when dirtyCount > 0', () => {
    const { container } = render(<RunAllDirtyPanel dirtyCount={5} onRunAll={() => undefined} />);
    expect(container.querySelector('.run-all-dirty-panel__count--dirty')).not.toBeNull();
  });

  it('count element does not carry --dirty modifier when dirtyCount === 0', () => {
    const { container } = render(<RunAllDirtyPanel dirtyCount={0} onRunAll={() => undefined} />);
    expect(container.querySelector('.run-all-dirty-panel__count--dirty')).toBeNull();
  });
});

// ─── BuildPackagePanel ────────────────────────────────────────────────────────

describe('BuildPackagePanel — CSS class presence', () => {
  const rootClass = 'build-package-panel';

  it(`primitives.css defines .${rootClass}`, () => {
    expectClassDefined(rootClass);
  });

  it('root element carries .build-package-panel class', () => {
    const { container } = render(<BuildPackagePanel onBuild={() => undefined} />);
    const root = container.firstElementChild;
    expect(root?.classList.contains('build-package-panel')).toBe(true);
  });

  it('status badge has .build-package-panel__status class when status present', () => {
    const { container } = render(
      <BuildPackagePanel onBuild={() => undefined} status="clean" statusLabel="Clean" />,
    );
    expect(container.querySelector('.build-package-panel__status')).not.toBeNull();
  });

  it('no status badge rendered when status prop absent', () => {
    const { container } = render(<BuildPackagePanel onBuild={() => undefined} />);
    expect(container.querySelector('.build-package-panel__status')).toBeNull();
  });
});
