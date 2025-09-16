import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkoutStats = ({ 
  workoutTime = 0,
  caloriesBurned = 0,
  heartRate = 0,
  formScore = 0,
  repsCompleted = 0,
  isActive = false
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getHeartRateZone = (hr) => {
    if (hr < 100) return { zone: 'Resting', color: 'text-muted-foreground' };
    if (hr < 120) return { zone: 'Light', color: 'text-success' };
    if (hr < 140) return { zone: 'Moderate', color: 'text-warning' };
    if (hr < 160) return { zone: 'Vigorous', color: 'text-accent' };
    return { zone: 'Maximum', color: 'text-error' };
  };

  const getFormScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const heartRateZone = getHeartRateZone(heartRate);

  const stats = [
    {
      icon: 'Clock',
      label: 'Workout Time',
      value: formatTime(workoutTime),
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: 'Flame',
      label: 'Calories Burned',
      value: `${caloriesBurned}`,
      unit: 'cal',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">Workout Stats</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Live' : 'Inactive'}
          </span>
        </div>
      </div>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats?.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 ${stat?.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${stat?.color}`}>
                {stat?.value}
                {stat?.unit && <span className="text-sm font-normal ml-1">{stat?.unit}</span>}
              </p>
              <p className="text-xs text-muted-foreground">{stat?.label}</p>
              {stat?.subtitle && (
                <p className="text-xs text-muted-foreground">{stat?.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Reps Counter */}
      {isActive && (
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Reps Completed</p>
              <p className="text-xs text-muted-foreground">Current session</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-success">{repsCompleted}</p>
            </div>
          </div>
        </div>
      )}
      {/* Heart Rate Chart Placeholder */}
      {heartRate > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Heart Rate Trend</h3>
          <div className="h-20 bg-muted rounded-lg flex items-end justify-center space-x-1 p-2">
            {/* Mock heart rate bars */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="bg-error rounded-sm flex-1 max-w-2"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  opacity: i > 15 ? 1 : 0.3
                }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min ago</span>
            <span>Now</span>
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="flex items-center justify-center space-x-2 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <Icon name="Share" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">Share Stats</span>
        </button>
        <button className="flex items-center justify-center space-x-2 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <Icon name="Download" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">Export Data</span>
        </button>
      </div>
    </div>
  );
};

export default WorkoutStats;