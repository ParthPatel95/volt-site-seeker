import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Zap,
  Building2,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { StoredCalculation, HostingROIResults, BTCROIResults } from './types/btc_roi_types';
import { useStoredCalculationsDB } from './hooks/useStoredCalculationsDB';

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
  const [siteName, setSiteName] = useState('');
  const [selectedCalculation, setSelectedCalculation] = useState<StoredCalculation | null>(null);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  const handleSave = () => {
    onSaveCalculation(siteName.trim() || undefined);
    setSiteName('');
  };

  const renderResultsSummary = (calc: StoredCalculation) => {
    const isHosting = calc.calculationType === 'hosting';
    const results = calc.results as HostingROIResults | BTCROIResults;

    if (isHosting) {
      const hostingResults = results as HostingROIResults;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-700">{formatCurrency(hostingResults.netProfit)}</div>
            <div className="text-green-600">Net Profit</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-700">{formatPercent(hostingResults.roi12Month)}</div>
            <div className="text-blue-600">12M ROI</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-700">{formatPercent(hostingResults.profitMarginPercent)}</div>
            <div className="text-purple-600">Margin</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="font-bold text-orange-700">{hostingResults.paybackPeriodYears.toFixed(1)}y</div>
            <div className="text-orange-600">Payback</div>
          </div>
        </div>
      );
    } else {
      const miningResults = results as BTCROIResults;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-700">{formatCurrency(miningResults.dailyNetProfit)}</div>
            <div className="text-green-600">Daily Profit</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-700">{formatPercent(miningResults.roi12Month)}</div>
            <div className="text-blue-600">12M ROI</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-700">{miningResults.breakEvenDays.toFixed(0)} days</div>
            <div className="text-purple-600">Break Even</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="font-bold text-orange-700">{formatCurrency(miningResults.totalInvestment)}</div>
            <div className="text-orange-600">Investment</div>
          </div>
        </div>
      );
    }
  };

  const renderDetailedView = (calc: StoredCalculation) => {
    const isHosting = calc.calculationType === 'hosting';
    
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Calculation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calculation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{calc.timestamp.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <Badge variant={isHosting ? "default" : "secondary"}>
                  {isHosting ? 'Hosting' : 'Self Mining'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Region:</span>
                <span>{calc.formData.region}</span>
              </div>
              {isHosting && (
                <div className="flex justify-between">
                  <span>Total Load:</span>
                  <span>{calc.formData.totalLoadKW.toLocaleString()} kW</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Network Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>BTC Price:</span>
                <span>{formatCurrency(calc.networkData.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span>{(calc.networkData.difficulty / 1e12).toFixed(2)}T</span>
              </div>
              <div className="flex justify-between">
                <span>Block Reward:</span>
                <span>{calc.networkData.blockReward} BTC</span>
              </div>
              <div className="flex justify-between">
                <span>Network Hashrate:</span>
                <span>{(calc.networkData.hashrate / 1e18).toFixed(0)} EH/s</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderResultsSummary(calc)}
          </CardContent>
        </Card>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Metric</TableHead>
                    <TableHead className="text-xs text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isHosting ? (
                    <>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Total Energy Usage</TableCell>
                        <TableCell className="text-xs text-right">{(calc.results as HostingROIResults).totalEnergyUsageKWh.toLocaleString()} kWh</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Hosting Revenue</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalHostingRevenue)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Electricity Cost</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalElectricityCost)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Operational Cost</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalOperationalCost)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Annual Taxes</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).taxAnalysis.totalAnnualTaxes)}</TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Daily BTC Mined</TableCell>
                        <TableCell className="text-xs text-right">{(calc.results as BTCROIResults).dailyBTCMined.toFixed(6)} BTC</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Monthly Revenue</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).monthlyRevenue)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Monthly Power Cost</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).monthlyPowerCost)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Monthly Pool Fees</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).monthlyPoolFees)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Yearly Net Profit</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).yearlyNetProfit)}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          Stored Calculations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Calculation */}
        {currentResults && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Save Current Calculation</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-sm">Site Name (Optional)</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Leave blank for auto-generated name"
                className="text-sm"
              />
            </div>
            <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Calculation
            </Button>
          </div>
        )}

        {/* Stored Calculations List */}
        {storedCalculations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No saved calculations yet</p>
            <p className="text-xs mt-1">Run a calculation above and save it to view history</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-sm font-medium">
                {storedCalculations.length} Saved Calculation{storedCalculations.length !== 1 ? 's' : ''}
              </span>
              {storedCalculations.length > 0 && (
                <Button
                  onClick={clearAllCalculations}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {storedCalculations.map((calc) => (
                  <Card key={calc.id} className="relative">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {calc.calculationType === 'hosting' ? (
                              <Building2 className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Zap className="w-4 h-4 text-orange-500" />
                            )}
                            <span className="font-medium text-sm">{calc.siteName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {calc.timestamp.toLocaleDateString()}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCalculation(calc)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {calc.calculationType === 'hosting' ? (
                                      <Building2 className="w-5 h-5" />
                                    ) : (
                                      <Zap className="w-5 h-5" />
                                    )}
                                    {calc.siteName}
                                  </DialogTitle>
                                </DialogHeader>
                                {renderDetailedView(calc)}
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => deleteCalculation(calc.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {renderResultsSummary(calc)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
