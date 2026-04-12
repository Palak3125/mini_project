import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) {
  const baseStyles = "glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden";
  const hoverStyles = hoverEffect ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-white/20" : "";

  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* Subtle top highlight to enhance glass effect */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
