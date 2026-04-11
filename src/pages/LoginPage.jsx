import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Github, Chrome, User, Users, Shield } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { cn } from '../lib/utils.js';
import { setStoredUser, requestPasswordReset } from '../lib/session.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [resetEmail, setResetEmail] = React.useState('');
  const [showResetForm, setShowResetForm] = React.useState(false);
  const [role, setRole] = React.useState('student');
  const [fullName, setFullName] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Store user info for demo purposes
    const userData = {
      name: isRegister ? fullName : (fullName || 'Alex Johnson'),
      role: role,
      isNewUser: isRegister
    };
    setStoredUser(userData, { resetDemoData: isRegister });

    setTimeout(() => {
      setIsLoading(false);
      showMessage(`${isRegister ? 'Account created' : 'Signed in'} successfully.`);
      navigate(`/${role}/dashboard`);
    }, 1500);
  };

  const buildProviderAuthUrl = (provider) => {
    const redirectUri = `${window.location.origin}/login`;
    const isGoogle = provider === 'Google';
    const clientId = isGoogle ? import.meta.env.VITE_GOOGLE_CLIENT_ID : import.meta.env.VITE_GITHUB_CLIENT_ID;

    if (!clientId) {
      return null;
    }

    if (isGoogle) {
      const scope = encodeURIComponent('openid email profile');
      const prompt = isRegister ? 'consent' : 'select_account';
      const state = encodeURIComponent(JSON.stringify({ role, isRegister, provider }));
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&prompt=${prompt}&state=${state}`;
    }

    const scope = encodeURIComponent('read:user user:email');
    const state = encodeURIComponent(JSON.stringify({ role, isRegister, provider }));
    return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  };

  const handleProviderAuth = (provider) => {
    const authUrl = buildProviderAuthUrl(provider);
    if (!authUrl) {
      showMessage(`Set VITE_${provider.toUpperCase()}_CLIENT_ID to enable ${provider} sign in.`);
      return;
    }

    window.location.assign(authUrl);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      showMessage('Enter your email to request a reset link.');
      return;
    }

    const request = requestPasswordReset(resetEmail.trim().toLowerCase());
    showMessage(`Reset link prepared for ${request.email}. Check your email inbox.`);
    setShowResetForm(false);
    setResetEmail('');
  };

  const roles = [
    { id: 'student', label: 'Student', icon: User },
    { id: 'teacher', label: 'Teacher', icon: Users },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  const showMessage = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="bg-brand-600 p-2 rounded-xl">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-bold font-display text-slate-900 tracking-tight">Smart Exam Hub</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">{isRegister ? 'Create an account' : 'Welcome back'}</h2>
          <p className="text-slate-500 mt-2">
            {isRegister ? 'Join thousands of students and teachers today' : 'Enter your credentials to access your dashboard'}
          </p>
          {statusMessage && <p className="text-sm text-brand-600 mt-3">{statusMessage}</p>}
        </div>

        <Card className="p-8 shadow-xl border-slate-100">
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-700 block mb-3">Select your role</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    role === r.id 
                      ? "border-brand-600 bg-brand-50 text-brand-600" 
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <r.icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Sunjay Gir"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="sunjay@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setShowResetForm((prev) => !prev)}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
              {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {showResetForm && !isRegister && (
            <form onSubmit={handlePasswordReset} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Reset your password</p>
                <p className="text-sm text-slate-500">We’ll prepare a reset request using the email address you enter.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                  placeholder="alex@example.com"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Send Reset Link</Button>
                <Button type="button" variant="outline" onClick={() => setShowResetForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or {isRegister ? 'sign up' : 'continue'} with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => handleProviderAuth('Google')}
            >
              <Chrome className="w-5 h-5 mr-2" /> Google
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => handleProviderAuth('GitHub')}
            >
              <Github className="w-5 h-5 mr-2" /> GitHub
            </Button>
          </div>
        </Card>

        <p className="text-center text-slate-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-brand-600 font-bold hover:text-brand-700">
            {isRegister ? 'Sign in' : 'Sign up free'}
          </Link>
        </p>
      </div>
    </div>
  );
};
