
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EnergyRateInput } from './EnergyRateInputTypes';

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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Calculation Breakdown (averages over 12 months) */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const avg = (selector: (d: any) => number | undefined) => {
              const vals = results.monthlyData.map(selector).filter((v): v is number => typeof v === 'number' && !isNaN(v));
              if (!vals.length) return undefined;
              return vals.reduce((a, b) => a + b, 0) / vals.length;
            };
            const breakdown = {
              wholesaleEnergy: avg(d => d.wholesaleEnergy),
              retailAdder: avg(d => d.retailAdder),
              transmission: avg(d => d.transmission),
              distribution: avg(d => d.distribution),
              demandCharge: avg(d => d.demandCharge),
              riders: avg(d => d.riders),
              tax: avg(d => d.tax),
              total: avg(d => d.total)
            } as const;
            const rows = [
              { label: 'Wholesale Energy (Pool Price)', value: breakdown.wholesaleEnergy },
              { label: 'Retail Adder', value: breakdown.retailAdder },
              { label: 'Transmission', value: breakdown.transmission },
              { label: 'Distribution (Volumetric Delivery)', value: breakdown.distribution },
              { label: 'Demand Charge (allocated)', value: breakdown.demandCharge },
              { label: 'Riders & Ancillaries', value: breakdown.riders },
              { label: 'Taxes', value: breakdown.tax },
              { label: 'All-In Total', value: breakdown.total }
            ];
            return (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Average (¢/kWh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{r.label}</TableCell>
                        <TableCell>{typeof r.value === 'number' ? r.value.toFixed(2) : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Monthly Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: `¢/kWh (${results.currency})`, angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ¢/kWh`, '']} />
                <Legend />
                <Bar dataKey="Energy Price" stackId="a" fill="#3b82f6" />
                <Bar dataKey="T&D" stackId="a" fill="#10b981" />
                <Bar dataKey="Riders" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Tax" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly All-In Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: `¢/kWh (${results.currency})`, angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ¢/kWh`, '']} />
                <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Rate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Energy Price</TableHead>
                  <TableHead>T&D</TableHead>
                  <TableHead>Riders</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total (¢/kWh)</TableHead>
                  <TableHead>Total ($/MWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.monthlyData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell>{data.energyPrice.toFixed(2)}</TableCell>
                    <TableCell>{data.transmissionDistribution.toFixed(2)}</TableCell>
                    <TableCell>{data.riders.toFixed(2)}</TableCell>
                    <TableCell>{data.tax.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">{data.total.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">{data.totalMWh.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.dataSourceUrls.map((url, index) => (
              <a 
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                {url}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
