export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled = false,
  isLoading = false,
  ...props 
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center';
  
  const variants = {
    primary: 'bg-primary-600 text-black hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl font-semibold',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 border-2 border-slate-400 font-semibold shadow-md hover:shadow-lg',
    tertiary: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100 font-semibold',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg hover:shadow-xl font-semibold',
    outline: 'border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 active:bg-primary-100 font-semibold shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
