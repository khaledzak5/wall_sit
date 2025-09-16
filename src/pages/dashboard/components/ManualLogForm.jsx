import React, { useState } from 'react';

const ManualLogForm = () => {
  const [log, setLog] = useState({ workoutType: '', reps: '', time: '' });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('atos_manual_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleChange = (e) => {
    setLog({ ...log, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!log.workoutType || !log.reps || !log.time) {
      alert('Please fill in all fields');
      return;
    }
    const newLog = { ...log, date: new Date().toLocaleString() };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('atos_manual_logs', JSON.stringify(updatedLogs));
    setLog({ workoutType: '', reps: '', time: '' });
  };

  return (
    <div>
      <form className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="workoutType"
          placeholder="Workout Type (e.g. Squats)"
          value={log.workoutType}
          onChange={handleChange}
          className="p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          name="reps"
          placeholder="Reps (e.g. 15)"
          value={log.reps}
          onChange={handleChange}
          className="p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          name="time"
          placeholder="Time (e.g. 30 min)"
          value={log.time}
          onChange={handleChange}
          className="p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="bg-primary text-white rounded-lg px-4 py-2 font-semibold">Add Log</button>
      </form>
      <div>
        {logs.length > 0 ? (
          <ul className="divide-y divide-border">
            {logs.map((entry, idx) => (
              <li key={idx} className="py-2 flex flex-col md:flex-row md:items-center md:space-x-4">
                <span className="font-medium">{entry.workoutType}</span>
                <span className="text-muted-foreground">{entry.reps} reps</span>
                <span className="text-muted-foreground">{entry.time}</span>
                <span className="text-xs text-muted-foreground ml-auto">{entry.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No manual logs yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManualLogForm;
