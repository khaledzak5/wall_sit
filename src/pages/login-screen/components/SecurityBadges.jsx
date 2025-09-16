import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
    },
    {
      icon: 'Lock',
    },
    {
      icon: 'CheckCircle',
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
      {securityFeatures?.map((feature, index) => (
        <div key={index} className="flex items-center space-x-1">
          <Icon name={feature?.icon} size={14} className="text-success" />
          <span>{feature?.text}</span>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;