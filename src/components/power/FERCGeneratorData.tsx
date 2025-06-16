
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface FERCGeneratorDataProps {
  generatorData: any;
}

export function FERCGeneratorData({ generatorData }: FERCGeneratorDataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Active Generators
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generatorData && generatorData.generators ? (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatorData.generators.map((generator: any) => (
                <div key={generator.plant_id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="space-y-2">
                    <h4 className="font-medium">{generator.plant_name}</h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Operator:</span>
                        <span>{generator.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium">{generator.capacity_mw} MW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Type:</span>
                        <Badge variant="outline" className="text-xs">{generator.fuel_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{generator.county}, {generator.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commercial Date:</span>
                        <span>{new Date(generator.commercial_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading generator data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
