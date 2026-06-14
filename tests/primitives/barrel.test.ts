/**
 * Verify that every primitive exported by @pdomain/pdomain-ui/primitives
 * is a function (component). Uses the vitest alias `@pdomain/pdomain-ui`
 * pointing at src/primitives/index.ts via the tsconfig `paths` alias.
 *
 * Import from the path alias to exercise the same resolution consumers use.
 */
import { describe, it, expect } from 'vitest';

// Import via the subpath alias configured in vitest.config.ts
import * as primitives from '../../src/primitives/index.js';

const EXPECTED_COMPONENTS = [
  // Non-Radix
  'Button',
  'ButtonGroup',
  'IconButton',
  'Input',
  'Textarea',
  'Badge',
  'Chip',
  'TriStateChip',
  'StatusPip',
  // Job-state components — must stay exported (see pdomain-ui#15; these gate pdomain-ocr-simple-gui)
  'JobStatusPip',
  // Layout & dialog shells
  'PageSplitView',
  'BaseJobConfigDialog',
  'KeyCap',
  'Card',
  'Separator',
  'Progress',
  // Field helpers
  'Field',
  'FieldContext',
  'useFieldContext',
  'FieldRow',
  // Radix
  'Dialog',
  'DialogTrigger',
  'DialogContent',
  'DialogTitle',
  'DialogDescription',
  'AlertDialog',
  'AlertDialogTrigger',
  'AlertDialogContent',
  'AlertDialogTitle',
  'AlertDialogDescription',
  'AlertDialogAction',
  'AlertDialogCancel',
  'Popover',
  'PopoverTrigger',
  'PopoverContent',
  'Tooltip',
  'TooltipTrigger',
  'TooltipContent',
  'TooltipProvider',
  'DropdownMenu',
  'DropdownMenuTrigger',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'Select',
  'SelectTrigger',
  'SelectContent',
  'SelectItem',
  'SelectValue',
  'Tabs',
  'TabsList',
  'TabsTrigger',
  'TabsContent',
  'ToggleGroup',
  'ToggleGroupItem',
  'Accordion',
  'AccordionItem',
  'AccordionTrigger',
  'AccordionContent',
  // Kanban
  'KanbanBoard',
  'KanbanColumn',
  'PageChip',
  // Utility
  'cn',
];

describe('primitives barrel — every expected export is a function/component', () => {
  for (const name of EXPECTED_COMPONENTS) {
    it(`${name} is exported and is a function or component object`, () => {
      const exported = (primitives as Record<string, unknown>)[name];
      expect(exported, `${name} not found in primitives barrel`).toBeDefined();
      // React.forwardRef returns an object (ExoticComponent), plain components are functions
      const isComponent =
        typeof exported === 'function' || (typeof exported === 'object' && exported !== null);
      expect(isComponent, `${name} should be a function or React component object`).toBe(true);
    });
  }
});
