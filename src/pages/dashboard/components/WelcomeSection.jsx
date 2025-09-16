import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const WelcomeSection = ({ user }) => {
  const currentHour = new Date()?.getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-success/5 to-accent/10 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-primary/20">
            <Image
              src={user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
              alt={`${user?.name || 'User'} profile picture`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-background flex items-center justify-center">
            <Icon name="Zap" size={12} color="white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {getGreeting()}, {user?.name || 'Fitness Enthusiast'}!
          </h1>
          <p className="text-muted-foreground">
            Ready to crush your fitness goals today? Let's get moving! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;