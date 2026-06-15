import * as React from 'react';
import { cn } from '../primitives/cn.js';

export interface SettingSliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  ariaLabel: string;
}

const clampValue = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const formatValue = (value: number, unit: string | undefined): string =>
  unit === undefined || unit === '' ? value.toString() : `${value.toString()} ${unit}`;

export const SettingSlider = React.forwardRef<HTMLInputElement, SettingSliderProps>(
  function SettingSlider(
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      unit,
      ariaLabel,
      onKeyDown,
      disabled,
      ...props
    },
    ref,
  ) {
    const clampedValue = clampValue(value, min, max);
    const displayValue = formatValue(clampedValue, unit);

    const commitValue = React.useCallback(
      (nextValue: number) => {
        onValueChange(clampValue(nextValue, min, max));
      },
      [max, min, onValueChange],
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      commitValue(event.currentTarget.valueAsNumber);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled === true) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        commitValue(clampedValue + step);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        commitValue(clampedValue - step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        commitValue(min);
      } else if (event.key === 'End') {
        event.preventDefault();
        commitValue(max);
      }
    };

    return (
      <div className={cn('pdui-setting-slider', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          aria-label={ariaLabel}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pdui-setting-slider__input"
          {...props}
        />
        <span className="pdui-setting-slider__value" aria-live="polite">
          {displayValue}
        </span>
      </div>
    );
  },
);

SettingSlider.displayName = 'SettingSlider';
