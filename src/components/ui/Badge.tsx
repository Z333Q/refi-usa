interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'mint';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const styles = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-charcoal-lighter border-charcoal-border text-gray-300',
    neutral: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    mint: 'bg-mint/10 border-mint/20 text-mint',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-medium font-sans ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
