
import { Clock } from 'lucide-react';

export function InterconnectionQueuePlaceholder() {
  return (
    <div className="text-center py-12">
      <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-muted-foreground">Interconnection Queue Monitor</h3>
      <p className="text-muted-foreground mt-2">ERCOT, PJM, MISO queue integration coming in Phase 3</p>
      <div className="mt-6 space-y-2">
        <p className="text-sm text-muted-foreground">• Real-time queue position tracking</p>
        <p className="text-sm text-muted-foreground">• Delay prediction algorithms</p>
        <p className="text-sm text-muted-foreground">• Interconnection cost estimation</p>
      </div>
    </div>
  );
}
