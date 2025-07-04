import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Battery, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lightbulb,
  Shield,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

export const WattbytesAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: ''
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/voltmarket/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Email and password are required' });
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setMessage({ type: 'error', text: 'Full name is required' });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return false;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return false;
      }
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ type: 'error', text: 'Invalid email or password. Please try again.' });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
        } else if (data.session) {
          setMessage({ type: 'success', text: 'Welcome back! Redirecting...' });
          setTimeout(() => navigate('/voltmarket/dashboard'), 1500);
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/voltmarket/dashboard`,
            data: {
              full_name: formData.fullName,
              company: formData.company
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setMessage({ type: 'error', text: 'Email already registered. Try signing in instead.' });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
        } else if (data.user) {
          setMessage({ 
            type: 'success', 
            text: 'Account created successfully! Please check your email to verify your account.' 
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      company: ''
    });
    setMessage({ type: '', text: '' });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-watt-primary/5 via-watt-secondary/5 to-transparent flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-watt-gradient p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Battery className="w-10 h-10 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-white">Wattbytes</h1>
              <p className="text-blue-100">Energy Intelligence Platform</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Transform Your Energy Infrastructure with AI-Powered Insights
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join hundreds of companies optimizing their energy performance, reducing costs, 
              and improving sustainability with our intelligent platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Real-time energy monitoring and analytics</span>
              </div>
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>AI-driven optimization recommendations</span>
              </div>
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Enterprise-grade security and compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-watt-gradient rounded-2xl">
                <Battery className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-watt-primary">Wattbytes</h1>
            <p className="text-gray-600">Energy Intelligence Platform</p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="p-2 bg-watt-primary/10 rounded-xl">
                  {isLogin ? (
                    <Shield className="w-6 h-6 text-watt-primary" />
                  ) : (
                    <User className="w-6 h-6 text-watt-primary" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Sign in to access your energy dashboard' 
                  : 'Join the future of energy management'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-800 border border-red-200' 
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {/* Full Name (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Company (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Company (Optional)
                    </Label>
                    <div className="relative">
                      <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-watt-gradient hover:opacity-90 text-white font-semibold text-lg shadow-watt-glow transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Toggle Mode */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleMode}
                  className="border-watt-primary text-watt-primary hover:bg-watt-primary hover:text-white"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </Button>
              </div>

              {/* Back to Home */}
              <div className="text-center pt-2">
                <Link 
                  to="/voltmarket" 
                  className="text-sm text-gray-500 hover:text-watt-primary transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};