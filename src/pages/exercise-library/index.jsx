import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import ExerciseCard from '../dashboard/components/ExerciseCard';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [filter, setFilter] = useState('all'); // all, beginner, intermediate, advanced
  const [searchTerm, setSearchTerm] = useState('');

  // Mock exercise data (same as dashboard)
  const exercises = [
    {
      id: 1,
      name: "Push-ups",
      targetMuscles: "Chest, Arms, Core",
      difficulty: "Beginner",
      duration: 8,
      caloriesBurn: 45,
      sets: 3,
      reps: 15,
      description: "Classic upper body exercise targeting chest, shoulders, and triceps with core engagement."
    },
    {
      id: 2,
      name: "Squats",
      targetMuscles: "Legs, Glutes, Core",
      difficulty: "Beginner",
      duration: 10,
      caloriesBurn: 60,
      sets: 3,
      reps: 20,
      description: "Fundamental lower body movement strengthening quadriceps, glutes, and core muscles."
    },
    {
      id: 3,
      name: "Lunges",
      targetMuscles: "Legs, Glutes, Balance",
      difficulty: "Intermediate",
      duration: 12,
      caloriesBurn: 70,
      sets: 3,
      reps: 12,
      description: "Unilateral leg exercise improving balance, strength, and coordination."
    },
    {
      id: 4,
      name: "Burpees",
      targetMuscles: "Full Body, Cardio",
      difficulty: "Advanced",
      duration: 15,
      caloriesBurn: 120,
      sets: 3,
      reps: 10,
      description: "High-intensity full-body exercise combining strength and cardiovascular training."
    },
    {
      id: 5,
      name: "Mountain Climbers",
      targetMuscles: "Core, Cardio, Arms",
      difficulty: "Intermediate",
      duration: 8,
      caloriesBurn: 80,
      sets: 3,
      reps: 20,
      description: "Dynamic core exercise with cardiovascular benefits and upper body engagement."
    },
    {
      id: 6,
      name: "Jumping Jacks",
      targetMuscles: "Full Body, Cardio",
      difficulty: "Beginner",
      duration: 6,
      caloriesBurn: 50,
      sets: 3,
      reps: 30,
      description: "Classic cardio exercise improving coordination and cardiovascular endurance."
    },
    {
      id: 7,
      name: "High Knees",
      targetMuscles: "Legs, Core, Cardio",
      difficulty: "Beginner",
      duration: 5,
      caloriesBurn: 40,
      sets: 3,
      reps: 25,
      description: "Running-in-place variation focusing on leg strength and cardiovascular fitness."
    },
    {
      id: 8,
      name: "Plank",
      targetMuscles: "Core, Shoulders, Back",
      difficulty: "Intermediate",
      duration: 10,
      caloriesBurn: 35,
      sets: 3,
      reps: "30s",
      description: "Isometric core exercise building strength and stability throughout the torso."
    },
    {
      id: 9,
      name: "Side Plank",
      targetMuscles: "Core, Obliques, Shoulders",
      difficulty: "Intermediate",
      duration: 8,
      caloriesBurn: 30,
      sets: 3,
      reps: "20s",
      description: "Lateral core strengthening exercise targeting obliques and lateral stability."
    },
    {
      id: 10,
      name: "Wall Sit",
      targetMuscles: "Legs, Glutes, Core",
      difficulty: "Beginner",
      duration: 7,
      caloriesBurn: 25,
      sets: 3,
      reps: "30s",
      description: "Isometric leg exercise building endurance in quadriceps and glutes."
    }
  ];

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
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
    
    if (newTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
    navigate('/login-screen');
  };

  // Filter and search exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesFilter = filter === 'all' || exercise.difficulty.toLowerCase() === filter.toLowerCase();
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.targetMuscles.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort exercises by difficulty Beginner -> Intermediate -> Advanced
  const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
  const sortedExercises = [...filteredExercises].sort((a, b) => 
    (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3)
  );

  const getDifficultyCount = (difficulty) => {
    return exercises.filter(ex => ex.difficulty === difficulty).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
        onThemeToggle={handleThemeToggle}
        currentTheme={currentTheme}
        user={JSON.parse(localStorage.getItem('user') || '{}')}
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Exercise Library</h1>
              <p className="text-muted-foreground mt-1">
                Choose from our collection of home-friendly exercises
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search exercises by name, muscles, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Difficulty Filter */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({exercises.length})
                </Button>
                <Button
                  variant={filter === 'beginner' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('beginner')}
                >
                  Beginner ({getDifficultyCount('Beginner')})
                </Button>
                <Button
                  variant={filter === 'intermediate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('intermediate')}
                >
                  Intermediate ({getDifficultyCount('Intermediate')})
                </Button>
                <Button
                  variant={filter === 'advanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('advanced')}
                >
                  Advanced ({getDifficultyCount('Advanced')})
                </Button>
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="mb-6">
            {sortedExercises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  No exercises found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} FitCoach AI. All rights reserved.</p>
              <p className="mt-2">Your AI-powered fitness companion for a healthier lifestyle.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ExerciseLibrary;
