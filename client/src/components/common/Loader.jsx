import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loader — loading spinner component
 * Sizes: sm, md, lg
 */
const Loader = ({ size = 'md', text = '', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizes[size]} text-accent animate-spin`} />
        <div className={`absolute inset-0 ${sizes[size]} border-2 border-accent/20 rounded-full`} />
      </div>
      {text && (
        <p className={`${textSizes[size]} text-gray-400 animate-pulse`}>{text}</p>
      )}
    </div>
  );
};

export default Loader;
