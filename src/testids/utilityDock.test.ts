import { describe, it, expect } from 'vitest';
import {
  SLIDE_OVER_PANEL,
  SLIDE_OVER_PANEL_CLOSE,
  SLIDE_OVER_PANEL_PIN,
  SLIDE_OVER_PANEL_RESIZE,
  UTILITY_DOCK,
  SETTINGS_PANEL,
  SHORTCUTS_CHEATSHEET_BODY,
  JOBS_PANEL_BODY,
  JOBS_PANEL_BODY_VIEW_ALL,
} from './index.js';

describe('utility dock testids', () => {
  it('exposes stable string constants', () => {
    expect(SLIDE_OVER_PANEL).toBe('slide-over-panel');
    expect(SLIDE_OVER_PANEL_CLOSE).toBe('slide-over-panel-close');
    expect(SLIDE_OVER_PANEL_PIN).toBe('slide-over-panel-pin');
    expect(SLIDE_OVER_PANEL_RESIZE).toBe('slide-over-panel-resize');
    expect(UTILITY_DOCK).toBe('utility-dock');
    expect(SETTINGS_PANEL).toBe('settings-panel');
    expect(SHORTCUTS_CHEATSHEET_BODY).toBe('shortcuts-cheatsheet-body');
    expect(JOBS_PANEL_BODY).toBe('jobs-panel-body');
    expect(JOBS_PANEL_BODY_VIEW_ALL).toBe('jobs-panel-body-view-all');
  });
});
