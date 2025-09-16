import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsCard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: 'Exercise Library',
      description: 'Browse our exercise collection',
      icon: 'BookOpen',
      color: 'bg-primary/10 text-primary',
      action: () => navigate('/exercise-library')
    },
    {
      id: 2,
      title: 'Live Camera Workout',
      description: 'Start real-time pose analysis',
      icon: 'Camera',
      color: 'bg-success/10 text-success',
      action: () => navigate('/exercise-workout-screen', { state: { mode: 'camera' } })
    },
    {
      id: 3,
      title: 'Upload Video Analysis',
      description: 'Analyze your workout form',
      icon: 'Upload',
      color: 'bg-accent/10 text-accent',
      action: () => navigate('/exercise-workout-screen', { state: { mode: 'upload' } })
    },
    {
      id: 4,
      title: 'AI Assistant',
      description: 'Get personalized coaching',
      icon: 'MessageCircle',
      color: 'bg-warning/10 text-warning',
      action: () => navigate('/ai-assistant-food-scanner')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-2">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Zap" size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-card-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Jump into your fitness journey</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="p-4 rounded-lg border border-border hover:border-primary/30 bg-background hover:bg-muted/50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action?.color} group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                  {action?.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {action?.description}
                </p>
              </div>
              <Icon 
                name="ArrowRight" 
                size={16} 
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
              />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Sparkles" size={14} />
            <span>AI-powered features available</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/user-profile')}
            iconName="Settings"
            iconPosition="left"
          >
            Customize
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;