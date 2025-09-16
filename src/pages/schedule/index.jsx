import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    type: 'workout',
    notes: ''
  });

  // Load appointments from localStorage
  useEffect(() => {
    const savedAppointments = localStorage.getItem('atos_appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
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

  // Add new appointment
  const handleAddAppointment = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    localStorage.setItem('atos_appointments', JSON.stringify(updatedAppointments));
    
    // Reset form
    setFormData({
      title: '',
      date: '',
      time: '',
      duration: '30',
      type: 'workout',
      notes: ''
    });
    setShowAddForm(false);
  };

  // Delete appointment
  const handleDeleteAppointment = (appointmentId) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
    setAppointments(updatedAppointments);
    localStorage.setItem('atos_appointments', JSON.stringify(updatedAppointments));
  };

  // Complete appointment
  const handleCompleteAppointment = (appointmentId) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: 'completed' }
        : appointment
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('atos_appointments', JSON.stringify(updatedAppointments));
  };

  // Get appointment type icon
  const getAppointmentIcon = (type) => {
    switch (type) {
      case 'workout': return 'Activity';
      case 'cardio': return 'Heart';
      case 'strength': return 'Zap';
      case 'flexibility': return 'Stretch';
      case 'nutrition': return 'Apple';
      default: return 'Calendar';
    }
  };

  // Get appointment type color
  const getAppointmentColor = (type) => {
    switch (type) {
      case 'workout': return 'bg-primary';
      case 'cardio': return 'bg-error';
      case 'strength': return 'bg-warning';
      case 'flexibility': return 'bg-success';
      case 'nutrition': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  // Sort appointments by date and time
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  // Filter appointments by status
  const upcomingAppointments = sortedAppointments.filter(appointment => 
    appointment.status === 'scheduled' && new Date(`${appointment.date} ${appointment.time}`) > new Date()
  );
  
  const completedAppointments = sortedAppointments.filter(appointment => 
    appointment.status === 'completed'
  );

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
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
              <p className="text-muted-foreground mt-1">
                Plan your workouts and track your fitness appointments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Add Appointment
              </Button>
            </div>
          </div>

          {/* Add Appointment Form */}
          {showAddForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Add New Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Title"
                  placeholder="Morning Workout"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="workout">Workout</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength Training</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="nutrition">Nutrition Consultation</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Input
                    label="Notes (optional)"
                    placeholder="Add any notes about this appointment..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAppointment}
                  iconName="Check"
                  iconPosition="left"
                >
                  Add Appointment
                </Button>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${getAppointmentColor(appointment.type)} rounded-full flex items-center justify-center`}>
                        <Icon name={getAppointmentIcon(appointment.type)} size={20} color="white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          iconName="Check"
                          className="text-success"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          iconName="Trash2"
                          className="text-destructive"
                        />
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-card-foreground mb-2">{appointment.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={14} />
                        <span>{appointment.time} ({appointment.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Tag" size={14} />
                        <span className="capitalize">{appointment.type}</span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your first workout appointment to get started
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Appointment
                </Button>
              </div>
            )}
          </div>

          {/* Completed Appointments */}
          {completedAppointments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Completed Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedAppointments.slice(0, 6).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-card border border-border rounded-lg p-6 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${getAppointmentColor(appointment.type)} rounded-full flex items-center justify-center`}>
                        <Icon name={getAppointmentIcon(appointment.type)} size={20} color="white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          iconName="Trash2"
                          className="text-destructive"
                        />
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-card-foreground mb-2">{appointment.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={14} />
                        <span>{appointment.time} ({appointment.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Tag" size={14} />
                        <span className="capitalize">{appointment.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SchedulePage;
