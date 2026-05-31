/**
 * ProjectsAttributesPanel Storybook stories.
 *
 * Stories:
 *   1. DefaultSections  — 4 sections derived from a rich project shape.
 *   2. CustomSections   — custom sections override defaults.
 *   3. MinimalProject   — empty project (all optional fields absent).
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProjectsAttributesPanel } from './ProjectsAttributesPanel.js';
import type { AttributesPanelSection } from './ProjectsAttributesPanel.js';

const meta = {
  title: 'Stages/Projects/ProjectsAttributesPanel',
  component: ProjectsAttributesPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Collapsible 2-column attributes panel for the projects detail pane. ' +
          'Derives Bibliographic / PGDP project / Format & content / Project comments ' +
          'sections from a `ProjectSummary` shape, or accepts fully custom `sections`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectsAttributesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Story data ───────────────────────────────────────────────────────────────

const richProject = {
  title: 'Emma, Vol. 2',
  bibliographic: {
    Author: 'Jane Austen',
    Language: 'English',
    'Original year': '1815',
    Edition: 'John Murray, London — 1816 stereotype',
    'Source archive': 'archive.org · austen-emma-vol2-1816',
  },
  pgdp: {
    'Project ID': 'austen-emma-p1',
    Difficulty: 'B1 · Beginners welcome',
    Genre: 'Fiction · Classic',
    'Forum category': 'Literature · 19th century',
    Round: 'P1 (initial proofread)',
    'Format version': 'pgdp-format-2024.3',
  },
  format: {
    'Page format': 'smooth-reading',
    Illustrations: '12 figures · grayscale',
    Footnotes: 'numbered, per-page',
    'Word lists': '+ 38 custom · derives from book',
    'Special chars': '— œ æ · long-s preserved',
    'PG submission': 'queued · awaiting cleared P3',
  },
  comments:
    "Preserve em-dashes; long-s is already transcribed as 's'. " +
    'Footnote anchors use the form [Note 12] at the call site and ' +
    '[Footnote 12: …] at the bottom of the page. Italic for ship names ' +
    'and foreign phrases; small-caps for chapter openings; preserve original ' +
    'spelling and punctuation throughout.',
};

const customSections: AttributesPanelSection[] = [
  {
    id: 'technical',
    label: 'Technical details',
    fields: [
      { id: 'scanner', label: 'Scanner', value: 'Canon DR-C230' },
      { id: 'dpi', label: 'Scan DPI', value: '600', mono: true },
      { id: 'pages', label: 'Page count', value: '342' },
      { id: 'color', label: 'Color mode', value: 'Grayscale 8-bit' },
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow status',
    fields: [
      { id: 'ocr', label: 'OCR engine', value: 'pdomain-ocr v2.1', mono: true },
      { id: 'stage', label: 'Current stage', value: 'P1 proofread' },
      { id: 'assigned', label: 'Assigned to', value: 'volunteer-42' },
    ],
  },
  {
    id: 'notes',
    label: 'Project notes',
    fields: [],
    fullWidth: true,
  },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const DefaultSections: Story = {
  args: {
    project: richProject,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default 4-section layout derived from a rich `ProjectSummary`. ' +
          'All sections start open and are independently collapsible.',
      },
    },
  },
};

export const CustomSections: Story = {
  args: {
    project: { title: 'Emma, Vol. 2' },
    sections: customSections,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Custom `sections` override the default 4-section layout. ' +
          'Use this when the projects detail pane needs a domain-specific view.',
      },
    },
  },
};

export const MinimalProject: Story = {
  args: {
    project: {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Minimal project with no optional fields. All 4 sections render ' +
          'but with empty field lists — the panel stays functional.',
      },
    },
  },
};
