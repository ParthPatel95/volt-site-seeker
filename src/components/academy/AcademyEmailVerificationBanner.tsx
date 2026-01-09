import React, { useState } from 'react';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { useToast } from '@/hooks/use-toast';

export const AcademyEmailVerificationBanner: React.FC = () => {
  const { academyUser, resendEmailVerification } = useAcademyAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  // Only show for unverified users - no dismiss option
  if (!academyUser || academyUser.is_email_verified) {
    return null;
  }

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
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Verify your email to unlock all courses
              </p>
              <p className="text-xs text-muted-foreground">
                Check your inbox for a verification link
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Resend Verification Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
