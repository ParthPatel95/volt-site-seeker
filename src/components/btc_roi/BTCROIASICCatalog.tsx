
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Zap, DollarSign, Cpu, TrendingUp } from 'lucide-react';
import { ASICModel } from './types/btc_roi_types';

interface BTCROIASICCatalogProps {
  onSelectASIC: (asic: ASICModel) => void;
}

export const BTCROIASICCatalog: React.FC<BTCROIASICCatalogProps> = ({ onSelectASIC }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'hashrate' | 'efficiency' | 'price' | 'profitability'>('profitability');

  // Mock ASIC data - in production this would come from an API
  const asicModels: ASICModel[] = [
    {
      model: 'Antminer S21',
      hashrate: 200,
      powerDraw: 3550,
      price: 3500,
      efficiency: 17.75, // W/TH
      manufacturer: 'Bitmain',
      releaseDate: '2023',
      profitabilityRank: 1
    },
    {
      model: 'WhatsMiner M60',
      hashrate: 172,
      powerDraw: 3344,
      price: 3200,
      efficiency: 19.44,
      manufacturer: 'MicroBT',
      releaseDate: '2023',
      profitabilityRank: 2
    },
    {
      model: 'Antminer S19 XP',
      hashrate: 140,
      powerDraw: 3010,
      price: 2800,
      efficiency: 21.5,
      manufacturer: 'Bitmain',
      releaseDate: '2022',
      profitabilityRank: 3
    },
    {
      model: 'WhatsMiner M50S',
      hashrate: 126,
      powerDraw: 3306,
      price: 2500,
      efficiency: 26.24,
      manufacturer: 'MicroBT',
      releaseDate: '2022',
      profitabilityRank: 4
    },
    {
      model: 'Antminer S19j Pro',
      hashrate: 100,
      powerDraw: 3050,
      price: 2200,
      efficiency: 30.5,
      manufacturer: 'Bitmain',
      releaseDate: '2021',
      profitabilityRank: 5
    },
    {
      model: 'AvalonMiner 1366',
      hashrate: 100,
      powerDraw: 3450,
      price: 2000,
      efficiency: 34.5,
      manufacturer: 'Canaan',
      releaseDate: '2022',
      profitabilityRank: 6
    }
  ];

  const filteredAndSortedASICs = asicModels
    .filter(asic => 
      asic.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asic.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'hashrate':
          return b.hashrate - a.hashrate;
        case 'efficiency':
          return a.efficiency - b.efficiency; // Lower is better
        case 'price':
          return a.price - b.price;
        case 'profitability':
        default:
          return a.profitabilityRank - b.profitabilityRank;
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          ASIC Catalog
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Sort Controls */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search ASICs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profitability">Profitability</SelectItem>
              <SelectItem value="hashrate">Hashrate</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ASIC Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedASICs.map((asic) => (
            <Card key={asic.model} className="border-2 hover:border-orange-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{asic.model}</h3>
                    <p className="text-sm text-muted-foreground">{asic.manufacturer}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    #{asic.profitabilityRank}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{asic.hashrate} TH/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{asic.efficiency} W/TH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span>${asic.price.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600">
                    {asic.powerDraw}W
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    onClick={() => onSelectASIC(asic)}
                    className="w-full"
                    size="sm"
                  >
                    Use This ASIC
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedASICs.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No ASICs found matching your search</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
