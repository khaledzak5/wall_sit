// Simple calorie estimation utilities
// Uses base constants defined for a 70kg person and scales linearly by weight.

const BASE_WEIGHT_KG = 70;

// Approximate calories burned per rep for bodyweight exercises at 70kg
// These are conservative estimates for moderate effort.
const PER_REP_BASE = {
  pushups: 0.5,        // kcal per rep
  squats: 0.32,
  lunges: 0.4,
  burpees: 1.0,
  mountainclimbers: 0.35,
  jumpingjacks: 0.2
};

// Approximate kcal per minute for isometric/time-based exercises (plank) at 70kg
const PER_MIN_BASE = {
  plank: 4.5, // kcal per minute
  sideplank: 4.0, // kcal per minute (slightly less than regular plank)
  // fallback cardio-ish rate
  defaultTime: 6.0
};

function normalizeName(name) {
  return (name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function caloriesForItem(item, userWeightKg = BASE_WEIGHT_KG) {
  // item: { name, reps, sets, durationSec }
  const nameKey = normalizeName(item.name);
  const weightFactor = (Number(userWeightKg) > 0) ? (Number(userWeightKg) / BASE_WEIGHT_KG) : 1;
  const sets = Number(item.sets || 1);

  // Time-based: if durationSec provided (for plank etc.) use per-minute
  if (item.durationSec || nameKey.includes('plank') || typeof item.duration !== 'undefined') {
    const durationSec = Number(item.durationSec || (parseInt(String(item.duration || '').replace(/\D/g, ''), 10) || 0));
    const minutes = durationSec / 60;
    const perMin = PER_MIN_BASE[nameKey] ?? PER_MIN_BASE.defaultTime;
    const kcal = perMin * minutes * weightFactor * sets;
    return Number(kcal || 0);
  }

  // Rep-based
  const reps = Number(item.reps || 0);
  const perRep = PER_REP_BASE[nameKey] ?? 0.3; // default small per-rep value
  const kcal = perRep * reps * weightFactor * sets;
  return Number(kcal || 0);
}

export function calculateSessionCalories(items = [], user = {}) {
  const weightKg = Number(user?.weight) || BASE_WEIGHT_KG;
  let total = 0;
  const breakdown = [];
  for (const it of items) {
    const c = caloriesForItem(it, weightKg);
    breakdown.push({ name: it.name, calories: c });
    total += c;
  }
  return { total: Number(total), breakdown };
}
