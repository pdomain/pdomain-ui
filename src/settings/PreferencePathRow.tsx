import * as React from 'react';
import { Button } from '../primitives/Button.js';
import { Input } from '../primitives/Input.js';
import { SettingsRow } from './SettingsRow.js';

export interface PreferencePathRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  label: string;
  description?: React.ReactNode;
  path: string;
  onPathChange: (path: string) => void;
  onSave: () => void;
  onReset: () => void;
  disabled?: boolean | undefined;
  error?: React.ReactNode;
  inputId?: string;
}

export function PreferencePathRow({
  label,
  description,
  path,
  onPathChange,
  onSave,
  onReset,
  disabled,
  error,
  inputId,
  ...props
}: PreferencePathRowProps): React.ReactElement {
  const generatedInputId = React.useId();
  const resolvedInputId = inputId ?? generatedInputId;

  return (
    <SettingsRow
      label={label}
      description={description}
      disabled={disabled}
      error={error}
      control={
        <Input
          id={resolvedInputId}
          value={path}
          aria-label={label}
          disabled={disabled}
          onChange={(event) => {
            onPathChange(event.currentTarget.value);
          }}
        />
      }
      actions={
        <div className="pdui-preference-path-row__actions">
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            aria-label={`Save ${label}`}
            onClick={onSave}
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            aria-label={`Reset ${label}`}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      }
      {...props}
    />
  );
}

PreferencePathRow.displayName = 'PreferencePathRow';
