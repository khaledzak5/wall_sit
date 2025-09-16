import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import InternetIdentityRegister from './components/InternetIdentityRegister';
import WelcomeAnimation from './components/WelcomeAnimation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RegisterScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Enforce dark mode on the registration screen
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    return () => {
      root.classList.remove('dark');
    };
  }, []);

  const handleRegistrationSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Navigation is handled in InternetIdentityRegister component
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Helmet>
        <title>Create Account - ATOS fit</title>
        <meta name="description" content="Join ATOS fit and start your personalized fitness journey with AI-powered coaching, exercise tracking, and nutrition guidance." />
        <meta name="keywords" content="fitness registration, AI fitness coach, workout tracker, health app signup" />
      </Helmet>

      <AuthenticationLayout
        title="Create Your Account"
        subtitle="Join thousands of users achieving their fitness goals with AI-powered coaching"
        showLogo={true}
      >
        <InternetIdentityRegister 
          isLoading={isLoading}
          onSuccess={handleRegistrationSuccess} 
        />
      </AuthenticationLayout>

      <WelcomeAnimation 
        isVisible={showWelcome}
        onComplete={handleWelcomeComplete}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default RegisterScreen;