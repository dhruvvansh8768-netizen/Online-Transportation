import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — reusable button component with multiple variants
 * Variants: primary, secondary, outline, danger, ghost
 * Sizes: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: 'bg-accent hover:bg-accent-light text-navy-900 font-semibold shadow-lg shadow-accent/20',
    secondary: 'bg-navy-700 hover:bg-navy-600 text-white border border-white/10',
    outline: 'bg-transparent hover:bg-white/5 text-accent border-2 border-accent',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-navy-900
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </button>
  );
};

export default Button;
