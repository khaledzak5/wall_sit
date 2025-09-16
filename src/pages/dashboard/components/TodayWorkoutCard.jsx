import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TodayPlanCustomizer from './TodayPlanCustomizer';

const TodayWorkoutCard = ({ workoutData, onCustomize }) => {
  const navigate = useNavigate();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [plan, setPlan] = useState(null);
  const PLAN_KEY = 'fitcoach_today_plan';

  const todayWorkout = plan || workoutData || {
    name: "Full Body Strength",
    scheduledTime: "6:00 PM",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 15, completed: false },
      { name: "Squats", sets: 3, reps: 20, completed: false },
      { name: "Plank", sets: 3, duration: "30s", completed: false },
      { name: "Lunges", sets: 3, reps: 12, completed: false }
    ],
    estimatedDuration: 25,
    difficulty: "Intermediate"
  };

  const completedExercises = todayWorkout?.exercises?.filter(ex => ex?.completed)?.length;
  const totalExercises = todayWorkout?.exercises?.length;
  const progressPercentage = (completedExercises / totalExercises) * 100;

  const handleStartWorkout = () => {
    // ensure persisted plan exists
    const normalized = {
      ...todayWorkout,
      exercises: todayWorkout.exercises.map(ex => ({ ...ex }))
    };
    localStorage.setItem(PLAN_KEY, JSON.stringify(normalized));
    setPlan(normalized);
    // continue from first incomplete
    const firstIncomplete = normalized.exercises.find(ex => !ex.completed);
    navigate('/exercise-workout-screen', { state: { todayPlan: normalized, selectedExercise: firstIncomplete || normalized.exercises[0] } });
  };

  const handleCustomize = () => {
    setShowCustomizer(true);
  };

  const handleSavePlan = (newPlan) => {
    // reset completion and persist
    const normalized = {
      ...newPlan,
      exercises: newPlan.exercises.map(ex => ({ ...ex, completed: false }))
    };
    localStorage.setItem(PLAN_KEY, JSON.stringify(normalized));
    setPlan(normalized);
    setShowCustomizer(false);
  };

  const handleCancelCustomize = () => setShowCustomizer(false);

  // Load plan from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.exercises?.length) setPlan(parsed);
      }
    } catch {}
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-elevation-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground mb-1">
            Today's Workout
          </h2>
          <p className="text-muted-foreground text-sm">
            Scheduled for {todayWorkout?.scheduledTime}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
            <Icon name="Clock" size={16} />
            <span>{todayWorkout?.estimatedDuration} min</span>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            todayWorkout?.difficulty === 'Beginner' ? 'bg-success/10 text-success' :
            todayWorkout?.difficulty === 'Intermediate'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
          }`}>
            {todayWorkout?.difficulty}
          </span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-card-foreground">{todayWorkout?.name}</span>
          <span className="text-muted-foreground">
            {completedExercises}/{totalExercises} exercises
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {todayWorkout?.exercises?.map((exercise, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              exercise?.completed ? 'bg-success' : 'bg-muted border-2 border-border'
            }`}>
              {exercise?.completed && <Icon name="Check" size={12} color="white" />}
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${
                exercise?.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'
              }`}>
                {exercise?.name}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {exercise?.sets} sets × {exercise?.reps || exercise?.duration}
              </span>
            </div>
            {!exercise?.completed ? (
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigate('/exercise-workout-screen', { state: { selectedExercise: exercise, todayPlan: todayWorkout } })}
              >
                Start
              </Button>
            ) : (
              <span className="text-xs text-success font-medium">Done</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-3">
        <Button
          variant="default"
          onClick={handleStartWorkout}
          className="flex-1"
          iconName="Play"
          iconPosition="left"
        >
          {completedExercises > 0 ? 'Continue Workout' : 'Start Workout'}
        </Button>
        <Button
          variant="outline"
          iconName="Settings"
          className="px-4"
          onClick={handleCustomize}
        >
          Customize
        </Button>
      </div>
      {showCustomizer && (
        <TodayPlanCustomizer
          exercises={[
            { id: 1, name: 'Push-ups', category: 'Upper Body', difficulty: 'Beginner', sets: 3, reps: 15, duration: '3-5 min' },
            { id: 2, name: 'Squats', category: 'Lower Body', difficulty: 'Beginner', sets: 3, reps: 20, duration: '4-6 min' },
            { id: 3, name: 'Lunges', category: 'Lower Body', difficulty: 'Intermediate', sets: 3, reps: 12, duration: '5-7 min' },
            { id: 4, name: 'Burpees', category: 'Full Body', difficulty: 'Advanced', sets: 3, reps: 10, duration: '6-8 min' },
            { id: 5, name: 'Mountain Climbers', category: 'Cardio', difficulty: 'Intermediate', sets: 3, reps: '20s', duration: '3-5 min' },
            { id: 6, name: 'Jumping Jacks', category: 'Cardio', difficulty: 'Beginner', sets: 3, reps: '30s', duration: '2-4 min' },
            { id: 7, name: 'High Knees', category: 'Cardio', difficulty: 'Beginner', sets: 3, reps: '25s', duration: '2-3 min' },
            { id: 8, name: 'Plank', category: 'Core', difficulty: 'Intermediate', sets: 3, reps: '30s', duration: '1-3 min' },
            { id: 9, name: 'Side Plank', category: 'Core', difficulty: 'Intermediate', sets: 3, reps: '20s', duration: '2-4 min' },
            { id: 10, name: 'Wall Sit', category: 'Lower Body', difficulty: 'Beginner', sets: 3, reps: '30s', duration: '1-2 min' }
          ]}
          onSave={handleSavePlan}
          onCancel={handleCancelCustomize}
        />
      )}
    </div>
  );
};

export default TodayWorkoutCard;