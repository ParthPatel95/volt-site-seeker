import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NDASignatureProps {
  linkId: string;
  documentName: string;
  onSigned: () => void;
}

export function NDASignature({ linkId, documentName, onSigned }: NDASignatureProps) {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();

  const handleSign = async () => {
    if (!name || !agreed) return;

    setIsSigning(true);
    
    const { error } = await supabase
      .from('secure_links')
      .update({ nda_signed_at: new Date().toISOString() })
      .eq('id', linkId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign NDA. Please try again.',
        variant: 'destructive'
      });
      setIsSigning(false);
      return;
    }

    toast({
      title: 'NDA Signed',
      description: 'You can now view the document'
    });
    
    onSigned();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Non-Disclosure Agreement</h1>
        <p className="text-muted-foreground text-center mb-6">
          Please review and sign the NDA to access: <strong>{documentName}</strong>
        </p>

        <div className="bg-muted p-6 rounded-lg mb-6 max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-2">Terms & Conditions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            By accessing this document, you agree to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Keep all information confidential</li>
            <li>Not share, copy, or distribute the document</li>
            <li>Use the information solely for evaluation purposes</li>
            <li>Delete or return all materials upon request</li>
            <li>Not reverse engineer or attempt to extract proprietary information</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agreed && name && handleSign()}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agree"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the terms of this Non-Disclosure Agreement
            </label>
          </div>
          
          <Button 
            onClick={handleSign} 
            disabled={isSigning || !name || !agreed}
            className="w-full"
          >
            {isSigning ? 'Signing...' : 'Sign NDA & Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
