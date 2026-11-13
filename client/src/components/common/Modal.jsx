import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — reusable modal/dialog component with backdrop
 * Supports custom sizing and close on backdrop click
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal content */}
      <div
        className={`
          relative w-full ${sizes[size]} bg-navy-800 border border-white/10
          rounded-2xl shadow-2xl animate-slide-up z-10
          ${className}
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
