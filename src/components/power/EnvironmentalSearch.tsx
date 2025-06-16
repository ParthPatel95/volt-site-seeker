
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface EnvironmentalSearchProps {
  region: string;
  setRegion: (region: string) => void;
  loading: boolean;
  onSearch: () => void;
}

export function EnvironmentalSearch({ region, setRegion, loading, onSearch }: EnvironmentalSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2 text-green-600" />
          Regional Environmental Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="region">Region/State</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Enter state or region name"
            />
          </div>
          <Button 
            onClick={onSearch}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Search className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
