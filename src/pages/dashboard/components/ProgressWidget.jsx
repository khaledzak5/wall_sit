import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressWidget = ({ progressData }) => {
  const progress = {
    weeklyGoal: progressData?.weeklyGoal || 5,
    completedWorkouts: progressData?.completedWorkouts || 0,
    currentStreak: progressData?.currentStreak || 0,
    totalWorkouts: progressData?.totalWorkouts || 0,
    caloriesBurned: progressData?.caloriesBurned || 0,
    weeklyCalorieGoal: progressData?.weeklyCalorieGoal || 2000,
    achievements: progressData?.achievements || []
  };

  const weeklyProgress = (progress?.completedWorkouts / progress?.weeklyGoal) * 100;
  const calorieProgress = (progress?.caloriesBurned / progress?.weeklyCalorieGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekly Progress */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Weekly Progress</h3>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={16} className="text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Workouts</span>
              <span className="font-medium text-card-foreground">
                {progress?.completedWorkouts}/{progress?.weeklyGoal}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Calories Burned</span>
              <span className="font-medium text-card-foreground">
                 {progress?.caloriesBurned}/{progress?.weeklyCalorieGoal}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{progress?.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{progress?.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </div>
          </div>
        </div>
      </div>
      {/* Achievement Badges */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Achievements</h3>
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Award" size={16} className="text-accent" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {progress?.achievements?.map((achievement) => (
            <div
              key={achievement?.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                achievement?.earned
                  ? 'bg-success/5 border-success/20 hover:bg-success/10' :'bg-muted/30 border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement?.earned ? 'bg-success/10' : 'bg-muted'
                }`}>
                  <Icon 
                    name={achievement?.icon} 
                    size={16} 
                    className={achievement?.earned ? 'text-success' : achievement?.color}
                  />
                </div>
                <div>
                  <p className={`text-xs font-medium ${
                    achievement?.earned ? 'text-card-foreground' : 'text-muted-foreground'
                  }`}>
                    {achievement?.name}
                  </p>
                  {achievement?.earned && (
                    <div className="flex items-center justify-center mt-1">
                      <Icon name="Check" size={10} className="text-success" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-card-foreground">
              {progress?.achievements?.filter(a => a?.earned)?.length}/{progress?.achievements?.length} earned
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(progress?.achievements?.filter(a => a?.earned)?.length / progress?.achievements?.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;