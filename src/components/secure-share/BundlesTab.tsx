import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Plus } from 'lucide-react';

export function BundlesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Bundles</h2>
          <p className="text-muted-foreground">
            Create bundles of related documents for investors
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Folder className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No bundles yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Create document bundles to organize related files into deal rooms for easy sharing
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Bundle
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
