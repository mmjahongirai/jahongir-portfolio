import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-content-tertiary uppercase tracking-wide mb-2"
          >
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={`form-input ${className}`.trim()} {...props} />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
};

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-content-tertiary uppercase tracking-wide mb-2"
          >
            {label}
          </label>
        )}
        <textarea ref={ref} id={inputId} className={`form-input ${className}`.trim()} {...props} />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
