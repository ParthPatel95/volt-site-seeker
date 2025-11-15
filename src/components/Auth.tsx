
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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AccessRequestForm } from '@/components/AccessRequestForm';
import { EnhancedLogo } from './EnhancedLogo';

interface AuthProps {
  onAuthStateChange?: (user: User | null, session: Session | null) => void;
}

export function Auth({ onAuthStateChange }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [hasGridBazaarAccount, setHasGridBazaarAccount] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get return URL from URL params (most reliable for iOS Safari) or storage as fallback
  const [searchParams] = useSearchParams();
  const returnUrlParam = searchParams.get('returnUrl');
  const returnUrl = returnUrlParam || localStorage.getItem('authReturnUrl') || sessionStorage.getItem('authReturnUrl') || '/app';
  
  console.log('[Auth] Return URL resolved:', returnUrl, {
    fromParam: !!returnUrlParam,
    fromLocalStorage: !!localStorage.getItem('authReturnUrl'),
    fromSessionStorage: !!sessionStorage.getItem('authReturnUrl')
  });

  useEffect(() => {
    // Check if user has a GridBazaar account but not VoltScout approval
    const checkGridBazaarAccount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if they have a GridBazaar profile
        const { data: gridBazaarProfile } = await supabase
          .from('voltmarket_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (gridBazaarProfile) {
          setHasGridBazaarAccount(true);
        }
      }
    };

    checkGridBazaarAccount();

    // Only set up auth state listener if onAuthStateChange is provided
    if (onAuthStateChange) {
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
    }
  }, [onAuthStateChange]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is approved for VoltScout
      if (data.user) {
        const { data: isApproved } = await supabase
          .rpc('is_voltscout_approved', { user_id: data.user.id });

        if (isApproved) {
          console.log('[Auth] Login successful, redirecting to:', returnUrl);
          
          // Clear the return URL from both storages
          localStorage.removeItem('authReturnUrl');
          sessionStorage.removeItem('authReturnUrl');
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          
          // Longer delay for iOS Safari to ensure auth state is fully established
          setTimeout(() => {
            // Use window.location for iOS Safari reliability
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              console.log('[Auth] iOS device detected, using window.location');
              window.location.href = returnUrl;
            } else {
              navigate(returnUrl, { replace: true });
            }
          }, 300);
        } else {
          // Check if they have a GridBazaar profile
          const { data: gridBazaarProfile } = await supabase
            .from('voltmarket_profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();
          
          if (gridBazaarProfile) {
            setHasGridBazaarAccount(true);
          } else {
            setError('Your account does not have VoltScout access. Please request access or contact support.');
          }
        }
      }
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
            <EnhancedLogo className="w-12 h-12 object-contain" />
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                Watt<Bitcoin className="w-8 h-8 text-orange-500 inline mx-0" />yte
              </h1>
            </div>
          </Link>
          <CardTitle>Access VoltScout Platform</CardTitle>
          <CardDescription>
            {hasGridBazaarAccount 
              ? "Your GridBazaar account does not have VoltScout access. Please contact support for approval."
              : showAccessForm 
                ? "Request access to our AI-powered energy discovery platform"
                : "Sign in to access your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasGridBazaarAccount ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">VoltScout Access Required</h3>
                <p className="text-orange-700 text-sm mb-4">
                  You have a GridBazaar account, but VoltScout requires separate approval. 
                  Contact our team to request VoltScout platform access.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    to="/voltmarket" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go to GridBazaar
                  </Link>
                  <Button 
                    onClick={() => setShowAccessForm(true)}
                    variant="outline"
                  >
                    Request VoltScout Access
                  </Button>
                </div>
              </div>
              <Button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setHasGridBazaarAccount(false);
                }}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign out and use different account
              </Button>
            </div>
          ) : showAccessForm ? (
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
              <form onSubmit={handleSignIn} className="space-y-4">
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
                  {loading ? 'Signing in...' : 'Sign In'}
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
                <p className="text-sm text-muted-foreground">
                  New to WattByte? Request access to our exclusive platform
                </p>
                <Button 
                  onClick={() => setShowAccessForm(true)}
                  variant="outline"
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
