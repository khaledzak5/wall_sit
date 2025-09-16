import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const InternetIdentityLogin = ({ isLoading: parentLoading = false }) => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  
  const isLoading = parentLoading || authLoading;

  const handleLogin = async () => {
    try {
      setError('');
      await login();
      
      // Check if user has completed onboarding
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // If user has basic profile data, go to dashboard, otherwise onboarding
        if (user.name && user.email) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // New user, redirect to onboarding
        navigate('/onboarding', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Internet Identity Info */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Internet Identity</h3>
            <p className="text-sm text-muted-foreground">Secure, passwordless authentication</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-green-500" />
            <span>No passwords to remember</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-green-500" />
            <span>Biometric authentication support</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-green-500" />
            <span>Hardware security key compatible</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-green-500" />
            <span>Fully decentralized</span>
          </div>
        </div>
      </div>

      {/* Login Button */}
      <Button
        onClick={handleLogin}
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="h-12 flex items-center justify-center space-x-2"
      >
        <Icon name="LogIn" size={18} className="text-[#edad45]" />
        <span>Sign In</span>
      </Button>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          New to Internet Identity? Don't worry! The system will guide you through creating your secure digital identity.
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Smartphone" size={12} />
            <span>Mobile</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Monitor" size={12} />
            <span>Desktop</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Key" size={12} />
            <span>Hardware Keys</span>
          </div>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Don't have an Internet Identity?{' '}
          <button
            type="button"
            onClick={() => navigate('/register-screen')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            disabled={isLoading}
          >
            Create One
          </button>
        </p>
      </div>
    </div>
  );
};

export default InternetIdentityLogin;