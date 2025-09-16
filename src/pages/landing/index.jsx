import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const features = [
    {
      icon: 'Dumbbell',
      title: 'AI-Powered Workouts',
      description: 'Get personalized workout plans tailored to your fitness goals with our advanced AI coach.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: 'Camera',
      title: 'Food Scanner',
      description: 'Scan any food item to instantly get detailed nutritional information and calorie counts.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: 'BarChart3',
      title: 'Progress Tracking',
      description: 'Monitor your fitness journey with detailed analytics and progress visualization.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: 'Users',
      title: 'Community Support',
      description: 'Connect with like-minded fitness enthusiasts and share your achievements.',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '50K+', label: 'Workouts Completed' },
    { number: '1M+', label: 'Calories Tracked' },
    { number: '95%', label: 'User Satisfaction' }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleGetStarted = () => {
    navigate('/register-screen');
  };

  const handleLogin = async () => {
    try {
      await login();
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name && user.email) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (e) {
      navigate('/login-screen');
    }
  };

  // close modal on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && showPricingModal) setShowPricingModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPricingModal]);

  return (
    <div
      className="min-h-screen overflow-hidden relative px-4 sm:px-6 bg-black"
    >
      {/* Creative blurred yellow→orange gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] bg-gradient-to-br from-amber-300 to-orange-500 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-48 w-[36rem] h-[36rem] bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10rem] left-1/3 w-[48rem] h-[48rem] bg-gradient-to-br from-orange-400 to-rose-500 rounded-full blur-3xl opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Navigation */}
  <nav className="relative z-10 px-4 sm:px-6 py-4">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <img src="/assets/images/atosfit.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-3xl sm:text-2xl font-bold text-white">
              ATOS Fit
            </span>
          </div>
          <div className="flex items-center space-x-6 sm:space-x-8">
              <div className="hidden sm:flex items-center space-x-4">
              <button onClick={() => setShowPricingModal(true)} className="text-white/80 hover:text-white transition-colors">Pricing</button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={authLoading}
              >
                <Icon name="LogIn" size={18} className="mr-2 text-white" />
                {authLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
  <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
  <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white">
                  <span className="bg-gradient-to-r from-primary via-accent to-orange-400 bg-clip-text text-transparent">
                    Transform
                  </span>
                  <br />
                  <span className="text-white">Your Fitness</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Journey
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg">
                  Experience the future of fitness with AI-powered workouts, intelligent food scanning, 
                  and personalized coaching that adapts to your unique goals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="pointer-events-none bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Icon name="Rocket" size={20} className="mr-2 text-black/70" />
                  Start Your Journey
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`text-center transition-all duration-500 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                  >
                    <div className="text-3xl font-bold text-amber-400 mb-1">{stat.number}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Feature Showcase */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Main Feature Card */}
                <div className={`absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} flex items-center justify-center shadow-lg`}>
                      <Icon name={features[currentFeature].icon} size={40} color="white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        {features[currentFeature].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl shadow-lg animate-bounce delay-500"></div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg shadow-lg animate-bounce delay-1000"></div>
              </div>

              {/* Feature Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ATOS Fit</span>?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Discover the features that make ATOS Fit the ultimate fitness companion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={feature.icon} size={32} color="white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing modal - opened from nav Pricing button */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
            onClick={() => setShowPricingModal(false)}
          />

          <div className="relative max-w-5xl w-full mx-auto">
            <div className="bg-white/6 backdrop-blur-2xl rounded-2xl p-6 border border-white/8 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Simple pricing for everyone</h2>
                  <p className="text-sm text-white/80">We're in beta — all plans are free during the beta period. Below are the intended plans and feature quotas.</p>
                </div>
                <button onClick={() => setShowPricingModal(false)} className="text-white/60 hover:text-white ml-4">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/6 backdrop-blur-md border border-white/8 rounded-2xl p-6 flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Free <span className="text-sm text-amber-300 ml-2">(Beta)</span></h3>
                    <div className="text-2xl font-bold text-white">$0</div>
                  </div>
                  <ul className="text-sm text-white/80 mb-6 space-y-2">
                    <li><strong>10 hours</strong> tracking / month</li>
                    <li><strong>100</strong> chatbot messages / month</li>
                    <li><strong>50</strong> food scans / month</li>
                  </ul>
                  <div className="mt-auto">
                    <Button
                      onClick={() => { setShowPricingModal(false); handleLogin(); }}
                      disabled={authLoading}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold shadow"
                    >
                      Get started — Free
                    </Button>
                  </div>
                </div>

                <div className="bg-white/6 backdrop-blur-md border border-white/8 rounded-2xl p-6 flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Premium</h3>
                    <div className="text-sm font-medium text-white/80">Planned</div>
                  </div>
                  <ul className="text-sm text-white/80 mb-6 space-y-2">
                    <li><strong>50 hours</strong> tracking / month</li>
                    <li><strong>500</strong> chatbot messages / month</li>
                    <li><strong>250</strong> food scans / month</li>
                  </ul>
                  <div className="mt-auto">
                    <button onClick={() => { setShowPricingModal(false); navigate('/pricing'); }} className="w-full py-2 rounded-lg border border-white/10 text-white/90">Free in Beta</button>
                  </div>
                </div>

                <div className="bg-white/6 backdrop-blur-md border border-white/8 rounded-2xl p-6 flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Premium Plus</h3>
                    <div className="text-sm font-medium text-white/80">Planned</div>
                  </div>
                  <ul className="text-sm text-white/80 mb-6 space-y-2">
                    <li><strong>Unlimited</strong> tracking</li>
                    <li><strong>Unlimited</strong> chatbot messages</li>
                    <li><strong>Unlimited</strong> food scans</li>
                  </ul>
                  <div className="mt-auto">
                    <button onClick={() => { setShowPricingModal(false); navigate('/pricing'); }} className="w-full py-2 rounded-lg border border-white/10 text-white/90">Free in Beta</button>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-white/70 text-center">All premium features are free during beta. These quotas illustrate the intended paywall after beta.</div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section removed as per request */}

      {/* Footer */}
  <footer className="relative z-10 px-4 sm:px-6 py-8 sm:py-8 border-t border-white/10">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <img src="/assets/images/atosfit.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-white">
              ATOS Fit
            </span>
          </div>
          <div className="text-sm text-white/70 text-center sm:text-left">
            © 2024 ATOS Fit. All rights reserved. Transform your fitness journey today.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
