
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EnergyRateInput } from './EnergyRateInputTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnergyRateDetailsModal } from './EnergyRateDetailsModal';


export interface EnergyRateResults {
  monthlyData: MonthlyRateData[];
  averageAllInPrice: {
    centsPerKWh: number;
    dollarsPerMWh: number;
  };
  territory: {
    utility: string;
    market: string;
    region: string;
  };
  dataSourceUrls: string[];
  calculationDate: string;
  currency: 'CAD' | 'USD';
  forecasts?: {
    threeYear: MonthlyRateData[];
    fiveYear: MonthlyRateData[];
    methodology: string;
    dataSourceUrls: string[];
  };
}


export interface MonthlyRateData {
  month: string;
  energyPrice: number; // ¢/kWh (includes retail adder)
  transmissionDistribution: number; // ¢/kWh (legacy combined)
  riders: number; // ¢/kWh
  tax: number; // ¢/kWh
  total: number; // ¢/kWh
  totalMWh: number; // $/MWh
  // New optional detailed breakdown
  wholesaleEnergy?: number; // ¢/kWh
  retailAdder?: number; // ¢/kWh
  transmission?: number; // ¢/kWh
  distribution?: number; // ¢/kWh
  demandCharge?: number; // ¢/kWh
}

interface EnergyRateResultsProps {
  results: EnergyRateResults;
  input: EnergyRateInput;
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
}

export function EnergyRateResults({ results, input, onDownloadCSV, onDownloadPDF }: EnergyRateResultsProps) {
  const formatPrice = (value: number, currency: string = results.currency) => {
    return `${value.toFixed(2)} ¢/kWh (${currency})`;
  };

  const formatMWhPrice = (value: number, currency: string = results.currency) => {
    return `$${value.toFixed(2)}/MWh (${currency})`;
  };

  // Prepare chart data
  const chartData = results.monthlyData.map(data => ({
    month: data.month,
    'Energy Price': data.energyPrice,
    'T&D': data.transmissionDistribution,
    'Riders': data.riders,
    'Tax': data.tax,
    'Total': data.total
  }));

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Energy Rate Analysis Results
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <p>Territory: {results.territory.utility} ({results.territory.market})</p>
            <p>Load: {input.contractedLoadMW} MW {input.customerClass}</p>
            <p>Analysis Date: {new Date(results.calculationDate).toLocaleDateString()}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">12-Month Average All-In Price</h3>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(results.averageAllInPrice.centsPerKWh)}
                </div>
                <div className="text-xl text-muted-foreground mt-2">
                  {formatMWhPrice(results.averageAllInPrice.dollarsPerMWh)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Download Options</h3>
              <div className="flex flex-col gap-2">
                <Button onClick={onDownloadCSV} variant="outline" className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Data
                </Button>
                <Button onClick={onDownloadPDF} variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="justify-start">View full breakdown</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Energy Cost Breakdown & Forecast</DialogTitle>
                    </DialogHeader>
                    <EnergyRateDetailsModal
                      results={results}
                      input={input}
                      onDownloadCSV={onDownloadCSV}
                      onDownloadPDF={onDownloadPDF}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed sections moved to modal. Use "View full breakdown" to open. */}
    </div>
  );
}
