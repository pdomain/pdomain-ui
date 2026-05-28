import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themeDir = resolve(__dirname, '../../theme');

const tokensCss = readFileSync(resolve(themeDir, 'tokens.css'), 'utf-8');
const primitivesCss = readFileSync(resolve(themeDir, 'primitives.css'), 'utf-8');

describe('theme/tokens.css', () => {
  it('contains :root { block (dark default)', () => {
    expect(tokensCss).toContain(':root {');
  });

  it('contains [data-theme="light"] { block', () => {
    expect(tokensCss).toContain('[data-theme="light"] {');
  });

  it('contains --overlay-scrim token in both :root and [data-theme="light"]', () => {
    // Both theme blocks must define the token
    const rootBlock = tokensCss.slice(
      tokensCss.indexOf(':root {'),
      tokensCss.indexOf('[data-theme="light"]'),
    );
    const lightBlock = tokensCss.slice(tokensCss.indexOf('[data-theme="light"]'));
    expect(rootBlock).toContain('--overlay-scrim');
    expect(lightBlock).toContain('--overlay-scrim');
  });
});

describe('theme/primitives.css', () => {
  it('contains .btn class selector', () => {
    expect(primitivesCss).toMatch(/\.btn[\s{,]/);
  });

  it('contains .chip class selector', () => {
    expect(primitivesCss).toMatch(/\.chip[\s{,]/);
  });

  it('contains .pip class selector', () => {
    expect(primitivesCss).toMatch(/\.pip[\s{,]/);
  });

  it('contains .input class selector', () => {
    expect(primitivesCss).toMatch(/\.input[\s{,]/);
  });

  it('contains .key class selector', () => {
    expect(primitivesCss).toMatch(/\.key[\s{,]/);
  });

  // Molecule selectors (fix: missing CSS batch)
  it('contains .banner class selector', () => {
    expect(primitivesCss).toMatch(/\.banner[\s{,]/);
  });

  it('contains .color-field class selector', () => {
    expect(primitivesCss).toMatch(/\.color-field[\s{,]/);
  });

  it('contains .filter-toolbar class selector', () => {
    expect(primitivesCss).toMatch(/\.filter-toolbar[\s{,]/);
  });

  it('contains .page-chip class selector', () => {
    expect(primitivesCss).toMatch(/\.page-chip[\s{,]/);
  });

  it('contains .run-all-dirty-panel class selector', () => {
    expect(primitivesCss).toMatch(/\.run-all-dirty-panel[\s{,]/);
  });

  it('contains .build-package-panel class selector', () => {
    expect(primitivesCss).toMatch(/\.build-package-panel[\s{,]/);
  });
});
