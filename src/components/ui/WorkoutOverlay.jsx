import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const WorkoutOverlay = ({ 
  isMinimized = false,
  onToggleMinimize,
  workoutData = null,
  onExitWorkout,
  className = ""
}) => {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitWorkout = () => {
    if (onExitWorkout) {
      onExitWorkout();
    } else {
      navigate('/dashboard');
    }
    setShowExitConfirm(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const currentWorkout = workoutData || {
    name: 'Full Body Strength',
    currentExercise: 'Push-ups',
    exerciseNumber: 3,
    totalExercises: 8,
    timeElapsed: 1245, // seconds
    caloriesBurned: 156,
    heartRate: 142
  };

  if (isMinimized) {
    return (
      <div className={`fixed top-20 right-4 bg-card border border-border rounded-lg shadow-elevation-3 z-workout-overlay ${className}`}>
        <div className="p-3 flex items-center space-x-3">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">
              {currentWorkout?.currentExercise}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(currentWorkout?.timeElapsed)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMinimize}
            className="w-8 h-8"
          >
            <Icon name="Maximize2" size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Overlay Header */}
      <div className={`fixed top-16 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border z-workout-overlay ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Workout Info */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExitConfirm(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-card-foreground">
                  {currentWorkout?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Exercise {currentWorkout?.exerciseNumber} of {currentWorkout?.totalExercises}
                </p>
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMinimize}
                className="hidden md:flex"
              >
                <Icon name="Minimize2" size={18} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="Settings" size={18} />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((currentWorkout?.exerciseNumber / currentWorkout?.totalExercises) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentWorkout?.exerciseNumber / currentWorkout?.totalExercises) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Bar - Desktop Only */}
        <div className="hidden lg:block border-t border-border bg-muted/50">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <span className="text-sm font-mono text-card-foreground">
                  {formatTime(currentWorkout?.timeElapsed)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="Flame" size={16} className="text-accent" />
                <span className="text-sm font-mono text-card-foreground">
                  {currentWorkout?.caloriesBurned} cal
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="Heart" size={16} className="text-error" />
                <span className="text-sm font-mono text-card-foreground">
                  {currentWorkout?.heartRate} bpm
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Current: <span className="font-medium text-card-foreground">{currentWorkout?.currentExercise}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Stats Overlay */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg shadow-elevation-3 z-workout-overlay">
        <div className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} className="text-muted-foreground" />
                <span className="font-mono text-card-foreground">
                  {formatTime(currentWorkout?.timeElapsed)}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Icon name="Flame" size={14} className="text-accent" />
                <span className="font-mono text-card-foreground">
                  {currentWorkout?.caloriesBurned}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Icon name="Heart" size={14} className="text-error" />
                <span className="font-mono text-card-foreground">
                  {currentWorkout?.heartRate}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
            >
              <Icon name="Minimize2" size={14} />
            </Button>
          </div>
        </div>
      </div>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Exit Workout?</h3>
                  <p className="text-sm text-muted-foreground">Your progress will be saved</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to exit your current workout? Your progress will be saved and you can resume later.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1"
                >
                  Continue Workout
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleExitWorkout}
                  className="flex-1"
                >
                  Exit Workout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutOverlay;