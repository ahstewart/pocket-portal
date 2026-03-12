export default function Badge({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors';
  
  const variants = {
    primary:   'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-700',
    accent:    'bg-accent-100 text-accent-700',
    teal:      'bg-teal-100 text-teal-700',
    blue:      'bg-blue-100 text-blue-700',
    success:   'bg-emerald-100 text-emerald-800',
    warning:   'bg-amber-100 text-amber-800',
    danger:    'bg-red-100 text-red-800',
    slate:     'bg-slate-100 text-slate-800',
    lime:      'bg-lime-100 text-lime-800',
    rose:      'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
