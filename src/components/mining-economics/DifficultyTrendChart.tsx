import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { TrendingUp, Calendar, Zap, AlertTriangle } from 'lucide-react';

interface DifficultyDataPoint {
  date: string;
  difficulty: number;
  hashrate: number;
  event?: string;
  projected?: boolean;
}

const DifficultyTrendChart = () => {
  const [showProjection, setShowProjection] = useState(true);

  const difficultyData: DifficultyDataPoint[] = [
    { date: "Jan 2020", difficulty: 14.78, hashrate: 106 },
    { date: "Jul 2020", difficulty: 17.35, hashrate: 124 },
    { date: "Jan 2021", difficulty: 20.82, hashrate: 149 },
    { date: "May 2021", difficulty: 25.05, hashrate: 179, event: "China Mining Ban Begins" },
    { date: "Jul 2021", difficulty: 14.36, hashrate: 103, event: "Lowest Post-Ban" },
    { date: "Jan 2022", difficulty: 24.27, hashrate: 174 },
    { date: "Jul 2022", difficulty: 29.57, hashrate: 211 },
    { date: "Jan 2023", difficulty: 37.59, hashrate: 269 },
    { date: "Apr 2024", difficulty: 83.13, hashrate: 595, event: "2024 Halving" },
    { date: "Jul 2024", difficulty: 79.50, hashrate: 569 },
    { date: "Dec 2024", difficulty: 103.92, hashrate: 743 },
    // Projections
    { date: "Jun 2025", difficulty: 130, hashrate: 930, projected: true },
    { date: "Dec 2025", difficulty: 160, hashrate: 1145, projected: true },
    { date: "Jun 2026", difficulty: 195, hashrate: 1395, projected: true },
  ];

  const displayData = showProjection 
    ? difficultyData 
    : difficultyData.filter(d => !d.projected);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold text-foreground mb-1">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Difficulty: <span className="font-semibold text-watt-bitcoin">{data.difficulty.toFixed(2)} T</span>
            </p>
            <p className="text-muted-foreground">
              Hashrate: <span className="font-semibold text-watt-purple">{data.hashrate} EH/s</span>
            </p>
            {data.event && (
              <p className="text-watt-success font-medium mt-2 pt-2 border-t border-border">
                📌 {data.event}
              </p>
            )}
            {data.projected && (
              <p className="text-muted-foreground italic">
                (Projected at ~5%/month growth)
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const events = difficultyData.filter(d => d.event && !d.projected);

  return (
    <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-watt-success" />
            Difficulty Trend Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Historical difficulty with future projections
          </p>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showProjection}
            onChange={(e) => setShowProjection(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Show Projections</span>
        </label>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="difficultyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-muted-foreground"
              label={{ value: 'Difficulty (T)', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Major events reference lines */}
            {events.map((event, idx) => (
              <ReferenceLine 
                key={idx}
                x={event.date} 
                stroke="#22C55E" 
                strokeDasharray="5 5"
                label={{ value: '', position: 'top' }}
              />
            ))}

            <Area
              type="monotone"
              dataKey="difficulty"
              stroke="none"
              fill="url(#difficultyGradient)"
            />
            <Line
              type="monotone"
              dataKey="difficulty"
              stroke="#F7931A"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.event) {
                  return (
                    <circle
                      key={`event-${payload.date}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#22C55E"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }
                if (payload.projected) {
                  return (
                    <circle
                      key={`projected-${payload.date}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#6366F1"
                      stroke="#fff"
                      strokeWidth={2}
                      strokeDasharray="2 2"
                    />
                  );
                }
                return (
                  <circle
                    key={`normal-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#F7931A"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8, fill: '#F7931A', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Event Legend */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-watt-success flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">{event.date}</span>
              <p className="text-muted-foreground">{event.event}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-watt-bitcoin/10 rounded-lg p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-watt-bitcoin flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">7x Growth Since 2020</p>
            <p className="text-sm text-muted-foreground">
              Difficulty increased from 14.78T to 103.92T — a 603% increase in 5 years
            </p>
          </div>
        </div>
        <div className="bg-watt-success/10 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Plan for ~5%/month Growth</p>
            <p className="text-sm text-muted-foreground">
              Financial models should assume continued difficulty increases
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyTrendChart;
