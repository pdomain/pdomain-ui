import { describe, it, expect } from 'vitest';
import {
  COMPUTE_TARGET_PANEL,
  COMPUTE_DEVICE_OPTION,
  UPDATE_PANEL,
  UPDATE_BADGE,
  UPDATE_APPLY_BUTTON,
} from './index.js';

describe('desktop testids', () => {
  it('COMPUTE_TARGET_PANEL is correct', () => {
    expect(COMPUTE_TARGET_PANEL).toBe('compute-target-panel');
  });

  it('COMPUTE_DEVICE_OPTION is a function returning correct strings', () => {
    expect(COMPUTE_DEVICE_OPTION('cpu')).toBe('compute-device-option-cpu');
    expect(COMPUTE_DEVICE_OPTION('cuda:0')).toBe('compute-device-option-cuda:0');
  });

  it('UPDATE_PANEL is correct', () => {
    expect(UPDATE_PANEL).toBe('update-panel');
  });

  it('UPDATE_BADGE is correct', () => {
    expect(UPDATE_BADGE).toBe('update-badge');
  });

  it('UPDATE_APPLY_BUTTON is correct', () => {
    expect(UPDATE_APPLY_BUTTON).toBe('update-apply-button');
  });
});
