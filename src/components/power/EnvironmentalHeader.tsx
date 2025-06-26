
import React from 'react';

export function EnvironmentalHeader() {
  return (
    <div className="w-full px-2 sm:px-4">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
            Environmental Dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 break-words">
            EPA air quality, NREL solar data, and NOAA weather information
          </p>
        </div>
      </div>
    </div>
  );
}
