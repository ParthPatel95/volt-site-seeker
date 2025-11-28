import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validateName } from '@/utils/emailValidation';

interface PasswordProtectionProps {
  linkToken: string;
  linkId: string;
  expectedHash: string;
  onVerified: (viewerData: { name: string; email: string }) => void;
}

export function PasswordProtection({ linkId, expectedHash, onVerified }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const { toast } = useToast();

  const handleVerify = () => {
    // Validate all fields
    const nameValidation = validateName(fullName);
    const emailValidation = validateEmail(email);
    const newErrors: typeof errors = {};

    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error;
    }
    
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifying(true);
    setErrors({});
    
    // Simple hash comparison (in production, use proper hashing)
    const inputHash = btoa(password);
    
    if (inputHash === expectedHash) {
      onVerified({ name: fullName, email });
      toast({
        title: 'Access Granted',
        description: 'Password verified successfully'
      });
    } else {
      setErrors({ password: 'Incorrect password' });
      toast({
        title: 'Access Denied',
        description: 'Incorrect password',
        variant: 'destructive'
      });
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Secure Document Access</h1>
        <p className="text-muted-foreground text-center mb-6">
          Please provide your information to access this document
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
          </div>
          
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Document'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
