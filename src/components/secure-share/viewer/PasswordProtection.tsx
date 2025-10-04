import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordProtectionProps {
  linkToken: string;
  expectedHash: string;
  onVerified: () => void;
}

export function PasswordProtection({ expectedHash, onVerified }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = () => {
    setIsVerifying(true);
    
    // Simple hash comparison (in production, use proper hashing)
    const inputHash = btoa(password);
    
    if (inputHash === expectedHash) {
      onVerified();
      toast({
        title: 'Access Granted',
        description: 'Password verified successfully'
      });
    } else {
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
        
        <h1 className="text-2xl font-bold text-center mb-2">Password Required</h1>
        <p className="text-muted-foreground text-center mb-6">
          This document is password protected. Please enter the password to continue.
        </p>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
          
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || !password}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Document'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
