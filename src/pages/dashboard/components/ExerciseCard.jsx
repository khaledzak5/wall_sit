import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();
  const isTimeBased = useMemo(() => {
    const timeNames = new Set([
      'Mountain Climbers',
      'Jumping Jacks',
      'High Knees',
      'Plank',
      'Side Plank',
      'Wall Sit'
    ]);
    return timeNames.has(exercise?.name) || typeof exercise?.reps === 'string';
  }, [exercise]);

  const [formState, setFormState] = useState({
    sets: exercise?.sets || 3,
    reps: typeof exercise?.reps === 'number' ? exercise?.reps : '',
    durationSeconds: typeof exercise?.reps === 'string' ? parseInt(String(exercise?.reps).replace(/\D/g, ''), 10) || 30 : 30,
    notes: ''
  });

  const updateField = (field, value) => setFormState(prev => ({ ...prev, [field]: value }));

  const handleStartWorkout = () => {
    navigate('/exercise-workout-screen', { state: { selectedExercise: exercise } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success/10 text-success border-success/20';
      case 'Intermediate': return 'bg-warning/10 text-warning border-warning/20';
      case 'Advanced': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getExerciseIcon = (name) => {
    const iconMap = {
      'Push-ups': 'ArrowUp',
      'Squats': 'ArrowDown',
      'Lunges': 'ArrowRight',
      'Burpees': 'Zap',
      'Mountain Climbers': 'Mountain',
      'Jumping Jacks': 'Users',
      'High Knees': 'ArrowUp',
      'Plank': 'Minus',
      'Side Plank': 'RotateCcw',
      'Wall Sit': 'Square'
    };
    return iconMap?.[name] || 'Activity';
  };

  return (
    <div className="bg-card border border-border rounded-[20px] p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon name={getExerciseIcon(exercise?.name)} size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {exercise?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {exercise?.targetMuscles}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise?.difficulty)}`}>
          {exercise?.difficulty}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>{exercise?.duration} min</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Flame" size={14} />
            <span>{exercise?.caloriesBurn} cal</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="RotateCcw" size={14} />
            <span>{exercise?.sets} sets</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Hash" size={14} />
            <span>{exercise?.reps} reps</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {exercise?.description}
        </p>
      </div>
      {/* Inputs for plan configuration */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          label="Sets"
          type="number"
          min={1}
          value={formState.sets}
          onChange={(e) => updateField('sets', Number(e.target.value))}
        />
        {isTimeBased ? (
          <Input
            label="Time (sec)"
            type="number"
            min={5}
            step={5}
            value={formState.durationSeconds}
            onChange={(e) => updateField('durationSeconds', Number(e.target.value))}
          />
        ) : (
          <Input
            label="Reps"
            type="number"
            min={1}
            value={formState.reps}
            onChange={(e) => updateField('reps', Number(e.target.value))}
          />
        )}
      </div>
      <div className="mb-4">
        <Input
          label="Notes (optional)"
          type="text"
          placeholder="Add any notes"
          value={formState.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={handleStartWorkout}
          className="w-full"
          iconName="Play"
          iconPosition="left"
          size="lg"
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default ExerciseCard;