import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface SettingsRowControlProps {
  id: string;
  labelledBy: string;
  describedBy?: string | undefined;
  invalid: boolean;
  disabled?: boolean | undefined;
}

export type SettingsRowControlRender = (props: SettingsRowControlProps) => React.ReactNode;
export type SettingsRowControl = React.ReactNode | SettingsRowControlRender;

export interface SettingsRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'label'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  control?: SettingsRowControl;
  controlId?: string | undefined;
  actions?: React.ReactNode;
  disabled?: boolean | undefined;
  error?: React.ReactNode;
}

type CloneableElementProps = {
  id?: string | undefined;
  disabled?: boolean | undefined;
  'aria-labelledby'?: string | undefined;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
};

const supportsDisabledProp = (element: React.ReactElement): boolean => {
  if (element.type === React.Fragment) return false;

  if (typeof element.type !== 'string') return true;

  return ['button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea'].includes(
    element.type,
  );
};

const supportsControlProps = (element: React.ReactElement): boolean =>
  element.type !== React.Fragment;

const mergeIds = (...ids: Array<string | undefined>): string | undefined => {
  const merged = ids.filter((id): id is string => id !== undefined && id !== '').join(' ');
  return merged === '' ? undefined : merged;
};

const isRenderableError = (error: React.ReactNode): boolean =>
  error !== undefined && error !== null && error !== false && error !== '';

const cloneControlElement = (
  control: React.ReactElement<CloneableElementProps>,
  controlProps: SettingsRowControlProps,
): React.ReactElement => {
  const nextProps: CloneableElementProps = {
    id: control.props.id ?? controlProps.id,
    'aria-labelledby': mergeIds(control.props['aria-labelledby'], controlProps.labelledBy),
  };

  const describedBy = mergeIds(control.props['aria-describedby'], controlProps.describedBy);
  if (describedBy !== undefined) {
    nextProps['aria-describedby'] = describedBy;
  }

  if (controlProps.invalid) {
    nextProps['aria-invalid'] = true;
  }

  if (controlProps.disabled === true && supportsDisabledProp(control)) {
    nextProps.disabled = true;
  }

  return React.cloneElement(control, nextProps);
};

const renderControl = (
  control: SettingsRowControl | undefined,
  controlProps: SettingsRowControlProps,
): React.ReactNode => {
  if (control === undefined || control === null) return null;

  if (typeof control === 'function') {
    return control(controlProps);
  }

  if (React.isValidElement<CloneableElementProps>(control)) {
    if (!supportsControlProps(control)) return control;
    return cloneControlElement(control, controlProps);
  }

  return control;
};

const renderActions = (
  actions: React.ReactNode,
  disabled: boolean | undefined,
): React.ReactNode => {
  if (
    disabled === true &&
    React.isValidElement<CloneableElementProps>(actions) &&
    supportsDisabledProp(actions)
  ) {
    return React.cloneElement(actions, { disabled: true });
  }

  return actions;
};

export const SettingsRow = React.forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { className, label, description, value, control, controlId, actions, disabled, error, ...props },
  ref,
) {
  const generatedId = React.useId();
  const generatedControlId = React.useId();
  const labelId = `${generatedId}-label`;
  const descriptionId = description != null ? `${generatedId}-description` : undefined;
  const hasError = isRenderableError(error);
  const errorId = hasError ? `${generatedId}-error` : undefined;
  const describedBy = mergeIds(descriptionId, errorId);
  const renderedControl = renderControl(control, {
    id: controlId ?? generatedControlId,
    labelledBy: labelId,
    describedBy,
    invalid: hasError,
    disabled,
  });
  const renderedActions = renderActions(actions, disabled);

  return (
    <div
      ref={ref}
      className={cn('pdui-settings-row', className)}
      aria-disabled={disabled === true ? true : undefined}
      data-disabled={disabled === true ? 'true' : undefined}
      {...props}
    >
      <div className="pdui-settings-row__content">
        <div id={labelId} className="pdui-settings-row__label">
          {label}
        </div>
        {description != null ? (
          <div id={descriptionId} className="pdui-settings-row__description">
            {description}
          </div>
        ) : null}
        {hasError ? (
          <div id={errorId} className="pdui-settings-row__error" role="status">
            {error}
          </div>
        ) : null}
      </div>
      {value != null ? <div className="pdui-settings-row__value">{value}</div> : null}
      {renderedControl != null ? (
        <div className="pdui-settings-row__control">{renderedControl}</div>
      ) : null}
      {renderedActions != null ? (
        <div className="pdui-settings-row__actions">{renderedActions}</div>
      ) : null}
    </div>
  );
});

SettingsRow.displayName = 'SettingsRow';
