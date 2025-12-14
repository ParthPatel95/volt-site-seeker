import { useMemo } from 'react';

interface LinkEngagementSparklineProps {
  activities: any[];
  height?: number;
  width?: number;
}

export function LinkEngagementSparkline({ 
  activities, 
  height = 24, 
  width = 80 
}: LinkEngagementSparklineProps) {
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) return null;

    // Group activities by day (last 7 days)
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });

    const viewsByDay = days.map(day => {
      return activities.filter(a => 
        new Date(a.opened_at).toDateString() === day
      ).length;
    });

    const max = Math.max(...viewsByDay, 1);
    const points = viewsByDay.map((count, i) => ({
      x: (i / 6) * width,
      y: height - (count / max) * height
    }));

    // Create SVG path
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Create area path
    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    return { pathD, areaD, hasData: viewsByDay.some(v => v > 0) };
  }, [activities, height, width]);

  if (!chartData || !chartData.hasData) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ width, height }}
      >
        No activity
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
    >
      {/* Area fill */}
      <path
        d={chartData.areaD}
        fill="url(#sparklineGradient)"
        opacity={0.3}
      />
      {/* Line */}
      <path
        d={chartData.pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="sparklineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}
