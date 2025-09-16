import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { updateUserProfile } from '../../utils/db';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, principal } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    
    // Fitness Metrics
    age: '',
    height: '',
    weight: '',
    fitnessLevel: '',
    goals: [],
    
    // Activity Preferences
    workoutFrequency: '',
    preferredWorkoutTime: '',
    availableEquipment: []
  });

  const totalSteps = 4;

  useEffect(() => {
    console.log('Onboarding useEffect - isAuthenticated:', isAuthenticated);
    console.log('Onboarding useEffect - principal:', principal?.toString());
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login-screen', { replace: true });
      return;
    }

    // Check if user has already completed onboarding
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        // If user has completed onboarding (has name and email), redirect to dashboard
        if (user.name && user.email) {
          console.log('User has completed onboarding, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Pre-populate form with existing data
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          location: user.location || '',
          age: user.age || '',
          height: user.height || '',
          weight: user.weight || '',
          fitnessLevel: user.fitnessLevel || '',
          goals: user.goals || [],
          workoutFrequency: user.workoutFrequency || '',
          preferredWorkoutTime: user.preferredWorkoutTime || '',
          availableEquipment: user.availableEquipment || []
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create user profile with collected data
      const userProfile = {
        ...formData,
        principalId: principal?.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage for immediate use
      localStorage.setItem('user', JSON.stringify({
        id: principal?.toString(),
        ...userProfile
      }));

      // Save to database
      await updateUserProfile(principal?.toString(), userProfile);

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to save user profile:', error);
      // Still navigate to dashboard even if save fails
      navigate('/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const fitnessLevelOptions = [
    { value: 'beginner', label: 'Beginner - New to fitness' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Regular exerciser' },
    { value: 'expert', label: 'Expert - Fitness enthusiast' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Build Endurance' },
    { value: 'strength', label: 'Increase Strength' },
    { value: 'general_fitness', label: 'General Fitness' },
    { value: 'flexibility', label: 'Improve Flexibility' }
  ];

  const workoutFrequencyOptions = [
    { value: '1-2', label: '1-2 times per week' },
    { value: '3-4', label: '3-4 times per week' },
    { value: '5-6', label: '5-6 times per week' },
    { value: 'daily', label: 'Daily' }
  ];

  const workoutTimeOptions = [
    { value: 'morning', label: 'Morning (6AM - 10AM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { value: 'evening', label: 'Evening (6PM - 9PM)' },
    { value: 'night', label: 'Night (9PM - 11PM)' }
  ];

  const equipmentOptions = [
    { value: 'none', label: 'No equipment (bodyweight only)' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'yoga_mat', label: 'Yoga Mat' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' },
    { value: 'gym_access', label: 'Full Gym Access' }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
              
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
              
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Fitness Metrics</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                min="13"
                max="100"
              />
              
              <Input
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Enter your height in centimeters"
                min="100"
                max="250"
              />
              
              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter your weight in kilograms"
                min="30"
                max="300"
              />
              
              <Select
                label="Fitness Level"
                value={formData.fitnessLevel}
                onChange={(value) => handleInputChange('fitnessLevel', value)}
                options={fitnessLevelOptions}
                placeholder="Select your fitness level"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Fitness Goals</h2>
              <p className="text-muted-foreground">What do you want to achieve? (Select all that apply)</p>
            </div>
            
            <div className="space-y-3">
              {goalOptions.map((goal) => (
                <label key={goal.value} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal.value)}
                    onChange={(e) => handleArrayChange('goals', goal.value, e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-foreground">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Workout Preferences</h2>
              <p className="text-muted-foreground">Let's customize your workout plan</p>
            </div>
            
            <div className="space-y-4">
              <Select
                label="How often do you want to work out?"
                value={formData.workoutFrequency}
                onChange={(value) => handleInputChange('workoutFrequency', value)}
                options={workoutFrequencyOptions}
                placeholder="Select workout frequency"
              />
              
              <Select
                label="Preferred workout time"
                value={formData.preferredWorkoutTime}
                onChange={(value) => handleInputChange('preferredWorkoutTime', value)}
                options={workoutTimeOptions}
                placeholder="Select preferred time"
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Available Equipment (Select all that apply)
                </label>
                <div className="space-y-2">
                  {equipmentOptions.map((equipment) => (
                    <label key={equipment.value} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.availableEquipment.includes(equipment.value)}
                        onChange={(e) => handleArrayChange('availableEquipment', equipment.value, e.target.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className="text-foreground">{equipment.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.email.trim();
      case 2:
        return formData.age && formData.height && formData.weight && formData.fitnessLevel;
      case 3:
        return formData.goals.length > 0;
      case 4:
        return formData.workoutFrequency && formData.preferredWorkoutTime;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <Icon name="ChevronLeft" size={16} />
              <span>Previous</span>
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={!isStepValid() || isLoading}
                loading={isLoading}
                className="flex items-center space-x-2"
              >
                <Icon name="Check" size={16} />
                <span>Complete Setup</span>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <Icon name="ChevronRight" size={16} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              // Save minimal user data when skipping
              const minimalUserData = {
                id: principal?.toString(),
                principalId: principal?.toString(),
                name: formData.name || 'New User',
                email: formData.email || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                skippedOnboarding: true
              };
              localStorage.setItem('user', JSON.stringify(minimalUserData));
              navigate('/dashboard');
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;