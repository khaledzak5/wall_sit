import Dexie from 'dexie';

// Database schema
// - users: { id, email, name, createdAt, statsId }
// - stats: { id, userId, totalRepsByExercise: { [exerciseName]: number }, totalDurationSecByExercise: { [exerciseName]: number }, completedDays: number[], completedWeeks: number[], completedMonths: number[], lastUpdated }
// - sessions: { id, userId, dateISO, items: [{ name, reps, sets, durationSec, completed }] }
// - achievements: { id, userId, code, title, level, earnedAt, progress, target }

export const db = new Dexie('fitcoach_db');

db.version(1).stores({
  users: '++id, email',
  stats: '++id, userId',
  sessions: '++id, userId, dateISO',
  achievements: '++id, userId, code'
});

// Helpers
export async function getOrCreateUserByEmail(email, name) {
  let user = await db.users.where({ email }).first();
  if (!user) {
    const id = await db.users.add({ email, name: name || email.split('@')[0], createdAt: new Date().toISOString(), password: '' });
    user = await db.users.get(id);
  }
  return user;
}

export async function registerUser(email, name, password) {
  let user = await db.users.where({ email }).first();
  if (user) {
    // update name/password if re-registering
    await db.users.update(user.id, { name, password });
    return await db.users.get(user.id);
  }
  const id = await db.users.add({ email, name, password, createdAt: new Date().toISOString() });
  return await db.users.get(id);
}

export async function validateUser(email, password) {
  const user = await db.users.where({ email }).first();
  if (!user) return null;
  if (!user.password || user.password === password) return user;
  return null;
}

export async function updateUserProfile(userId, fields) {
  const user = await db.users.get(userId);
  if (!user) return null;
  await db.users.update(userId, { ...fields });
  return await db.users.get(userId);
}

export async function getUserById(userId) {
  return db.users.get(userId);
}

export async function recordWorkoutSession(userId, items) {
  const dateISO = new Date().toISOString();
  const id = await db.sessions.add({ userId, dateISO, items });
  return id;
}

export async function updateAggregateStats(userId, items) {
  let stats = await db.stats.where({ userId }).first();
  if (!stats) {
    const id = await db.stats.add({
      userId,
      totalRepsByExercise: {},
      totalDurationSecByExercise: {},
      completedDays: [],
      completedWeeks: [],
      completedMonths: [],
      lastUpdated: new Date().toISOString()
    });
    stats = await db.stats.get(id);
  }

  const totalRepsByExercise = { ...(stats.totalRepsByExercise || {}) };
  const totalDurationSecByExercise = { ...(stats.totalDurationSecByExercise || {}) };

  for (const item of items) {
    const key = (item.name || '').toLowerCase();
    if (item.reps) {
      totalRepsByExercise[key] = (totalRepsByExercise[key] || 0) + (Number(item.sets || 1) * Number(item.reps || 0));
    } else if (item.duration) {
      const sec = parseInt(String(item.duration).replace(/\D/g, ''), 10) || 0;
      totalDurationSecByExercise[key] = (totalDurationSecByExercise[key] || 0) + (Number(item.sets || 1) * sec);
    }
  }

  const now = new Date();
  const dayKey = Number(now.toISOString().slice(0, 10).replace(/-/g, ''));
  const weekKey = Number(`${now.getFullYear()}${String(getWeekNumber(now)).padStart(2, '0')}`);
  const monthKey = Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  const updated = {
    ...stats,
    totalRepsByExercise,
    totalDurationSecByExercise,
    completedDays: stats.completedDays?.includes(dayKey) ? stats.completedDays : [...stats.completedDays, dayKey],
    completedWeeks: stats.completedWeeks?.includes(weekKey) ? stats.completedWeeks : [...stats.completedWeeks, weekKey],
    completedMonths: stats.completedMonths?.includes(monthKey) ? stats.completedMonths : [...stats.completedMonths, monthKey],
    lastUpdated: now.toISOString()
  };

  await db.stats.update(stats.id, updated);
  return updated;
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

export async function upsertAchievement(userId, payload) {
  const existing = await db.achievements.where({ userId, code: payload.code }).first();
  if (existing) {
    await db.achievements.update(existing.id, { ...existing, ...payload });
  } else {
    await db.achievements.add({ userId, ...payload });
  }
}

export async function listAchievements(userId) {
  return db.achievements.where({ userId }).toArray();
}


