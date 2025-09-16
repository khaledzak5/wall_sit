import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TodayPlanCustomizer = ({ exercises = [], onSave, onCancel }) => {
  const sortedExercises = useMemo(() => {
    const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    return [...exercises].sort((a, b) => (order[a?.difficulty] ?? 3) - (order[b?.difficulty] ?? 3));
  }, [exercises]);

  const isTimeBased = (name, reps) => {
    const timeNames = new Set(['Plank', 'Side Plank', 'Wall Sit', 'Mountain Climbers', 'Jumping Jacks', 'High Knees']);
    if (typeof reps === 'string') return true;
    return Array.from(timeNames).some(n => String(name || '').toLowerCase().includes(n.toLowerCase()));
  };

  const [selection, setSelection] = useState(() => {
    // Default none selected
    const map = {};
    sortedExercises.forEach(ex => {
      map[ex.id] = {
        selected: false,
        sets: ex?.sets || 3,
        reps: typeof ex?.reps === 'number' ? ex?.reps : 12,
        durationSeconds: typeof ex?.reps === 'string' ? parseInt(String(ex?.reps).replace(/\D/g, ''), 10) || 30 : 30,
      };
    });
    return map;
  });

  const toggleSelected = (id) => {
    setSelection(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
  };

  const updateField = (id, field, value) => {
    setSelection(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const selectedCount = Object.values(selection).filter(v => v.selected).length;

  const handleSave = () => {
    const items = sortedExercises
      .filter(ex => selection[ex.id]?.selected)
      .map(ex => {
        const cfg = selection[ex.id];
        const timeBased = isTimeBased(ex?.name, ex?.reps);
        return {
          name: ex?.name,
          sets: cfg?.sets,
          ...(timeBased ? { duration: `${cfg?.durationSeconds}s` } : { reps: cfg?.reps }),
          completed: false
        };
      });

    const estimatedMinutes = items.reduce((sum, item) => {
      if ('reps' in item) {
        const repsTime = item.sets * item.reps * 2; // ~2s per rep
        const rest = (item.sets - 1) * 30; // ~30s rest
        return sum + Math.ceil((repsTime + rest) / 60);
      } else {
        const dur = item.sets * parseInt(String(item.duration).replace(/\D/g, ''), 10);
        const rest = (item.sets - 1) * 30;
        return sum + Math.ceil((dur + rest) / 60);
      }
    }, 0);

    const plan = {
      name: 'Custom Plan',
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: items,
      estimatedDuration: Math.max(estimatedMinutes, 5),
      difficulty: 'Beginner'
    };
    onSave?.(plan);
  };

  return (
    <div className="fixed inset-0 z-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-3xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Customize Today’s Workout</h3>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <Icon name="X" size={18} />
            </Button>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {sortedExercises.map(ex => {
              const cfg = selection[ex.id];
              const timeBased = isTimeBased(ex?.name, ex?.reps);
              return (
                <div key={ex.id} className={`border rounded-lg p-3 ${cfg.selected ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={cfg.selected} onChange={() => toggleSelected(ex.id)} />
                      <div>
                        <p className="font-medium text-card-foreground">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.difficulty} • {ex.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{ex.duration} est</span>
                  </div>
                  {cfg.selected && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <Input label="Sets" type="number" min={1} value={cfg.sets} onChange={(e) => updateField(ex.id, 'sets', Number(e.target.value))} />
                      {timeBased ? (
                        <Input label="Time (sec)" type="number" min={5} step={5} value={cfg.durationSeconds} onChange={(e) => updateField(ex.id, 'durationSeconds', Number(e.target.value))} />
                      ) : (
                        <Input label="Reps" type="number" min={1} value={cfg.reps} onChange={(e) => updateField(ex.id, 'reps', Number(e.target.value))} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Selected: {selectedCount}</div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button disabled={selectedCount === 0} onClick={handleSave}>
                <Icon name="Save" size={16} className="mr-2" />
                Save Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPlanCustomizer;


