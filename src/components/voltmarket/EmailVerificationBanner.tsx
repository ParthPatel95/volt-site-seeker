import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Clock,
  Shield
} from 'lucide-react';

interface EmailVerificationBannerProps {
  variant?: 'banner' | 'card' | 'inline';
  showResendButton?: boolean;
  onVerificationSent?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  variant = 'banner',
  showResendButton = true,
  onVerificationSent
}) => {
  const { user, profile, resendEmailVerification } = useVoltMarketAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // Don't show if user is not logged in
  if (!user || !profile) return null;

  // Don't show if email is already verified
  if (profile.is_email_verified) {
    if (variant === 'inline') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Email verified</span>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Verified
          </Badge>
        </div>
      );
    }
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const { error } = await resendEmailVerification();
      
      if (error) {
        setResendError(error.message || 'Failed to send verification email');
      } else {
        setResendMessage('Verification email sent! Please check your inbox and spam folder.');
        onVerificationSent?.();
      }
    } catch (err) {
      setResendError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <span className="text-gray-600">Email not verified</span>
        <Badge variant="outline" className="border-amber-200 text-amber-700">
          Pending
        </Badge>
        {showResendButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="h-6 px-2 text-xs"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend'
            )}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">
                Email Verification Required
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                Please verify your email address to access all features and receive important updates.
              </p>
              
              {resendMessage && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {resendMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              {resendError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {resendError}
                  </AlertDescription>
                </Alert>
              )}
              
              {showResendButton && (
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending Verification Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner variant
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-100 rounded-full">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">
                Email Verification Required
              </p>
              <p className="text-sm text-amber-700">
                Verify your email to unlock full access to WattBytes features
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="w-4 h-4" />
            <span>Pending verification</span>
          </div>
          
          {showResendButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {resendMessage && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>{resendMessage}</span>
          </div>
        </div>
      )}
      
      {resendError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{resendError}</span>
          </div>
        </div>
      )}
    </div>
  );
};