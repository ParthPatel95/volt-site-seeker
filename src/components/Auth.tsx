
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden border-r border-border bg-secondary/30 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <EnhancedLogo className="h-12 w-12 object-contain" />
              <div>
                <p className="text-2xl font-bold leading-tight">WattByte</p>
                <p className="text-sm text-muted-foreground">Infrastructure Company</p>
              </div>
            </Link>

            <div className="mt-24 space-y-8">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="h-px w-8 bg-primary" />
                VoltScout access
              </div>
              <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-normal">
                Power-first intelligence for site development.
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                Secure access to geocoding, infrastructure mapping, AESO analytics, and real-data site screening tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border-t border-border pt-4">
              <p className="font-semibold">Canada + USA</p>
              <p className="mt-1 text-muted-foreground">Cross-border site lookup</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="font-semibold">Live data</p>
              <p className="mt-1 text-muted-foreground">No mock intelligence</p>
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <Link 
            to="/" 
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:left-6 sm:top-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to WattByte</span>
          </Link>

          <Card className="w-full max-w-xl border-border bg-card/95 shadow-institutional">
            <CardHeader className="space-y-5 text-center">
              <Link to="/" className="mx-auto flex items-center justify-center gap-3 lg:hidden">
                <EnhancedLogo className="h-11 w-11 object-contain" />
                <div className="text-left">
                  <p className="text-2xl font-bold leading-tight">WattByte</p>
                  <p className="text-xs text-muted-foreground">Infrastructure Company</p>
                </div>
              </Link>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                {showAccessForm ? <ShieldCheck className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>

              <div>
                <CardTitle className="text-2xl">{showAccessForm ? 'Request VoltScout Access' : 'Access VoltScout'}</CardTitle>
                <CardDescription className="mt-2">
                  {hasGridBazaarAccount 
                    ? "Your GridBazaar account does not have VoltScout access. Please contact support for approval."
                    : showAccessForm 
                      ? "Submit your application for the energy intelligence platform."
                      : "Sign in to continue to the WattByte platform."
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
          {hasGridBazaarAccount ? (
            <div className="space-y-6 text-center">
              <div className="rounded-md border border-border bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground mb-2">VoltScout Access Required</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You have a GridBazaar account, but VoltScout requires separate approval. 
                  Contact our team to request VoltScout platform access.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    to="/voltmarket" 
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                  New to WattByte? Request platform access.
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
        </main>
      </div>
    </div>
  );
}
