import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const InternetIdentityRegister = ({ isLoading: parentLoading = false }) => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  
  const isLoading = parentLoading || authLoading;

  const handleRegister = async () => {
    try {
      setError('');
      // Internet Identity handles both login and registration
      // If user doesn't have an identity, II will guide them through creation
      await login();
      // Navigate to onboarding for new users to complete their profile
      navigate('/onboarding', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
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

      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Create Your Digital Identity</h2>
        <p className="text-muted-foreground">
          Internet Identity provides a secure, passwordless way to access your fitness journey.
        </p>
      </div>

      {/* Internet Identity Features */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Internet Identity</h3>
            <p className="text-sm text-muted-foreground">Your secure gateway to the decentralized web</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>No passwords to remember</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>Biometric authentication</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>Hardware security keys</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>Fully decentralized</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>Privacy-focused</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
            <span>Cross-device sync</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-foreground flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span>How it works</span>
        </h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
            <span>Click "Create Internet Identity" below</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
            <span>Choose your authentication method (biometrics, security key, or recovery phrase)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
            <span>Your secure digital identity is created and ready to use</span>
          </div>
        </div>
      </div>

      {/* Register Button */}
      <Button
        onClick={handleRegister}
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="h-12 flex items-center justify-center space-x-2"
      >
        <Icon name="UserPlus" size={18} className="text-[#edad45]" />
        <span>Create Internet Identity</span>
      </Button>

      {/* Support Info */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Supported on all modern devices and browsers
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Smartphone" size={12} />
            <span>iOS & Android</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Monitor" size={12} />
            <span>Desktop</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Key" size={12} />
            <span>YubiKey & More</span>
          </div>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Already have an Internet Identity?{' '}
          <button
            type="button"
            onClick={() => navigate('/login-screen')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default InternetIdentityRegister;