
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useUnifiedScan } from '../hooks/useUnifiedScan';

export function LiveScanProgress() {
  const { isScanning, scanProgress, currentPhase, error } = useUnifiedScan();

  if (!isScanning && scanProgress === 0 && !error) {
    return null;
  }

  const isComplete = scanProgress >= 100;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        {error ? (
          <XCircle className="w-5 h-5 text-destructive" />
        ) : isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {error ? 'Scan Failed' : isComplete ? 'Scan Complete' : currentPhase || 'Initializing scan...'}
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
        <span className="text-sm font-semibold text-primary">{scanProgress}%</span>
      </div>
      
      <Progress value={scanProgress} className="h-2" />

      {/* Phase Indicators */}
      <div className="flex justify-between mt-3 text-xs text-muted-foreground">
        <PhaseIndicator 
          label="Idle Sites" 
          active={scanProgress > 0 && scanProgress < 30} 
          complete={scanProgress >= 30} 
        />
        <PhaseIndicator 
          label="Corporate" 
          active={scanProgress >= 30 && scanProgress < 60} 
          complete={scanProgress >= 60} 
        />
        <PhaseIndicator 
          label="Satellite" 
          active={scanProgress >= 60 && scanProgress < 85} 
          complete={scanProgress >= 85} 
        />
        <PhaseIndicator 
          label="Complete" 
          active={scanProgress >= 85 && scanProgress < 100} 
          complete={scanProgress >= 100} 
        />
      </div>
    </div>
  );
}

function PhaseIndicator({ label, active, complete }: { label: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${complete ? 'text-green-500' : active ? 'text-primary' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${
        complete ? 'bg-green-500' : active ? 'bg-primary animate-pulse' : 'bg-muted'
      }`} />
      <span>{label}</span>
    </div>
  );
}
