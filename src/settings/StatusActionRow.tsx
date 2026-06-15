import * as React from 'react';
import { SettingsRow } from './SettingsRow.js';
import { SettingsValue, type SettingsValueTone } from './SettingsValue.js';

export interface StatusActionRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'label'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  status: React.ReactNode;
  action?: React.ReactNode;
  details?: React.ReactNode;
  tone?: SettingsValueTone;
  disabled?: boolean | undefined;
}

export function StatusActionRow({
  label,
  description,
  status,
  action,
  details,
  tone = 'neutral',
  disabled,
  ...props
}: StatusActionRowProps): React.ReactElement {
  const rowDescription =
    description != null || details != null ? (
      <>
        {description}
        {details != null ? <div className="pdui-status-action-row__details">{details}</div> : null}
      </>
    ) : undefined;

  return (
    <SettingsRow
      label={label}
      description={rowDescription}
      value={<SettingsValue tone={tone}>{status}</SettingsValue>}
      actions={action}
      disabled={disabled}
      {...props}
    />
  );
}

StatusActionRow.displayName = 'StatusActionRow';
