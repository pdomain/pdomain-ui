// Canonical job state derived from the pdomain-ops generated schema.
// JobState is the authoritative type for long-running job status across all pdomain-* apps.
import type { components } from './generated/ocr-ops.js';

export type JobState = components['schemas']['JobStatus']['state'];
// = "queued" | "running" | "succeeded" | "failed" | "cancelled"
