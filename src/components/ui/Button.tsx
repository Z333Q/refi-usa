import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-app focus:outline-none focus:ring-2 focus:ring-mint/40 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-mint text-charcoal hover:bg-mint-dark disabled:bg-gray-500 disabled:text-gray-300',
    secondary: 'border border-mint text-mint bg-transparent hover:bg-mint/10 disabled:border-gray-700 disabled:text-gray-500',
    tertiary: 'bg-transparent text-gray-300 hover:text-mint disabled:text-gray-500',
    danger: 'border border-error text-error bg-transparent hover:bg-error/10 disabled:border-gray-700 disabled:text-gray-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2',
    lg: 'text-sm px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
