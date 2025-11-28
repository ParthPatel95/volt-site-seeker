import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  dateRange?: { start: Date; end: Date };
  priceRange?: { min: number; max: number };
  selectedHours?: number[];
  selectedDays?: number[];
}

interface DashboardFilterContextType {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

const DashboardFilterContext = createContext<DashboardFilterContextType | undefined>(undefined);

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({});

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <DashboardFilterContext.Provider value={{ filters, updateFilters, clearFilters }}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilters() {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  }
  return context;
}
