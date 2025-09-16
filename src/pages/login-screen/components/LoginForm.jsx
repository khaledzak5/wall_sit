import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    try {
      const { validateUser } = await import('../../../utils/db');
      const user = await validateUser(formData?.email, formData?.password);
      if (!user) {
        setErrors({ general: 'Invalid email or password' });
        return;
      }
      localStorage.setItem(
        'user',
        JSON.stringify({ id: user.id, email: user.email, name: user.name })
      );
    } catch (e) {
      setErrors({ general: 'Login failed. Please try again.' });
      return;
    }

    if (onSubmit) await onSubmit(formData);
    navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    alert('Password reset link would be sent to your email');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {errors?.general && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
        autoFocus
        disabled={isLoading}
        prefix={<Icon name="Mail" size={18} className="text-[#edad45]" />}
      />

      {/* Password Field */}
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        placeholder="Enter your password"
        value={formData?.password}
        onChange={handleInputChange}
        error={errors?.password}
        required
        disabled={isLoading}
        prefix={<Icon name="Lock" size={18} className="text-[#edad45]" />}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="my-auto"
            disabled={isLoading}
            aria-label="Toggle password visibility"
          >
            <Icon
              name={showPassword ? 'EyeOff' : 'Eye'}
              size={18}
              className="text-[#edad45]"
            />
          </button>
        }
      />

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="h-12 flex items-center justify-center space-x-2"
      >
        <Icon name="LogIn" size={18} className="text-[#edad45]" />
        <span>Sign In</span>
      </Button>

      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register-screen')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
