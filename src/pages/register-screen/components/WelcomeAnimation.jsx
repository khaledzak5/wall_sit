import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeAnimation = ({ isVisible, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1500);
    const timer3 = setTimeout(() => setStep(3), 2500);
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-success/20 flex items-center justify-center z-50">
      <div className="text-center space-y-6 animate-spring">
        {/* Animated Logo */}
        <div className={`transition-all duration-1000 ${step >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Icon name="Zap" size={48} color="white" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className={`transition-all duration-1000 delay-500 ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to ATOS fit!</h1>
          <p className="text-lg text-muted-foreground">Your fitness journey starts now</p>
        </div>

        {/* Success Icons */}
        <div className={`flex justify-center space-x-4 transition-all duration-1000 delay-1000 ${step >= 2 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
            <Icon name="Check" size={24} color="white" />
          </div>
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={24} color="white" />
          </div>
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Target" size={24} color="white" />
          </div>
        </div>

        {/* Loading Message */}
        <div className={`transition-all duration-1000 delay-1500 ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <p className="text-muted-foreground">Setting up your personalized dashboard...</p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;