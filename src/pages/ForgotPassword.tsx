import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Battery, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/voltmarket/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the password reset link!');
        setEmail('');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/voltmarket/auth');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-3xl font-bold text-white">GridBazaar</h1>
              <p className="text-blue-100">Energy Infrastructure Marketplace</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Secure Password Recovery
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              We'll help you regain access to your GridBazaar account safely and securely.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Secure password reset process</span>
              </div>
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Email verification for account safety</span>
              </div>
              <div className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Quick and easy account recovery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-watt-gradient rounded-2xl">
                <Battery className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-watt-primary">GridBazaar</h1>
            <p className="text-muted-foreground">Energy Infrastructure Marketplace</p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="p-2 bg-watt-primary/10 rounded-xl">
                  <Mail className="w-6 h-6 text-watt-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Reset Your Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Message Display */}
              {message && (
                <Alert className="bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-5 h-5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-watt-primary focus:ring-watt-primary"
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-watt-gradient hover:opacity-90 text-white font-semibold text-lg shadow-watt-glow transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Back to Sign In */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link 
                  to="/voltmarket/auth" 
                  className="inline-flex items-center gap-2 text-sm text-watt-primary hover:text-watt-primary/80 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};