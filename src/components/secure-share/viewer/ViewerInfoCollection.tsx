import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { validateEmail, validateName } from '@/utils/emailValidation';

interface ViewerInfoCollectionProps {
  onSubmit: (viewerData: { name: string; email: string }) => void;
}

export function ViewerInfoCollection({ onSubmit }: ViewerInfoCollectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = () => {
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ name: fullName, email });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Document Access</h1>
        <p className="text-muted-foreground text-center mb-6">
          Please provide your information to view this document
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
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
          >
            Continue to Document
          </Button>
        </div>
      </Card>
    </div>
  );
}
