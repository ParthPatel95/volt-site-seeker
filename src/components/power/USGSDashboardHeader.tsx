
import React from 'react';

export function USGSDashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">USGS Data Dashboard</h2>
        <p className="text-muted-foreground">U.S. Geological Survey elevation, land use, and geological data</p>
      </div>
    </div>
  );
}
