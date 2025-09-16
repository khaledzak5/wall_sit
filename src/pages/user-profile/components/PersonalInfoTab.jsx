import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PersonalInfoTab = ({ user, onUpdateUser }) => {
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    location: user?.location || ''
  });

  // Sync when user prop changes
  React.useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      location: user?.location || ''
    });
  }, [user?.name, user?.email, user?.phone, user?.dateOfBirth, user?.location]);

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    onUpdateUser({ ...user, [field]: formData?.[field] });
    try {
      const { updateUserProfile } = await import('../../../utils/db');
      await updateUserProfile(user.id, { [field]: formData?.[field] });
    } catch {}
    setEditingField(null);
  };

  const handleCancel = (field) => {
    setFormData({ ...formData, [field]: user?.[field] });
    setEditingField(null);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const InfoField = ({ label, field, icon, type = "text" }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name={icon} size={16} className="text-muted-foreground" />
            <label className="text-sm font-medium text-card-foreground">{label}</label>
          </div>
          
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field)}
              className="text-primary hover:text-primary/80"
            >
              <Icon name="Edit2" size={14} />
            </Button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              type={type}
              value={formData?.[field]}
              onChange={(e) => handleChange(field, e?.target?.value)}
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSave(field)}
                className="flex-1"
              >
                <Icon name="Check" size={14} className="mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(field)}
                className="flex-1"
              >
                <Icon name="X" size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground font-medium">
            {formData?.[field] || 'Not provided'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField
            label="Full Name"
            field="name"
            icon="User"
          />
          <InfoField
            label="Email Address"
            field="email"
            icon="Mail"
            type="email"
          />
          <InfoField
            label="Phone Number"
            field="phone"
            icon="Phone"
            type="tel"
          />
          <InfoField
            label="Date of Birth"
            field="dateOfBirth"
            icon="Calendar"
            type="date"
          />
        </div>
      </div>

      {/* Location Information */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
        <InfoField
          label="Location"
          field="location"
          icon="MapPin"
        />
      </div>

      {/* Account Settings */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
        <div className="space-y-3">
          {/* Theme Toggle in Profile Settings */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Sun" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">Appearance</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark');
                    if (isDark) {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                    } else {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                    }
                  }}
                  className="inline-flex items-center rounded-[12px] border border-input px-3 py-2 text-sm hover:bg-muted"
                >
                  <Icon name="Moon" size={16} className="mr-2" />
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Shield" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">Privacy Settings</p>
                  <p className="text-sm text-muted-foreground">Manage your privacy preferences</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Bell" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">Notification Preferences</p>
                  <p className="text-sm text-muted-foreground">Control your notification settings</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Trash2" size={20} className="text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;