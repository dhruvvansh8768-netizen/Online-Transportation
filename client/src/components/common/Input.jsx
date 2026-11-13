import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input — reusable input component with label, icon, and error support
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  name,
  className = '',
  helperText,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = showPasswordToggle && type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input element */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? name + "-error" : helperText ? name + "-hint" : undefined}
          className={`
            w-full bg-navy-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${showPasswordToggle ? 'pr-11' : ''}
            ${error ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' : 'border-white/10 hover:border-white/20'}
          `}
          {...props}
        />

        {/* Password toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={name + "-error"} className="text-sm text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p id={name + "-hint"} className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
