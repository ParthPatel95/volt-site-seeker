
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, AlertCircle, Bitcoin, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { AccessRequestForm } from '@/components/AccessRequestForm';

interface AuthProps {
  onAuthStateChange: (user: User | null, session: Session | null) => void;
}

export function Auth({ onAuthStateChange }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        onAuthStateChange(session?.user ?? null, session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthStateChange(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [onAuthStateChange]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/app`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      {/* Navigation back to landing */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to WattByte</span>
        </Link>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                Watt<Bitcoin className="w-8 h-8 text-orange-500 inline mx-0" />yte
              </h1>
            </div>
          </Link>
          <CardTitle>{isSignUp ? 'Create Account' : 'Access VoltScout Platform'}</CardTitle>
          <CardDescription>
            {showAccessForm 
              ? "Request access to our AI-powered energy discovery platform"
              : isSignUp 
                ? "Sign up for a new account to access the platform"
                : "Sign in to access your account or create a new one"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAccessForm ? (
            <div className="space-y-6">
              <AccessRequestForm />
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAccessForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <Button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  variant="outline"
                  className="w-full"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  New to WattByte? Request access to our exclusive platform
                </p>
                <Button 
                  onClick={() => setShowAccessForm(true)}
                  variant="ghost"
                  className="w-full"
                >
                  Request Platform Access
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
