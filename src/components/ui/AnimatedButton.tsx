import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  glowEffect?: boolean;
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false,
  glowEffect = false,
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 ease-smooth focus-visible:outline-none 
    focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none 
    disabled:opacity-50 overflow-hidden group transform-gpu
    ${fullWidth ? 'w-full' : ''}
    ${isPressed ? 'scale-95' : 'hover:scale-105'}
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-[#3b8169] text-white 
      shadow-lg hover:shadow-xl hover:shadow-[#3b8169]/25 focus-visible:ring-[#3b8169]
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
      before:via-white/20 before:to-transparent before:translate-x-[-100%] 
      hover:before:translate-x-[100%] before:transition-transform before:duration-700
      ${glowEffect ? 'hover:shadow-glow' : ''}
    `,
    secondary: `
      bg-white border-2 border-secondary-300 text-secondary-700 shadow-sm 
      hover:bg-secondary-50 hover:border-secondary-400 hover:shadow-md 
      focus-visible:ring-secondary-500
    `,
    ghost: `
      bg-transparent text-secondary-600 hover:bg-secondary-100 
      hover:text-secondary-900 focus-visible:ring-secondary-500
    `,
    success: `
      bg-[#3b8169] text-white 
      shadow-lg hover:shadow-xl hover:shadow-[#3b8169]/25 focus-visible:ring-[#3b8169]
    `,
    warning: `
      bg-gradient-to-r from-warning-500 to-warning-600 text-white 
      shadow-lg hover:shadow-xl hover:shadow-warning-500/25 focus-visible:ring-warning-500
    `,
    error: `
      bg-gradient-to-r from-error-500 to-error-600 text-white 
      shadow-lg hover:shadow-xl hover:shadow-error-500/25 focus-visible:ring-error-500
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button content */}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </div>
    </button>
  );
}
