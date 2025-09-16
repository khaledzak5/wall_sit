import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import InternetIdentityLogin from './components/InternetIdentityLogin';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
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
    }
  }, [isAuthenticated, loading, navigate]);

  // Enforce dark mode on the login screen only
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    return () => {
      root.classList.remove('dark');
    };
  }, []);
  return (
    <AuthenticationLayout>
      <div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to ATOS fit</h2>
        {/* Restore the login form */}
        <React.Suspense fallback={<div>Loading...</div>}>
          {/** Dynamically import LoginForm to avoid breaking changes if not present **/}
          {(() => {
            try {
              const LoginForm = require('./components/LoginForm').default;
              return <LoginForm />;
            } catch (e) {
              return <InternetIdentityLogin />;
            }
          })()}
        </React.Suspense>
      </div>
    </AuthenticationLayout>
  );
  
};

export default LoginScreen;