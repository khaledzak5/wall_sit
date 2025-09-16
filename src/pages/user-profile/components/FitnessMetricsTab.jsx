import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FitnessMetricsTab = ({ user, onUpdateMetrics }) => {
  const [editingMetric, setEditingMetric] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newAge, setNewAge] = useState('');
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [showHeightEntry, setShowHeightEntry] = useState(false);
  const [showAgeEntry, setShowAgeEntry] = useState(false);

  const weightHistory = [
    { date: '2024-07-01', weight: 75, label: 'Jul 1' },
    { date: '2024-07-08', weight: 74.5, label: 'Jul 8' },
    { date: '2024-07-15', weight: 74.2, label: 'Jul 15' },
    { date: '2024-07-22', weight: 73.8, label: 'Jul 22' },
    { date: '2024-07-29', weight: 73.5, label: 'Jul 29' },
    { date: '2024-08-05', weight: 73.2, label: 'Aug 5' },
    { date: '2024-08-10', weight: 72.8, label: 'Aug 10' }
  ];

  const fitnessLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Build Endurance' },
    { value: 'strength', label: 'Increase Strength' },
    { value: 'general_fitness', label: 'General Fitness' }
  ];

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters))?.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-warning' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning' };
    return { category: 'Obese', color: 'text-destructive' };
  };

  const handleAddWeight = async () => {
    if (newWeight && !isNaN(newWeight)) {
      onUpdateMetrics({ weight: Number(newWeight) });
      try {
        const { updateUserProfile } = await import('../../../utils/db');
        await updateUserProfile(user.id, { weight: Number(newWeight) });
      } catch {}
      setNewWeight('');
      setShowWeightEntry(false);
    }
  };

  const handleSaveHeight = async () => {
    if (newHeight && !isNaN(newHeight)) {
      onUpdateMetrics({ height: Number(newHeight) });
      try {
        const { updateUserProfile } = await import('../../../utils/db');
        await updateUserProfile(user.id, { height: Number(newHeight) });
      } catch {}
      setNewHeight('');
      setShowHeightEntry(false);
    }
  };

  const handleSaveAge = async () => {
    if (newAge && !isNaN(newAge)) {
      onUpdateMetrics({ age: Number(newAge) });
      try {
        const { updateUserProfile } = await import('../../../utils/db');
        await updateUserProfile(user.id, { age: Number(newAge) });
      } catch {}
      setNewAge('');
      setShowAgeEntry(false);
    }
  };

  const currentBMI = calculateBMI(user?.weight, user?.height);
  const bmiInfo = getBMICategory(currentBMI);

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Current Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="Calendar" size={20} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Age</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-card-foreground">{user?.age || 0}</p>
              <Button variant="ghost" size="sm" onClick={() => setShowAgeEntry(true)}>
                <Icon name="Edit2" size={14} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">years old</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="Ruler" size={20} className="text-success" />
              <span className="text-sm font-medium text-muted-foreground">Height</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-card-foreground">{user?.height || 0}</p>
              <Button variant="ghost" size="sm" onClick={() => setShowHeightEntry(true)}>
                <Icon name="Edit2" size={14} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">cm</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Icon name="Scale" size={20} className="text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Weight</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWeightEntry(true)}
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{user?.weight || 0}</p>
            <p className="text-xs text-muted-foreground">kg</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="Activity" size={20} className="text-warning" />
              <span className="text-sm font-medium text-muted-foreground">BMI</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{currentBMI}</p>
            <p className={`text-xs font-medium ${bmiInfo?.color}`}>{bmiInfo?.category}</p>
          </div>
        </div>
      </div>
      {/* Weight Entry Modal */}
      {showWeightEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Add Weight Entry</h3>
              <div className="space-y-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e?.target?.value)}
                  placeholder="Enter your current weight"
                />
                <div className="flex space-x-3">
                  <Button
                    variant="default"
                    onClick={handleAddWeight}
                    className="flex-1"
                  >
                    Add Entry
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWeightEntry(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modals */}
      {showHeightEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Update Height</h3>
              <div className="space-y-4">
                <Input label="Height (cm)" type="number" value={newHeight} onChange={(e) => setNewHeight(e?.target?.value)} placeholder="Enter your height" />
                <div className="flex space-x-3">
                  <Button variant="default" onClick={handleSaveHeight} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => setShowHeightEntry(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAgeEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Update Age</h3>
              <div className="space-y-4">
                <Input label="Age (years)" type="number" value={newAge} onChange={(e) => setNewAge(e?.target?.value)} placeholder="Enter your age" />
                <div className="flex space-x-3">
                  <Button variant="default" onClick={handleSaveAge} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => setShowAgeEntry(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Progress Chart */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Weight Progress</h3>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-popover-foreground)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Fitness Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Fitness Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <Select
              label="Fitness Level"
              options={fitnessLevelOptions}
              value={user?.fitnessLevel}
              onChange={(value) => onUpdateMetrics({ fitnessLevel: value })}
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <Select
              label="Primary Goal"
              options={goalOptions}
              value={user?.primaryGoal}
              onChange={(value) => onUpdateMetrics({ primaryGoal: value })}
            />
          </div>
        </div>
      </div>
      {/* Activity Summary */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Flame" size={24} className="text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-card-foreground">{user?.totalCaloriesBurned}</p>
            <p className="text-sm text-muted-foreground">Total Calories Burned</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-card-foreground">{user?.totalWorkoutTime}</p>
            <p className="text-sm text-muted-foreground">Total Workout Time</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Icon name="Target" size={24} className="text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-card-foreground">{user?.goalsCompleted}</p>
            <p className="text-sm text-muted-foreground">Goals Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessMetricsTab;