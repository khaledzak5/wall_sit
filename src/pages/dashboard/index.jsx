import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import WelcomeSection from './components/WelcomeSection';
import TodayWorkoutCard from './components/TodayWorkoutCard';
import DailyTipsCard from './components/DailyTipsCard';
import ProgressWidget from './components/ProgressWidget';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  // User data from localStorage
  const [user, setUser] = useState({ name: 'New User', email: '', profilePicture: '', fitnessLevel: 'Beginner', goals: [] });
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser?.name || 'New User',
          email: parsedUser?.email || '',
          profilePicture: parsedUser?.profilePicture || '',
          fitnessLevel: (parsedUser?.fitnessLevel || 'beginner')?.replace(/\b\w/g, c => c.toUpperCase()),
          goals: parsedUser?.goals || []
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Check if user needs to complete onboarding
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      // No user data -> create a temporary guest/demo user so the dashboard is accessible
      const guest = {
        id: 'guest',
        name: 'Demo User',
        email: '',
        profilePicture: '',
        fitnessLevel: 'Beginner',
        goals: [],
        isGuest: true,
      };
      try {
        localStorage.setItem('user', JSON.stringify(guest));
      } catch (e) {
        // ignore localStorage write errors
      }
      setUser(guest);
      return;
    }

    try {
      const user = JSON.parse(userData);
      // If basic profile fields are missing, fill with defaults instead of forcing onboarding
      let updated = false;
      if (!user.name) { user.name = 'Demo User'; updated = true; }
      if (!user.fitnessLevel) { user.fitnessLevel = 'Beginner'; updated = true; }
      if (updated) {
        try { localStorage.setItem('user', JSON.stringify(user)); } catch (e) {}
      }
      setUser({
        name: user?.name || 'New User',
        email: user?.email || '',
        profilePicture: user?.profilePicture || '',
        fitnessLevel: (user?.fitnessLevel || 'beginner')?.replace(/\b\w/g, c => c.toUpperCase()),
        goals: user?.goals || []
      });
    } catch (error) {
      // Invalid user data -> fallback to demo user
      const guest = {
        id: 'guest',
        name: 'Demo User',
        email: '',
        profilePicture: '',
        fitnessLevel: 'Beginner',
        goals: [],
        isGuest: true,
      };
      try { localStorage.setItem('user', JSON.stringify(guest)); } catch (e) {}
      setUser(guest);
    }
  }, [navigate]);



  // Mock progress data
  const [progressData, setProgressData] = useState({
    weeklyGoal: 5,
    completedWorkouts: 0,
    currentStreak: 0,
    totalWorkouts: 0,
    caloriesBurned: 0,
    weeklyCalorieGoal: 2000,
    achievements: []
  });
  useEffect(() => {
    (async () => {
      try {
        const session = JSON.parse(localStorage.getItem('user') || 'null');
        if (session?.id) {
          const { db } = await import('../../utils/db');
          const sessions = await db.sessions.where({ userId: session.id }).toArray();
          const totalWorkouts = sessions.length;
          const calories = 0; // placeholder: in real case compute
          setProgressData(prev => ({ ...prev, totalWorkouts, caloriesBurned: calories, completedWorkouts: 0, currentStreak: 0 }));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    // Use class instead of data attribute for Tailwind dark mode
    if (savedTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Use class instead of data attribute for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('theme');
      navigate('/login-screen');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout fails
      navigate('/login-screen');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
        onThemeToggle={handleThemeToggle}
        currentTheme={currentTheme}
        user={user}
        onLogout={handleLogout}
      />
      {/* Sidebar */}
      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Main Content */}
      <main className="pt-16 lg:pl-72 min-h-screen">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <WelcomeSection user={user} />

          {/* Today's Workout */}
          <TodayWorkoutCard workoutData={{
            name: "Full Body Strength",
            scheduledTime: "6:00 PM",
            exercises: [
              { name: "Push-ups", sets: 3, reps: 15, completed: true },
              { name: "Squats", sets: 3, reps: 20, completed: true },
              { name: "Plank", sets: 3, duration: "30s", completed: false },
              { name: "Lunges", sets: 3, reps: 12, completed: false },
              { name: "Mountain Climbers", sets: 3, reps: 15, completed: false }
            ],
            estimatedDuration: 30,
            difficulty: "Intermediate"
          }} />

          {/* Progress & Tips Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ProgressWidget progressData={progressData} />
            </div>
            <div>
              <DailyTipsCard />
            </div>
          </div>



          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date()?.getFullYear()} FitCoach AI. All rights reserved.</p>
              <p className="mt-2">Your AI-powered fitness companion for a healthier lifestyle.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;