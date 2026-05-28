/**
 * ColorField — labeled color swatch + native color input with optional reset.
 *
 * Design constraints (spec §4 / pdomain-ui CLAUDE.md):
 *   - No hex literals: colors are applied via inline style using the `value` prop.
 *   - No CVA: variants handled by CSS class modifiers.
 *   - No direct lucide-react imports: icons come from src/icons/.
 *   - No Radix (pure HTML — this is a simple form element, not a behavior-heavy component).
 */
import * as React from 'react';
import { cn } from './cn.js';

export interface ColorFieldProps {
  /** The id for the color input element (links label via htmlFor). */
  id: string;
  /** Label text rendered above/beside the swatch+input. */
  label: string;
  /** Current color value (CSS hex string, e.g. "#ff6600"). */
  value: string;
  /** Called with the new hex string when the user changes the color. */
  onChange: (value: string) => void;
  /**
   * The token default for this color. When provided, a reset button is shown
   * whenever `value !== defaultValue`. Clicking resets by calling `onChange(defaultValue)`.
   */
  defaultValue?: string;
  /** Optional additional class name applied to the root element. */
  className?: string;
  /**
   * Optional aria-label for the native color input. Useful when the visible
   * label alone is insufficient for screen-reader context.
   */
  inputAriaLabel?: string;
  /** data-testid applied to the native color input element. */
  inputTestId?: string;
  /** data-testid applied to the reset button (when shown). */
  resetTestId?: string;
}

/**
 * A labeled color swatch + native `<input type="color">` with an optional
 * "reset to token default" button.
 *
 * Used by the AppearancePanel inside the SettingsModal for layer, status, and
 * accent color overrides.
 */
export const ColorField = React.forwardRef<HTMLInputElement, ColorFieldProps>(function ColorField(
  { id, label, value, onChange, defaultValue, className, inputAriaLabel, inputTestId, resetTestId },
  ref,
) {
  const isOverridden = defaultValue !== undefined && value !== defaultValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  return (
    <div className={cn('color-field', className)}>
      <label htmlFor={id} className="color-field-label">
        {label}
      </label>
      <div className="color-field-control">
        {/* Swatch: shows the currently selected color.
              Inline style is intentional: value comes from user pref, not a design token. */}
        <span
          className="color-field-swatch"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
        <input
          ref={ref}
          id={id}
          type="color"
          className="color-field-input"
          value={value}
          onChange={handleInputChange}
          aria-label={inputAriaLabel}
          data-testid={inputTestId}
        />
        {isOverridden && (
          <button
            type="button"
            className="color-field-reset"
            onClick={handleReset}
            aria-label={`Reset ${label} to default`}
            data-testid={resetTestId}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
});

ColorField.displayName = 'ColorField';
