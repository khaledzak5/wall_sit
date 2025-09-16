import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ user, onProfilePictureUpdate }) => {
  const [showImageOptions, setShowImageOptions] = useState(false);

  const handleImageUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onProfilePictureUpdate(e?.target?.result);
      };
      reader?.readAsDataURL(file);
    }
    setShowImageOptions(false);
  };

  const membershipDuration = () => {
    const joinDate = new Date(user.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-success/5 to-accent/10 rounded-xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-elevation-2">
            <Image
              src={user?.profilePicture}
              alt={`${user?.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Camera Overlay */}
          <button
            onClick={() => setShowImageOptions(true)}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-elevation-2 hover:bg-primary/90 transition-colors"
            aria-label="Update profile picture"
          >
            <Icon name="Camera" size={16} />
          </button>

          {/* Image Upload Options */}
          {showImageOptions && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowImageOptions(false)}
              />
              <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 min-w-48">
                <div className="p-2">
                  <label className="flex items-center space-x-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md cursor-pointer transition-colors">
                    <Icon name="Upload" size={16} />
                    <span>Upload from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors">
                    <Icon name="Camera" size={16} />
                    <span>Take photo</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-destructive hover:bg-muted rounded-md transition-colors">
                    <Icon name="Trash2" size={16} />
                    <span>Remove photo</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {user?.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Calendar" size={16} />
              <span className="text-sm">Member for {membershipDuration()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-success font-medium">Active</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center sm:justify-start space-x-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user?.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user?.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user?.achievements}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
          <Button variant="outline" size="sm">
            <Icon name="Share2" size={16} className="mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Settings" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;