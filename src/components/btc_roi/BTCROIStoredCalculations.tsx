
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Trash2, 
  Calculator,
  Building2,
  Zap,
  Filter,
  SortAsc,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoredCalculation, HostingROIResults, BTCROIResults } from './types/btc_roi_types';
import { useStoredCalculationsDB } from './hooks/useStoredCalculationsDB';
import { BTCROICalculationCard } from './stored_calculations/BTCROICalculationCard';
import { BTCROICalculationDetailView } from './stored_calculations/BTCROICalculationDetailView';
import { BTCROICalculationSaveForm } from './stored_calculations/BTCROICalculationSaveForm';

interface BTCROIStoredCalculationsProps {
  currentCalculationType: 'hosting' | 'self';
  currentResults: HostingROIResults | BTCROIResults | null;
  onSaveCalculation: (siteName?: string) => void;
}

export const BTCROIStoredCalculations: React.FC<BTCROIStoredCalculationsProps> = ({
  currentCalculationType,
  currentResults,
  onSaveCalculation
}) => {
  const { storedCalculations, deleteCalculation, clearAllCalculations, loading } = useStoredCalculationsDB();
  const [selectedCalculation, setSelectedCalculation] = useState<StoredCalculation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hosting' | 'self'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'profit'>('date');

  // Filter and sort calculations
  const filteredCalculations = storedCalculations
    .filter(calc => {
      const matchesSearch = calc.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           calc.formData.asicModel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || calc.calculationType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.siteName.localeCompare(b.siteName);
        case 'profit':
          const aProfit = a.calculationType === 'hosting' 
            ? (a.results as HostingROIResults).netProfit
            : (a.results as BTCROIResults).yearlyNetProfit;
          const bProfit = b.calculationType === 'hosting' 
            ? (b.results as HostingROIResults).netProfit
            : (b.results as BTCROIResults).yearlyNetProfit;
          return bProfit - aProfit;
        case 'date':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading calculations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="w-6 h-6 text-blue-600" />
          Stored Calculations
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({filteredCalculations.length} of {storedCalculations.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Save Current Calculation */}
        <BTCROICalculationSaveForm 
          onSave={onSaveCalculation}
          isVisible={!!currentResults}
        />

        {/* Search and Filter Controls */}
        {storedCalculations.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by site name or ASIC model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: 'all' | 'hosting' | 'self') => setFilterType(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hosting">Hosting Only</SelectItem>
                  <SelectItem value="self">Self Mining Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'profit') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="profit">Sort by Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{storedCalculations.length}</div>
                <div className="text-xs text-blue-600">Total Calculations</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">
                  {storedCalculations.filter(c => c.calculationType === 'hosting').length}
                </div>
                <div className="text-xs text-green-600">Hosting Scenarios</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-700">
                  {storedCalculations.filter(c => c.calculationType === 'self').length}
                </div>
                <div className="text-xs text-orange-600">Self Mining</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">
                  {new Set(storedCalculations.map(c => c.formData.asicModel)).size}
                </div>
                <div className="text-xs text-purple-600">ASIC Models</div>
              </div>
            </div>
          </div>
        )}

        {/* Calculations List */}
        {filteredCalculations.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
            {storedCalculations.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No saved calculations yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Run a calculation above and save it to build your calculation history
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Hosting Analysis
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Self Mining
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No calculations match your search</h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Showing {filteredCalculations.length} calculation{filteredCalculations.length !== 1 ? 's' : ''}
              </span>
              {storedCalculations.length > 0 && (
                <Button
                  onClick={clearAllCalculations}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredCalculations.map((calculation) => (
                  <div key={calculation.id}>
                    <BTCROICalculationCard
                      calculation={calculation}
                      onView={setSelectedCalculation}
                      onDelete={deleteCalculation}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Detail View Dialog */}
        <Dialog open={!!selectedCalculation} onOpenChange={() => setSelectedCalculation(null)}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCalculation?.calculationType === 'hosting' ? (
                  <Building2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <Zap className="w-5 h-5 text-orange-600" />
                )}
                {selectedCalculation?.siteName}
              </DialogTitle>
              <DialogDescription>
                Detailed analysis for {selectedCalculation?.calculationType === 'hosting' ? 'hosting' : 'self-mining'} calculation from {selectedCalculation?.timestamp.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            {selectedCalculation && (
              <BTCROICalculationDetailView calculation={selectedCalculation} />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
