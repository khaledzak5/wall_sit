import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { db, getOrCreateUserByEmail } from '../../../utils/db';

const AchievementsTab = ({ user }) => {
  const badgesFromStorage = JSON.parse(localStorage.getItem('fitcoach_badges') || '[]');
  const [dynamic, setDynamic] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const u = user?.email ? await getOrCreateUserByEmail(user.email, user.name) : null;
        if (u) {
          const list = await db.achievements.where({ userId: u.id }).toArray();
          setDynamic(list);
        }
      } catch {}
    })();
  }, [user?.email]);

  const achievements = [
    // Only dynamic DB-based achievements for the current user
    ...dynamic.map((a, idx) => ({
      id: 100 + idx,
      title: a.title,
      description: a.code,
      icon: a.level === 'gold' ? 'Trophy' : a.level === 'silver' ? 'Award' : 'Star',
      earned: Boolean(a.earnedAt || a.progress >= (a.target || 1)),
      color: a.level === 'gold' ? 'bg-warning' : a.level === 'silver' ? 'bg-accent' : 'bg-success',
      progress: Math.round(((a.progress || 0) / (a.target || 1)) * 100)
    }))
  ];

  const workoutStreaks = [
    { type: "Current Streak", value: user?.currentStreak || 0, unit: "days", icon: "Flame", color: "text-accent" },
    { type: "Longest Streak", value: user?.longestStreak || 0, unit: "days", icon: "Trophy", color: "text-warning" },
    { type: "This Week", value: user?.thisWeekWorkouts || 0, unit: "workouts", icon: "Calendar", color: "text-primary" },
    { type: "This Month", value: user?.thisMonthWorkouts || 0, unit: "workouts", icon: "BarChart3", color: "text-success" }
  ];

  const formImprovements = [];

  const AchievementBadge = ({ achievement }) => (
    <div className={`bg-card border border-border rounded-lg p-4 ${achievement?.earned ? 'shadow-elevation-2' : 'opacity-75'}`}>
      <div className="flex items-start space-x-3">
        <div className={`w-12 h-12 ${achievement?.color} rounded-full flex items-center justify-center ${achievement?.earned ? '' : 'opacity-50'}`}>
          <Icon name={achievement?.icon} size={20} color="white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-card-foreground">{achievement?.title}</h4>
            {achievement?.earned && (
              <Icon name="CheckCircle" size={16} className="text-success" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{achievement?.description}</p>
          
          {achievement?.earned ? (
            <p className="text-xs text-success font-medium">
              Earned on {new Date(achievement.earnedDate)?.toLocaleDateString()}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {achievement?.current} / {achievement?.target}
                </span>
                <span className="font-medium text-card-foreground">
                  {achievement?.progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${achievement?.color}`}
                  style={{ width: `${achievement?.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Achievement Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Achievement Badges</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Earned: {achievements.filter(a => a.earned).length}</span>
            <span>•</span>
            <span>Total: {achievements.length}</span>
          </div>
        </div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements?.map((achievement) => (
              <AchievementBadge key={achievement?.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Icon name="Trophy" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h4 className="text-lg font-semibold text-card-foreground mb-2">No achievements yet</h4>
            <p className="text-muted-foreground">
              Complete workouts and reach milestones to earn achievements
            </p>
          </div>
        )}
      </div>
      {/* Workout Streaks */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Workout Streaks & Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workoutStreaks?.map((streak, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4 text-center">
              <Icon name={streak?.icon} size={24} className={`${streak?.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-card-foreground">{streak?.value}</p>
              <p className="text-sm text-muted-foreground">{streak?.unit}</p>
              <p className="text-xs font-medium text-card-foreground mt-1">{streak?.type}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Form Improvement Scores */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Form Improvement Scores</h3>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="space-y-4">
            {formImprovements?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${item?.color} rounded-full`}></div>
                  <span className="font-medium text-card-foreground">{item?.exercise}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{item?.score}%</p>
                    <p className="text-xs text-success">{item?.improvement}</p>
                  </div>
                  
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item?.color}`}
                      style={{ width: `${item?.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Milestones */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Milestones</h3>
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Target" size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">50 Workout Milestone</p>
                  <p className="text-sm text-muted-foreground">Complete 50 total workouts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">42/50</p>
                <p className="text-xs text-muted-foreground">8 more to go</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Calendar" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-card-foreground">30-Day Challenge</p>
                  <p className="text-sm text-muted-foreground">Workout for 30 consecutive days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">12/30</p>
                <p className="text-xs text-muted-foreground">18 more days</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsTab;