import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  icon: Icon,
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ease-out active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-white/10 focus:ring-blue-500",
    secondary: "bg-white/5 hover:bg-white/10 text-slate-100 border border-white/10 backdrop-blur-sm hover:border-white/20 shadow-lg focus:ring-slate-400",
    outline: "border-2 border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white bg-transparent hover:bg-slate-800/50 shadow-sm focus:ring-blue-500"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {/* Subtle glow effect behind the button texts */}
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity blur-md" />
      )}
      
      <span className="relative flex items-center gap-2 z-10">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {!isLoading && Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
        {children}
      </span>
    </button>
  );
}
