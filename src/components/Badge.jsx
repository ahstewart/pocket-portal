export default function Badge({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-accent-lime/10 text-accent-lime-700',
    warning: 'bg-accent-amber/10 text-accent-amber-700',
    danger: 'bg-red-100 text-red-800',
    slate: 'bg-slate-100 text-slate-800',
    lime: 'bg-lime-100 text-lime-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
