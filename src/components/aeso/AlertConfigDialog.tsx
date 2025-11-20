import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface AlertConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
}

export function AlertConfigDialog({ open, onOpenChange, dashboardId }: AlertConfigDialogProps) {
  const { toast } = useToast();
  const [metric, setMetric] = useState('pool_price');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('email');

  const handleCreateAlert = () => {
    if (!threshold) {
      toast({
        title: 'Missing threshold',
        description: 'Please enter a threshold value',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would save to the database
    toast({
      title: 'Alert created',
      description: `You'll be notified when ${metric} goes ${condition} ${threshold}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configure Alert
          </DialogTitle>
          <DialogDescription>
            Get notified when metrics cross your thresholds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="metric">Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger id="metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pool_price">Pool Price</SelectItem>
                <SelectItem value="demand">Demand (MW)</SelectItem>
                <SelectItem value="renewable_generation">Renewable Generation</SelectItem>
                <SelectItem value="system_marginal_price">System Marginal Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Goes Above
                  </div>
                </SelectItem>
                <SelectItem value="below">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Goes Below
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold Value</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter threshold value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification">Notification Method</Label>
            <Select value={notificationMethod} onValueChange={setNotificationMethod}>
              <SelectTrigger id="notification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="inapp">In-App Notification</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreateAlert} className="w-full">
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
