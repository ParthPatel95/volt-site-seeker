import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EnergyRateInput } from './EnergyRateInputTypes';
import type { EnergyRateResults } from './EnergyRateResults';

interface EnergyRateDetailsModalProps {
  results: EnergyRateResults;
  input: EnergyRateInput;
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
}

export function EnergyRateDetailsModal({
  results,
  input,
  onDownloadCSV: _onDownloadCSV,
  onDownloadPDF: _onDownloadPDF,
}: EnergyRateDetailsModalProps) {
  const hasHistory = results.monthlyData.length >= 2;
  const chartData = results.monthlyData.map((data) => ({
    month: data.month,
    'Energy Price': data.energyPrice,
    'T&D': data.transmissionDistribution,
    Riders: data.riders,
    Tax: data.tax,
    Total: data.total,
  }));

  const chartDataDetailed = results.monthlyData.map((d) => ({
    month: d.month,
    'Wholesale Energy': d.wholesaleEnergy ?? Math.max(0, d.energyPrice - (d.retailAdder ?? 0)),
    'Retail Adder': d.retailAdder ?? 0,
    Transmission: d.transmission ?? 0,
    Distribution: d.distribution ?? 0,
    'Demand Charge': d.demandCharge ?? 0,
    Riders: d.riders ?? 0,
    Tax: d.tax ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Rate Calculation Breakdown (averages over 12 months) */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const avg = (selector: (d: any) => number | undefined) => {
              const vals = results.monthlyData
                .map(selector)
                .filter((v): v is number => typeof v === 'number' && !isNaN(v));
              if (!vals.length) return undefined;
              return vals.reduce((a, b) => a + b, 0) / vals.length;
            };
            const breakdown = {
              wholesaleEnergy: avg((d) => d.wholesaleEnergy),
              retailAdder: avg((d) => d.retailAdder),
              transmission: avg((d) => d.transmission),
              distribution: avg((d) => d.distribution),
              demandCharge: avg((d) => d.demandCharge),
              riders: avg((d) => d.riders),
              tax: avg((d) => d.tax),
              total: avg((d) => d.total),
            } as const;
            const rows = [
              { label: 'Wholesale Energy (Pool Price)', value: breakdown.wholesaleEnergy },
              { label: 'Retail Adder', value: breakdown.retailAdder },
              { label: 'Transmission', value: breakdown.transmission },
              { label: 'Distribution (Volumetric Delivery)', value: breakdown.distribution },
              { label: 'Demand Charge (allocated)', value: breakdown.demandCharge },
              { label: 'Riders & Ancillaries', value: breakdown.riders },
              { label: 'Taxes', value: breakdown.tax },
              { label: 'All-In Total', value: breakdown.total },
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
                        <TableCell>
                          {typeof r.value === 'number' ? r.value.toFixed(2) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Live Pool Price */}
      <Card>
        <CardHeader>
          <CardTitle>Live Pool Price</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const latest = results.monthlyData[results.monthlyData.length - 1];
            const live = typeof latest?.wholesaleEnergy === 'number'
              ? latest.wholesaleEnergy
              : Math.max(0, (latest?.energyPrice ?? 0) - (latest?.retailAdder ?? 0));
            return (
              <div className="text-sm">
                Current pool price estimate: <span className="font-semibold">{Number(live).toFixed(2)} ¢/kWh</span>
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
            {hasHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataDetailed}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    label={{
                      value: `¢/kWh (${results.currency})`,
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} ¢/kWh`, '']} />
                  <Legend />
                  <Bar dataKey="Wholesale Energy" stackId="a" fill="#2563eb" />
                  <Bar dataKey="Retail Adder" stackId="a" fill="#60a5fa" />
                  <Bar dataKey="Transmission" stackId="a" fill="#10b981" />
                  <Bar dataKey="Distribution" stackId="a" fill="#34d399" />
                  <Bar dataKey="Demand Charge" stackId="a" fill="#a3e635" />
                  <Bar dataKey="Riders" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Tax" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">Not enough historical data to render a chart.</div>
            )}
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
            {hasHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    label={{
                      value: `¢/kWh (${results.currency})`,
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} ¢/kWh`, '']} />
                  <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">Not enough historical data to render a chart.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projections */}
      {results.forecasts && (
        <Card>
          <CardHeader>
            <CardTitle>Projections (3 Years and 5 Years)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">{results.forecasts.methodology}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">3-Year Projection</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={results.forecasts.threeYear.map((d) => ({ month: d.month, Total: d.total }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" hide={false} />
                      <YAxis
                        label={{
                          value: `¢/kWh (${results.currency})`,
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${Number(value).toFixed(2)} ¢/kWh`, 'Total']}
                      />
                      <Line type="monotone" dataKey="Total" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5-Year Projection</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={results.forecasts.fiveYear.map((d) => ({ month: d.month, Total: d.total }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" hide={false} />
                      <YAxis
                        label={{
                          value: `¢/kWh (${results.currency})`,
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${Number(value).toFixed(2)} ¢/kWh`, 'Total']}
                      />
                      <Line type="monotone" dataKey="Total" stroke="#9333ea" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <TableHead>Wholesale Energy</TableHead>
                  <TableHead>Retail Adder</TableHead>
                  <TableHead>Transmission</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Demand</TableHead>
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
                    <TableCell>{Number(data.wholesaleEnergy ?? Math.max(0, data.energyPrice - (data.retailAdder ?? 0))).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.retailAdder ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.transmission ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.distribution ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.demandCharge ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.riders ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(data.tax ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">{Number(data.total).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">{Number(data.totalMWh).toFixed(2)}</TableCell>
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
