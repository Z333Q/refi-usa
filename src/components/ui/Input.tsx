import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          bg-charcoal border rounded-app-sm px-3 py-2 text-sm text-white
          placeholder:text-gray-500 transition-all duration-150
          focus:outline-none focus:ring-2
          ${error
            ? 'border-error focus:border-error focus:ring-error/30'
            : 'border-gray-600 focus:border-mint focus:ring-mint/30'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
