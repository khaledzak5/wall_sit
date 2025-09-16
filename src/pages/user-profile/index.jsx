import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import { getUserById, updateUserProfile } from '../../utils/db';
import Button from '../../components/ui/Button';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoTab from './components/PersonalInfoTab';
import FitnessMetricsTab from './components/FitnessMetricsTab';
import AchievementsTab from './components/AchievementsTab';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    // Use class instead of data attribute for Tailwind dark mode
    if (savedTheme === 'dark') {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
    // Load session user from localStorage (matching onboarding key)
    (async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const u = JSON.parse(userData);
          setUser({
            id: u?.id || u?.principalId,
            name: u?.name || 'New User',
            email: u?.email || '',
            phone: u?.phone || '',
            dateOfBirth: u?.dateOfBirth || '',
            location: u?.location || '',
            profilePicture: u?.profilePicture || '',
            joinDate: (u?.createdAt || new Date().toISOString()).slice(0,10),
            totalWorkouts: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: 0,
            thisWeekWorkouts: 0,
            thisMonthWorkouts: 0,
            age: u?.age || '',
            height: u?.height || '',
            weight: u?.weight || '',
            fitnessLevel: u?.fitnessLevel || 'beginner',
            primaryGoal: u?.primaryGoal || '',
            goals: u?.goals || [],
            workoutFrequency: u?.workoutFrequency || '',
            preferredWorkoutTime: u?.preferredWorkoutTime || '',
            availableEquipment: u?.availableEquipment || [],
            totalCaloriesBurned: '0',
            totalWorkoutTime: '0h',
            goalsCompleted: 0
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      }
    })();
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

  const handleLogout = () => {
    navigate('/login-screen');
  };

  const handleUpdateUser = async (updatedUser) => {
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    try {
      const { updateUserProfile } = await import('../../utils/db');
      await updateUserProfile(updatedUser.id, updatedUser);
    } catch {}
  };

  const handleUpdateMetrics = (metrics) => {
    const updatedUser = { ...user, ...metrics };
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Add functionality for Export Data button
  const handleExportData = () => {
    try {
      const userData = {
        profile: user,
        achievements: JSON.parse(localStorage.getItem('fitcoach_badges') || '[]'),
        workoutHistory: JSON.parse(localStorage.getItem('workout_history') || '[]'),
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `atos-fit-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success feedback
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Add functionality for Share Progress button
  const handleShareProgress = async () => {
    try {
      const shareData = {
        title: 'My ATOS Fit Progress',
        text: `Check out my fitness progress on ATOS Fit! I've completed ${user?.totalWorkouts || 0} workouts and achieved ${user?.achievements || 0} achievements.`,
        url: window.location.origin
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to copy to clipboard
      const shareText = `My ATOS Fit Progress: ${user?.totalWorkouts || 0} workouts completed, ${user?.achievements || 0} achievements earned!`;
      await navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const handleProfilePictureUpdate = async (newPicture) => {
    const updatedUser = { ...user, profilePicture: newPicture };
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    try {
      if (user?.id) await updateUserProfile(user.id, { profilePicture: newPicture });
    } catch {}
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'metrics', label: 'Fitness Metrics', icon: 'Activity' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab user={user} onUpdateUser={handleUpdateUser} />;
      case 'metrics':
        return <FitnessMetricsTab user={user} onUpdateMetrics={handleUpdateMetrics} />;
      case 'achievements':
        return <AchievementsTab user={user} />;
      default:
        return <PersonalInfoTab user={user} onUpdateUser={handleUpdateUser} />;
    }
  };

  const safeUser = user || {
    id: 0,
    name: 'New User',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    profilePicture: '',
    joinDate: new Date().toISOString().slice(0,10),
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
    age: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    primaryGoal: '',
    totalCaloriesBurned: '0',
    totalWorkoutTime: '0h',
    goalsCompleted: 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
        onThemeToggle={handleThemeToggle}
        currentTheme={currentTheme}
         user={user || { name: 'New User', email: '' }}
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
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </button>
            <Icon name="ChevronRight" size={16} />
            <span className="text-foreground font-medium">Profile</span>
          </nav>
          {/* Profile Header */}
          <ProfileHeader 
            user={safeUser} 
            onProfilePictureUpdate={handleProfilePictureUpdate}
          />

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg mb-6">
            {/* Mobile Tab Selector */}
            <div className="lg:hidden border-b border-border">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e?.target?.value)}
                className="w-full p-4 bg-transparent text-card-foreground font-medium focus:outline-none"
              >
                {tabs?.map((tab) => (
                  <option key={tab?.id} value={tab?.id}>
                    {tab?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden lg:flex border-b border-border">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {(() => {
                switch (activeTab) {
                  case 'personal':
                    return <PersonalInfoTab user={safeUser} onUpdateUser={handleUpdateUser} />;
                  case 'metrics':
                    return <FitnessMetricsTab user={safeUser} onUpdateMetrics={handleUpdateMetrics} />;
                  case 'achievements':
                    return <AchievementsTab user={safeUser} />;
                  default:
                    return <PersonalInfoTab user={safeUser} onUpdateUser={handleUpdateUser} />;
                }
              })()}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/exercise-workout-screen')}
                className="flex items-center justify-center space-x-2 h-12"
              >
                <Icon name="Play" size={18} />
                <span>Start Workout</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/ai-assistant-food-scanner')}
                className="flex items-center justify-center space-x-2 h-12"
              >
                <Icon name="MessageCircle" size={18} />
                <span>AI Assistant</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 h-12"
              >
                <Icon name="Download" size={18} />
                <span>Export Data</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareProgress}
                className="flex items-center justify-center space-x-2 h-12"
              >
                <Icon name="Share2" size={18} />
                <span>Share Progress</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;