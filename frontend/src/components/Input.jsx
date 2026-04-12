import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  id, 
  error, 
  className = '', 
  isTextArea = false,
  ...props 
}, ref) => {
  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <Component
          id={id}
          ref={ref}
          className={`
            w-full bg-slate-900/50 border border-slate-700 rounded-xl
            px-4 py-3 text-slate-100 placeholder:text-slate-500
            transition-all duration-300 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            hover:border-slate-500 hover:bg-slate-800/50
            ${isTextArea ? 'resize-y min-h-[120px]' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
        {/* Glow effect behind the input - visible only on focus within the group */}
        <div className="absolute inset-0 -z-10 rounded-xl bg-blue-500/0 blur-md transition-all duration-300 group-focus-within:bg-blue-500/20" />
      </div>
      {error && (
        <p className="text-sm text-red-400 ml-1 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
