import React from 'react';
import { ZoomLevel } from '../types/voltbuild-timeline.types';

interface TimelineUnit {
  date: Date;
  label: string;
  subLabel?: string;
  isToday: boolean;
  width: number;
}

interface TimelineGridProps {
  units: TimelineUnit[];
  totalWidth: number;
  todayPosition: number;
  zoomLevel: ZoomLevel;
}

export function TimelineGrid({ 
  units, 
  totalWidth, 
  todayPosition,
  zoomLevel,
}: TimelineGridProps) {
  return (
    <div className="relative" style={{ width: totalWidth, minWidth: '100%' }}>
      {/* Date Headers */}
      <div className="flex border-b border-border sticky top-0 bg-background z-10">
        {units.map((unit, index) => (
          <div
            key={index}
            className={`flex-shrink-0 border-r border-border/50 py-2 px-1 text-center ${
              unit.isToday ? 'bg-primary/10' : ''
            }`}
            style={{ width: unit.width }}
          >
            <div className={`text-xs font-medium ${unit.isToday ? 'text-primary' : 'text-foreground'}`}>
              {unit.label}
            </div>
            {unit.subLabel && (
              <div className="text-[10px] text-muted-foreground">
                {unit.subLabel}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 top-[52px] pointer-events-none">
        {units.map((unit, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 border-r border-border/20"
            style={{ left: (index + 1) * unit.width }}
          />
        ))}
      </div>

      {/* Today Marker */}
      {todayPosition >= 0 && todayPosition <= totalWidth && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
          style={{ left: todayPosition }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm font-medium whitespace-nowrap">
            Today
          </div>
        </div>
      )}
    </div>
  );
}
