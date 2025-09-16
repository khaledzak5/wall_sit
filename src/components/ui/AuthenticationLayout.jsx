import React from 'react';
import Icon from '../AppIcon';

const AuthenticationLayout = ({ 
  children, 
  title, 
  subtitle,
  showLogo = true,
  className = ""
}) => {
  return (
    <div
      className={`min-h-screen bg-cover bg-center flex items-center justify-center p-4 ${className}`}
      style={{ backgroundImage: "url('/pp.png')" }}
    >
        {/* Main Container */}
        <div className="relative w-full max-w-md">
        {/* Logo Section */}
        {showLogo && (
          <div className="text-center mb-8">
            <img src="/assets/images/atosfit.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-foreground mb-2">ATOS fit</h1>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl shadow-elevation-3 p-8 animate-spring">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h2 className="text-2xl font-semibold text-card-foreground mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-muted-foreground text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <button className="text-primary hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-primary hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>

      {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-success/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse delay-500" />
    </div>
  );
};

export default AuthenticationLayout;