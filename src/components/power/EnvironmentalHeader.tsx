
import React from 'react';

export function EnvironmentalHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Environmental Dashboard</h2>
        <p className="text-muted-foreground">EPA air quality, NREL solar data, and NOAA weather information</p>
      </div>
    </div>
  );
}
