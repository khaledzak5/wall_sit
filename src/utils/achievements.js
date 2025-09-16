import { upsertAchievement } from './db';

// Define achievement plans
export const ACHIEVEMENTS = {
  DAILY_COMPLETION: { code: 'daily_completion', title: 'Daily Finisher', level: 'bronze', target: 1 },
  WEEK_COMPLETION: { code: 'week_completion', title: 'Weekly Warrior', level: 'silver', target: 1 },
  MONTH_COMPLETION: { code: 'month_completion', title: 'Monthly Master', level: 'gold', target: 1 },
  PUSHUPS_1000: { code: 'pushups_1000', title: 'Push-up Pro', level: 'gold', target: 1000 },
};

export async function evaluateAchievements(userId, stats) {
  const updates = [];
  // Daily completion
  if (stats?.completedDays?.length) {
    updates.push(upsertAchievement(userId, { ...ACHIEVEMENTS.DAILY_COMPLETION, earnedAt: new Date().toISOString(), progress: 1 }));
  }
  // Weekly completion
  if (stats?.completedWeeks?.length) {
    updates.push(upsertAchievement(userId, { ...ACHIEVEMENTS.WEEK_COMPLETION, earnedAt: new Date().toISOString(), progress: 1 }));
  }
  // Monthly completion
  if (stats?.completedMonths?.length) {
    updates.push(upsertAchievement(userId, { ...ACHIEVEMENTS.MONTH_COMPLETION, earnedAt: new Date().toISOString(), progress: 1 }));
  }
  // Pushups milestone
  const pushups = stats?.totalRepsByExercise?.['push-ups'] || stats?.totalRepsByExercise?.['pushups'] || 0;
  updates.push(upsertAchievement(userId, { ...ACHIEVEMENTS.PUSHUPS_1000, progress: Math.min(pushups, ACHIEVEMENTS.PUSHUPS_1000.target) }));

  await Promise.all(updates);
}


