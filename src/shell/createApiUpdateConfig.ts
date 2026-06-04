/**
 * createApiUpdateConfig — builds the fetchUpdate/applyUpdate callbacks
 * that useUpdateCheck needs, backed by the pdomain-ops standard
 * `/api/suite/update` REST contract.
 *
 * Contract
 * ────────
 * GET  /api/suite/update
 *   → 200 application/json   body: UpdateInfo
 *
 * POST /api/suite/update
 *   → 200 application/json   body: { restart_required: true }
 *   (the shell handles the actual restart)
 *
 * Usage
 * ─────
 * ```ts
 * import { useUpdateCheck, createApiUpdateConfig } from '@pdomain/pdomain-ui/stores';
 * import { UpdatePanel } from '@pdomain/pdomain-ui/shell';
 *
 * const updateApi = createApiUpdateConfig();
 * const { info, applyAndRestart } = useUpdateCheck({ ...updateApi, policy: 'notify' });
 * ```
 */

import type { UpdateInfo } from './types.js';

export interface ApiUpdateOptions {
  /** Defaults to `'/api/suite/update'`. */
  updateUrl?: string;
}

/**
 * Create the fetchUpdate/applyUpdate pair backed by the pdomain-ops
 * `/api/suite/update` REST endpoint.
 */
export function createApiUpdateConfig(opts: ApiUpdateOptions = {}): {
  fetchUpdate: () => Promise<UpdateInfo>;
  applyUpdate: () => Promise<{ restart_required: boolean }>;
} {
  const updateUrl = opts.updateUrl ?? '/api/suite/update';

  return {
    async fetchUpdate(): Promise<UpdateInfo> {
      const res = await fetch(updateUrl);
      if (!res.ok) throw new Error(`GET ${updateUrl} → ${res.status}`);
      return (await res.json()) as UpdateInfo;
    },

    async applyUpdate(): Promise<{ restart_required: boolean }> {
      const res = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`POST ${updateUrl} → ${res.status}`);
      return (await res.json()) as { restart_required: boolean };
    },
  };
}
