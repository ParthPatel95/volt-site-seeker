import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { useToast } from '@/hooks/use-toast';

interface AcademyEmailVerificationSuccessProps {
  email: string;
}

export const AcademyEmailVerificationSuccess: React.FC<AcademyEmailVerificationSuccessProps> = ({ email }) => {
  const navigate = useNavigate();
  const { resendEmailVerification } = useAcademyAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await resendEmailVerification();
      if (error) {
        toast({
          title: 'Failed to send email',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Verification email sent!',
          description: 'Please check your inbox and spam folder.',
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/70 rounded-2xl border border-white/20 p-8 backdrop-blur-sm shadow-2xl text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
      >
        <Mail className="h-10 w-10 text-white" />
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">
        Check Your Email
      </h2>

      {/* Email Display */}
      <div className="bg-slate-900/50 rounded-lg px-4 py-3 mb-6">
        <p className="text-watt-bitcoin font-medium">{email}</p>
      </div>

      {/* Description */}
      <p className="text-white/70 mb-8 max-w-sm mx-auto">
        We've sent you a verification link. Click it to verify your email and unlock all Academy courses.
      </p>

      {/* Benefits */}
      <div className="bg-slate-900/30 rounded-xl p-4 mb-8">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Once verified, you'll be able to:</h3>
        <ul className="space-y-2 text-left">
          {[
            'Start and track progress across all modules',
            'Earn completion certificates',
            'Resume learning from any device',
          ].map((benefit, index) => (
            <motion.li
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {benefit}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={isResending}
          className="flex-1 bg-white text-slate-800 hover:bg-white/90 border-white/20"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Email
            </>
          )}
        </Button>
        <Button
          onClick={() => navigate('/academy')}
          className="flex-1 bg-watt-bitcoin hover:bg-watt-bitcoin/90"
        >
          Browse Academy
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-white/40 mt-6">
        Didn't receive it? Check your spam folder or try resending.
      </p>
    </motion.div>
  );
};
