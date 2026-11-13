import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Field } from './Field.js';
import { FieldRow } from './FieldRow.js';
import { Input } from './Input.js';
import { Textarea } from './Textarea.js';

describe('Field', () => {
  it('renders a div with .field class', () => {
    render(<Field data-testid="f" />);
    const el = screen.getByTestId('f');
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('field')).toBe(true);
  });

  it('renders label element when label prop is set', () => {
    render(
      <Field label="Name" htmlFor="name-input">
        <Input id="name-input" data-testid="inp" />
      </Field>,
    );
    const label = screen.getByText('Name');
    expect(label.tagName).toBe('LABEL');
  });

  it('associates label with input via htmlFor/id', () => {
    render(
      <Field label="Email" htmlFor="email">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const label = screen.getByText('Email');
    expect(label.getAttribute('for')).toBe('email');
    // @testing-library: getByLabelText should find the input
    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('email');
  });

  it('renders error slot with role=status when error prop is set', () => {
    render(<Field label="Age" htmlFor="age" error="Age is required" data-testid="f" />);
    const error = screen.getByRole('status');
    expect(error.textContent).toBe('Age is required');
    expect(error.classList.contains('field-error')).toBe(true);
  });

  it('gives the error span a stable id derived from htmlFor', () => {
    render(
      <Field label="Age" htmlFor="age" error="Age is required" data-testid="f">
        <Input id="age" data-testid="inp" />
      </Field>,
    );
    const errorSpan = screen.getByRole('status');
    expect(errorSpan.id).toBe('age-error');
  });

  it('uses an explicit errorId prop when provided', () => {
    render(
      <Field label="Age" htmlFor="age" error="Age is required" errorId="custom-err" data-testid="f">
        <Input id="age" data-testid="inp" />
      </Field>,
    );
    const errorSpan = screen.getByRole('status');
    expect(errorSpan.id).toBe('custom-err');
  });

  it('does NOT render error slot when error prop is not set', () => {
    render(<Field label="Name" htmlFor="name" data-testid="f" />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does NOT render error slot when error is empty string', () => {
    render(<Field label="Name" htmlFor="name" error="" data-testid="f" />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does NOT render label when label prop not provided', () => {
    render(
      <Field data-testid="f">
        <Input id="x" />
      </Field>,
    );
    // The only element in the field should be the input, no label element
    const field = screen.getByTestId('f');
    expect(field.querySelector('label')).toBeNull();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Field ref={ref} />);
    expect(ref.current?.classList.contains('field')).toBe(true);
  });

  it('merges custom className', () => {
    render(<Field className="extra" data-testid="f" />);
    const el = screen.getByTestId('f');
    expect(el.classList.contains('field')).toBe(true);
    expect(el.classList.contains('extra')).toBe(true);
  });

  it('shows a closed Help disclosure under the control and reveals the help when opened', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Learning rate" htmlFor="lr" help={<p>Lower values stay stable.</p>}>
        <Input id="lr" />
      </Field>,
    );

    const summary = screen.getByText('Help');
    expect(summary.tagName).toBe('SUMMARY');
    const details = summary.closest('details');
    expect(details).not.toBeNull();
    expect(details?.classList.contains('field-help')).toBe(true);
    expect(details?.open).toBe(false);
    const input = screen.getByLabelText('Learning rate');
    expect(
      input.compareDocumentPosition(details as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(summary);
    expect(details?.open).toBe(true);
    expect(screen.getByText('Lower values stay stable.')).toBeTruthy();
  });

  it('uses helpLabel as the disclosure summary', () => {
    render(
      <Field
        label="Learning rate"
        htmlFor="lr"
        help={<p>Stable range.</p>}
        helpLabel="What is learning rate?"
      >
        <Input id="lr" />
      </Field>,
    );
    expect(screen.getByText('What is learning rate?').tagName).toBe('SUMMARY');
    expect(screen.queryByText('Help')).toBeNull();
  });

  it('keeps the error available when help is also set', async () => {
    const user = userEvent.setup();
    render(
      <Field
        label="Learning rate"
        htmlFor="lr"
        help={<p>Stable range.</p>}
        error="value is not a valid float"
      >
        <Input id="lr" />
      </Field>,
    );

    const error = screen.getByRole('status');
    expect(error.textContent).toBe('value is not a valid float');
    expect(error.id).toBe('lr-error');
    const details = screen.getByText('Help').closest('details');
    expect(
      (details as HTMLElement).compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const input = screen.getByLabelText('Learning rate');
    expect(input.getAttribute('aria-describedby')).toBe('lr-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    await user.click(screen.getByText('Help'));
    expect(screen.getByRole('status').textContent).toBe('value is not a valid float');
    expect(screen.getByText('Stable range.')).toBeTruthy();
  });

  it('renders no help disclosure when help is omitted', () => {
    render(
      <Field label="Name" htmlFor="name">
        <Input id="name" />
      </Field>,
    );
    expect(document.querySelector('details')).toBeNull();
    expect(screen.queryByText('Help')).toBeNull();
    const input = screen.getByLabelText('Name');
    expect(input.id).toBe('name');
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});

describe('Field + Input a11y association (#48)', () => {
  it('sets aria-describedby on Input to the error span id when Field has an error', () => {
    render(
      <Field htmlFor="email" error="Email is required">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    const errorSpan = screen.getByRole('status');
    expect(errorSpan.id).toBe('email-error');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');
  });

  it('sets aria-invalid="true" on Input when Field has an error', () => {
    render(
      <Field htmlFor="email" error="Email is required">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('does NOT set aria-describedby or aria-invalid on Input when Field has no error', () => {
    render(
      <Field htmlFor="email">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('does NOT set aria-describedby or aria-invalid when Field error is empty string', () => {
    render(
      <Field htmlFor="email" error="">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('caller-supplied aria-describedby on Input takes precedence over Field wiring', () => {
    render(
      <Field htmlFor="email" error="Email is required">
        <Input id="email" data-testid="inp" aria-describedby="my-own-desc" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-describedby')).toBe('my-own-desc');
  });

  it('caller-supplied aria-invalid on Input takes precedence over Field wiring', () => {
    render(
      <Field htmlFor="email" error="Email is required">
        <Input id="email" data-testid="inp" aria-invalid={false} />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('uses explicit errorId on Field for aria-describedby', () => {
    render(
      <Field htmlFor="email" error="Email is required" errorId="custom-error-id">
        <Input id="email" data-testid="inp" />
      </Field>,
    );
    const input = screen.getByTestId('inp');
    expect(input.getAttribute('aria-describedby')).toBe('custom-error-id');
  });
});

describe('Field + Textarea a11y association (#48)', () => {
  it('sets aria-describedby on Textarea to the error span id when Field has an error', () => {
    render(
      <Field htmlFor="notes" error="Notes are required">
        <Textarea id="notes" data-testid="ta" />
      </Field>,
    );
    const ta = screen.getByTestId('ta');
    const errorSpan = screen.getByRole('status');
    expect(errorSpan.id).toBe('notes-error');
    expect(ta.getAttribute('aria-describedby')).toBe('notes-error');
  });

  it('sets aria-invalid="true" on Textarea when Field has an error', () => {
    render(
      <Field htmlFor="notes" error="Notes are required">
        <Textarea id="notes" data-testid="ta" />
      </Field>,
    );
    const ta = screen.getByTestId('ta');
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });

  it('does NOT set aria-describedby or aria-invalid on Textarea when Field has no error', () => {
    render(
      <Field htmlFor="notes">
        <Textarea id="notes" data-testid="ta" />
      </Field>,
    );
    const ta = screen.getByTestId('ta');
    expect(ta.getAttribute('aria-describedby')).toBeNull();
    expect(ta.getAttribute('aria-invalid')).toBeNull();
  });

  it('caller-supplied aria-describedby on Textarea takes precedence over Field wiring', () => {
    render(
      <Field htmlFor="notes" error="Notes are required">
        <Textarea id="notes" data-testid="ta" aria-describedby="my-desc" />
      </Field>,
    );
    const ta = screen.getByTestId('ta');
    expect(ta.getAttribute('aria-describedby')).toBe('my-desc');
  });
});

describe('FieldRow', () => {
  it('renders a div with .field-row class', () => {
    render(<FieldRow data-testid="fr" />);
    const el = screen.getByTestId('fr');
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('field-row')).toBe(true);
  });

  it('renders children', () => {
    render(
      <FieldRow>
        <Field label="First" htmlFor="first" />
        <Field label="Last" htmlFor="last" />
      </FieldRow>,
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Last')).toBeTruthy();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FieldRow ref={ref} />);
    expect(ref.current?.classList.contains('field-row')).toBe(true);
  });
});
