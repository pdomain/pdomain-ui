import * as React from 'react';
import { Button } from '../primitives/Button.js';
import { Input } from '../primitives/Input.js';
import { cn } from '../primitives/cn.js';

export interface SearchFieldProps {
  value: string;
  onValueChange(this: void, value: string): void;
  placeholder?: string;
  ariaLabel: string;
  onClear?(this: void): void;
  className?: string;
}

export interface ShortcutSearchFieldProps extends SearchFieldProps {
  shortcutLabel?: string;
  onShortcutClick?(this: void): void;
  inputRef?: React.Ref<HTMLInputElement>;
}

interface SearchInputProps {
  value: string;
  onValueChange(this: void, value: string): void;
  placeholder?: string | undefined;
  ariaLabel: string;
  onClear?: ((this: void) => void) | undefined;
  inputRef?: React.Ref<HTMLInputElement> | undefined;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref !== undefined && ref !== null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function SearchInput({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  onClear,
  inputRef,
}: SearchInputProps) {
  return (
    <Input
      ref={inputRef}
      className="pdui-search-field__input"
      type="search"
      role="searchbox"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onValueChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClear?.();
      }}
    />
  );
}

export function SearchField({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  onClear,
  className,
}: SearchFieldProps) {
  return (
    <div className={cn('pdui-search-field', className)}>
      <SearchInput
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        onClear={onClear}
      />
    </div>
  );
}

export function ShortcutSearchField({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  onClear,
  className,
  shortcutLabel,
  onShortcutClick,
  inputRef,
}: ShortcutSearchFieldProps) {
  const localInputRef = React.useRef<HTMLInputElement | null>(null);
  const mergedInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      localInputRef.current = node;
      setRef(inputRef, node);
    },
    [inputRef],
  );
  const shortcutText = shortcutLabel ?? 'Search';

  return (
    <div className={cn('pdui-search-field', className)}>
      <SearchInput
        inputRef={mergedInputRef}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        onClear={onClear}
      />
      <Button
        className="pdui-search-field__shortcut"
        type="button"
        variant="ghost"
        size="sm"
        aria-label={shortcutLabel ? `Focus search ${shortcutLabel}` : 'Focus search'}
        onClick={() => {
          localInputRef.current?.focus();
          onShortcutClick?.();
        }}
      >
        {shortcutText}
      </Button>
    </div>
  );
}
