import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Building, Loader2, Sparkles, BookOpen, Layers, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

// Floating Particle Component
const FloatingParticle = ({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-watt-bitcoin/30"
    style={{ width: size, height: size, left }}
    initial={{ y: "100vh", opacity: 0 }}
    animate={{ 
      y: "-100vh", 
      opacity: [0, 0.6, 0.6, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

const AcademyAuth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, academyUser, signIn, signUp, isLoading } = useAcademyAuth();

  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/academy';

  // Only redirect if user has BOTH auth AND academy profile
  // This ensures VoltScout users can't access Academy without Academy signup
  useEffect(() => {
    if (user && academyUser && !isLoading) {
      navigate(returnUrl, { replace: true });
    }
  }, [user, academyUser, isLoading, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, company);
        if (error) {
          let message = error.message;
          if (message.includes('already registered')) {
            message = 'This email is already registered. Please sign in instead.';
          }
          toast({
            title: 'Sign Up Failed',
            description: message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to WattByte Academy. Redirecting...',
          });
          // Navigate to academy after successful signup
          navigate(returnUrl, { replace: true });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          let message = error.message;
          if (message.includes('Invalid login credentials')) {
            message = 'Invalid email or password. Please try again.';
          }
          toast({
            title: 'Sign In Failed',
            description: message,
            variant: 'destructive'
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-watt-navy flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-watt-bitcoin" />
      </div>
    );
  }

  const benefits = [
    { icon: BookOpen, text: "Track progress across all modules" },
    { icon: Layers, text: "Resume learning from any device" },
    { icon: Award, text: "Earn completion certificates" },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-watt-navy via-watt-navy to-watt-navy overflow-hidden">
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Radial gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-watt-bitcoin/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-watt-blue/15 via-transparent to-transparent" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Subtle Gradient Accents */}
        <motion.div 
          className="absolute top-20 left-1/4 w-64 h-64 bg-watt-bitcoin/5 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 right-1/3 w-48 h-48 bg-watt-blue/5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <FloatingParticle delay={0} size={6} left="10%" duration={15} />
        <FloatingParticle delay={2} size={4} left="20%" duration={18} />
        <FloatingParticle delay={4} size={8} left="35%" duration={20} />
        <FloatingParticle delay={1} size={5} left="50%" duration={16} />
        <FloatingParticle delay={3} size={7} left="65%" duration={22} />
        <FloatingParticle delay={5} size={4} left="80%" duration={17} />
        <FloatingParticle delay={2.5} size={6} left="90%" duration={19} />
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Left Content - Brand */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6">
              <Sparkles className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Free Educational Platform</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              WattByte{" "}
              <span className="bg-gradient-to-r from-watt-bitcoin via-watt-bitcoin to-amber-400 bg-clip-text text-transparent">
                Academy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
              Sign in to track your progress, earn certificates, and master Bitcoin mining with industry-verified content.
            </p>

            {/* Benefits */}
            <div className="space-y-4 hidden lg:block">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-watt-bitcoin/10 border border-watt-bitcoin/30 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <span className="text-white/80">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center lg:justify-start gap-8 mt-10"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10</div>
                <div className="text-sm text-white/50">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98</div>
                <div className="text-sm text-white/50">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-watt-bitcoin">Free</div>
                <div className="text-sm text-white/50">Forever</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form or Verification Success */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-slate-800/70 rounded-2xl border border-white/20 p-8 backdrop-blur-sm shadow-2xl">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/80 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-watt-bitcoin/30">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-white/60 mt-2">
                    {isSignUp
                      ? 'Start your learning journey today'
                      : 'Continue your learning journey'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-white/20 text-white placeholder:text-white/40 focus:border-watt-bitcoin"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-white/80">Company (Optional)</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input
                            id="company"
                            type="text"
                            placeholder="Your Company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-white/20 text-white placeholder:text-white/40 focus:border-watt-bitcoin"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-white/20 text-white placeholder:text-white/40 focus:border-watt-bitcoin"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-white/20 text-white placeholder:text-white/40 focus:border-watt-bitcoin"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white shadow-lg shadow-watt-bitcoin/25 mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>
                </form>

                {/* Toggle Sign In/Sign Up */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-watt-bitcoin hover:text-watt-bitcoin/80 transition-colors"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>

                {/* Mobile Benefits */}
                <div className="mt-8 pt-6 border-t border-white/10 lg:hidden">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {benefits.map((benefit) => (
                      <div key={benefit.text} className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-watt-bitcoin" />
                        <span className="text-xs text-white/60">{benefit.text.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AcademyAuth;
