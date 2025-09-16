import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DailyTipsCard = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    {
      type: 'tip',
      icon: 'Lightbulb',
      title: 'Hydration Reminder',
      content: 'Drink water before, during, and after your workout. Aim for 8-10 glasses throughout the day to maintain optimal performance.',
      category: 'Nutrition'
    },
    {
      type: 'motivation',
      icon: 'Heart',
      title: 'Daily Motivation',
      content: 'Every workout is a step closer to your goals. Progress, not perfection, is what matters most. You\'ve got this! 💪',
      category: 'Mindset'
    },
    {
      type: 'tip',
      icon: 'Target',
      title: 'Form Focus',
      content: 'Quality over quantity! Focus on proper form rather than speed. Better form leads to better results and prevents injuries.',
      category: 'Technique'
    },
    {
      type: 'motivation',
      icon: 'Trophy',
      title: 'Achievement Mindset',
      content: 'Celebrate small wins! Each completed workout is a victory. Your consistency today builds the strength of tomorrow.',
      category: 'Success'
    },
    {
      type: 'tip',
      icon: 'Moon',
      title: 'Recovery Tip',
      content: 'Get 7-9 hours of quality sleep. Your muscles grow and recover during rest, making sleep as important as your workout.',
      category: 'Recovery'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips?.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [tips?.length]);

  const currentTip = tips?.[currentTipIndex];

  const handlePrevious = () => {
    setCurrentTipIndex((prevIndex) => 
      prevIndex === 0 ? tips?.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips?.length);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Nutrition': return 'bg-success/10 text-success';
      case 'Mindset': return 'bg-primary/10 text-primary';
      case 'Technique': return 'bg-warning/10 text-warning';
      case 'Success': return 'bg-accent/10 text-accent';
      case 'Recovery': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            currentTip?.type === 'motivation' ? 'bg-primary/10' : 'bg-success/10'
          }`}>
            <Icon 
              name={currentTip?.icon} 
              size={18} 
              className={currentTip?.type === 'motivation' ? 'text-primary' : 'text-success'} 
            />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">
              {currentTip?.type === 'motivation' ? 'Daily Motivation' : 'Fitness Tip'}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(currentTip?.category)}`}>
              {currentTip?.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="w-8 h-8"
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="w-8 h-8"
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-medium text-card-foreground mb-2">
          {currentTip?.title}
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {currentTip?.content}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {tips?.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTipIndex ? 'bg-primary w-6' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {currentTipIndex + 1} of {tips?.length}
        </div>
      </div>
    </div>
  );
};

export default DailyTipsCard;