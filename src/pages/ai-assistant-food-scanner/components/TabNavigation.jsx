import React from 'react';
import Icon from '../../../components/AppIcon';

const TabNavigation = ({ activeTab, onTabChange, className = "" }) => {
  const tabs = [
    {
      id: 'chat',
      label: 'Chat Assistant',
      icon: 'MessageCircle',
      description: 'AI fitness coaching'
    },
    {
      id: 'scanner',
      label: 'Food Scanner',
      icon: 'Camera',
      description: 'Nutrition analysis'
    }
  ];

  return (
    <div className={`bg-muted rounded-xl p-1 ${className}`}>
      <div className="flex space-x-1">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab?.id
                ? 'bg-background text-foreground shadow-elevation-1'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <Icon name={tab?.icon} size={18} />
            <div className="hidden sm:block text-left">
              <div className="font-medium">{tab?.label}</div>
              <div className="text-xs opacity-70">{tab?.description}</div>
            </div>
            <span className="sm:hidden">{tab?.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;