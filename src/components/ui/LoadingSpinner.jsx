import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    success: 'border-success border-t-transparent',
    warning: 'border-warning border-t-transparent',
    error: 'border-error border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}
      />
      {text && (
        <span className="text-sm font-medium text-foreground">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;