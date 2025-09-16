import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const AppHeader = ({ 
  onSidebarToggle, 
  isSidebarOpen = false,
  onThemeToggle,
  currentTheme = 'light',
  user = null,
  onLogout
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage or use defaults
  useEffect(() => {
    const savedNotifications = localStorage.getItem('atos_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Initialize with default notifications
      const defaultNotifications = [
        { 
          id: 1, 
          title: 'Welcome to ATOS Fit!', 
          message: 'Start your fitness journey with our AI-powered workout system.', 
          time: 'Just now', 
          unread: true,
          type: 'welcome',
          timestamp: Date.now()
        },
        { 
          id: 2, 
          title: 'Workout Reminder', 
          message: 'Time for your evening workout! Consistency is key to success.', 
          time: '5 min ago', 
          unread: true,
          type: 'reminder',
          timestamp: Date.now() - 300000
        },
        { 
          id: 3, 
          title: 'Achievement Unlocked', 
          message: 'Congratulations! You completed your first workout streak.', 
          time: '1 hour ago', 
          unread: false,
          type: 'achievement',
          timestamp: Date.now() - 3600000
        },
        { 
          id: 4, 
          title: 'Nutrition Tip', 
          message: 'Try adding more protein to your post-workout meals for better recovery.', 
          time: '2 hours ago', 
          unread: false,
          type: 'tip',
          timestamp: Date.now() - 7200000
        }
      ];
      setNotifications(defaultNotifications);
      localStorage.setItem('atos_notifications', JSON.stringify(defaultNotifications));
    }
  }, []);

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  // Mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, unread: false }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('atos_notifications', JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      unread: false
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('atos_notifications', JSON.stringify(updatedNotifications));
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('atos_notifications', JSON.stringify(updatedNotifications));
  };

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: Date.now(),
      time: 'Just now',
      unread: true,
      ...notification
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('atos_notifications', JSON.stringify(updatedNotifications));
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    if (onLogout) onLogout();
  };

  const handleProfileNavigation = () => {
    navigate('/user-profile');
    setShowProfileMenu(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement': return 'Trophy';
      case 'reminder': return 'Bell';
      case 'tip': return 'Lightbulb';
      case 'welcome': return 'Star';
      default: return 'Info';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement': return 'text-warning';
      case 'reminder': return 'text-primary';
      case 'tip': return 'text-success';
      case 'welcome': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-header">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Icon name="Menu" size={20} />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold text-foreground hidden sm:block">
              ATOS fit
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle moved to Profile Settings per spec */}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              aria-label="Notifications"
              className="relative"
            >
              <Icon name="Bell" size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-elevation-3 z-50">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications?.length > 0 ? (
                    notifications?.map((notification) => (
                      <div
                        key={notification?.id}
                        className={`p-4 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer ${
                          notification?.unread ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                            <Icon name={getNotificationIcon(notification.type)} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-sm text-popover-foreground">
                                {notification?.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Icon name="X" size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification?.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification?.time}
                            </p>
                          </div>
                        </div>
                        {notification?.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-11"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Icon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs mt-1">We'll notify you about achievements and updates</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-2"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground">
                {user?.name || 'User'}
              </span>
              <Icon name="ChevronDown" size={16} className="hidden md:block" />
            </Button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-lg shadow-elevation-3 z-50">
                <div className="p-3 border-b border-border">
                  <p className="font-medium text-popover-foreground">
                    {user?.name || 'User Name'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleProfileNavigation}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name="User" size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={onThemeToggle}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors sm:hidden"
                  >
                    <Icon name={currentTheme === 'light' ? 'Moon' : 'Sun'} size={16} />
                    <span>Toggle Theme</span>
                  </button>
                  
                </div>
                <div className="py-2 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default AppHeader;