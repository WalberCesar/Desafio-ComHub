// =============================================================================
// COMPONENTE INPUT - UI PitchLab
// =============================================================================

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 text-gray-900'
    }
    ${className}
  `.trim();

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <input
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}