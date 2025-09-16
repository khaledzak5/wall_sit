import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('atos_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
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

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('atos_notifications', JSON.stringify([]));
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

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    if (filter === 'read') return !notification.unread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;
  const readCount = notifications.filter(n => !n.unread).length;

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
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with your fitness progress and achievements
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

          {/* Filter and Actions */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Unread ({unreadCount})
                  </Button>
                  <Button
                    variant={filter === 'read' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('read')}
                  >
                    Read ({readCount})
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    iconName="Check"
                    iconPosition="left"
                  >
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                    iconName="Trash2"
                    iconPosition="left"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:shadow-elevation-2 ${
                    notification.unread ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <Icon name={getNotificationIcon(notification.type)} size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">
                            {notification.title}
                          </h3>
                          <p className="text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {notification.time}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.unread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              iconName="Check"
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            iconName="Trash2"
                            className="text-destructive hover:text-destructive"
                          />
                        </div>
                      </div>
                      
                      {notification.unread && (
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-xs text-primary font-medium">Unread</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="Bell" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'We\'ll notify you about achievements, reminders, and updates'
                    : `You don't have any ${filter} notifications at the moment`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
