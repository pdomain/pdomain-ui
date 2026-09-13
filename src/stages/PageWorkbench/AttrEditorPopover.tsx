/**
 * AttrEditorPopover — internal sub-component for PageAttributesBar.
 *
 * NOT exported from the PageWorkbench barrel.
 *
 * Renders a Radix Popover with controlled open state. The chip button must be
 * rendered as a PopoverTrigger in the parent — AttrEditorPopover only provides
 * the PopoverRoot wrapper and the PopoverContent body.
 *
 * Usage pattern (in PageAttributesBar):
 *   <AttrEditorPopover ...>
 *     <button>chip</button>   ← rendered via triggerSlot prop
 *   </AttrEditorPopover>
 *
 * Or use `AttrEditorPopover.Root` / `AttrEditorPopover.Content` if needed.
 *
 * Modes:
 *   - 'text'   → <Input type="text">
 *   - 'number' → <Input type="number">
 *   - 'select' → native <select> (avoids nested Radix Portal issues)
 *
 * Apply commits; Cancel / Escape closes without committing.
 */
import * as React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Button } from '../../primitives/Button.js';
import { Input } from '../../primitives/Input.js';
import type { PageAttribute } from './PageAttributesBar.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AttrEditorPopoverProps {
  attr: PageAttribute;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (nextValue: string) => void;
  /**
   * The chip trigger element. Must be a single element — wrapped in
   * RadixPopover.Trigger asChild so it becomes the anchor.
   */
  children: React.ReactElement;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AttrEditorPopover({
  attr,
  open,
  onOpenChange,
  onCommit,
  children,
}: AttrEditorPopoverProps): React.ReactElement {
  const [draft, setDraft] = React.useState(attr.value);

  // Sync draft when attr.value changes (e.g. external update while open), or
  // when the popover opens/closes (so reopening starts from the current
  // committed value). Adjusted during render rather than in an effect.
  const [prevSyncKey, setPrevSyncKey] = React.useState({ value: attr.value, open });
  if (prevSyncKey.value !== attr.value || prevSyncKey.open !== open) {
    setPrevSyncKey({ value: attr.value, open });
    setDraft(attr.value);
  }

  const handleApply = React.useCallback(() => {
    onCommit(draft);
    onOpenChange(false);
  }, [draft, onCommit, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setDraft(attr.value);
    onOpenChange(false);
  }, [attr.value, onOpenChange]);

  // Keyboard: Enter = Apply (text/number), Escape = Cancel.
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && attr.editor !== 'select') {
        e.preventDefault();
        handleApply();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [attr.editor, handleApply, handleCancel],
  );

  const mode = attr.editor ?? 'text';

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          className="attr-editor-popover"
          align="start"
          sideOffset={4}
          onKeyDown={handleKeyDown}
        >
          <div className="attr-editor-popover__label">{attr.label}</div>

          {mode === 'select' && attr.options !== undefined ? (
            <select
              className="attr-editor-popover__select"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Edit ${attr.label}`}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            >
              {attr.options.map((opt: { value: string; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type={mode === 'number' ? 'number' : 'text'}
              className="attr-editor-popover__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Edit ${attr.label}`}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          )}

          <div className="attr-editor-popover__actions">
            <Button size="sm" variant="ghost" onClick={handleCancel} aria-label="Cancel edit">
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleApply} aria-label="Apply edit">
              Apply
            </Button>
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

AttrEditorPopover.displayName = 'AttrEditorPopover';
