/**
 * UtilityDock — renders the active utility-dock surface inside a SlideOverPanel.
 *
 * Rendered by AppShell outside the grid (like SettingsModal was). Reads dock
 * state from useUtilityDock() and switches on `active`:
 *   settings → SettingsPanel   keybinds → ShortcutsCheatsheetBody   jobs → JobsPanelBody
 *
 * Owns the Settings sub-panel selection (the old SettingsModal activePanel).
 * Close / pin / resize are wired to the dock context. No scrim, non-modal.
 */
import * as React from 'react';
import { SlideOverPanel } from '../primitives/SlideOverPanel.js';
import { ShortcutsCheatsheetBody } from '../primitives/ShortcutsCheatsheetBody.js';
import { SettingsPanel } from './SettingsPanel.js';
import { JobsPanelBody } from './JobsPanelBody.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { DockSurface } from './UtilityDockContext.js';
import type { SettingsPanelDescriptor } from './types.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';
import type { Job, JobRowProps } from './JobRow.js';

const SURFACE_TITLES: Record<DockSurface, string> = {
  settings: 'Settings',
  keybinds: 'Keyboard shortcuts',
  jobs: 'Jobs',
};

export interface UtilityDockProps {
  /** App-injected settings panels (forwarded to SettingsPanel). */
  settingsPanels?: SettingsPanelDescriptor[];
  /** Keyboard bindings for the Keybinds surface. */
  bindings?: ShortcutBinding[];
  /** Active jobs for the Jobs surface. */
  activeJobs?: Job[];
  /** Forwarded to JobsPanelBody / JobRow. */
  onJobOpen?: JobRowProps['onOpen'];
  onJobPauseResume?: JobRowProps['onPauseResume'];
  onJobCancel?: JobRowProps['onCancel'];
  onJobsViewAll?: () => void;
  /** Controlled initial Settings sub-panel (e.g. when openPanel(id) was called). */
  initialSettingsPanel?: string;
}

export function UtilityDock({
  settingsPanels,
  bindings = [],
  activeJobs = [],
  onJobOpen,
  onJobPauseResume,
  onJobCancel,
  onJobsViewAll,
  initialSettingsPanel,
}: UtilityDockProps): React.ReactElement | null {
  const { active, pinned, width, close, setPinned, setWidth } = useUtilityDock();
  // Initialize directly from prop: the dock unmounts when active===null and re-mounts
  // on each open, so each re-mount picks up the current initialSettingsPanel value.
  // No effect needed — stale-override risk eliminated.
  const [settingsSubPanel, setSettingsSubPanel] = React.useState(
    initialSettingsPanel ?? 'appearance',
  );

  if (active === null) return null;

  let body: React.ReactNode;
  if (active === 'settings') {
    body = (
      <SettingsPanel
        activePanel={settingsSubPanel}
        onSelectPanel={setSettingsSubPanel}
        {...(settingsPanels !== undefined ? { settingsPanels } : {})}
      />
    );
  } else if (active === 'keybinds') {
    body = <ShortcutsCheatsheetBody bindings={bindings} />;
  } else {
    body = (
      <JobsPanelBody
        activeJobs={activeJobs}
        {...(onJobOpen !== undefined ? { onJobOpen } : {})}
        {...(onJobPauseResume !== undefined ? { onJobPauseResume } : {})}
        {...(onJobCancel !== undefined ? { onJobCancel } : {})}
        {...(onJobsViewAll !== undefined ? { onViewAll: onJobsViewAll } : {})}
      />
    );
  }

  return (
    <div data-testid="utility-dock">
      <SlideOverPanel
        open
        title={SURFACE_TITLES[active]}
        onClose={close}
        pinned={pinned}
        onTogglePin={setPinned}
        width={width}
        onResize={setWidth}
      >
        {body}
      </SlideOverPanel>
    </div>
  );
}

UtilityDock.displayName = 'UtilityDock';
