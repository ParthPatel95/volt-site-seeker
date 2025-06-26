
import { useState, useEffect } from 'react';
import { StoredCalculation, BTCROIFormData, BTCNetworkData, HostingROIResults, BTCROIResults } from '../types/btc_roi_types';

export interface UseStoredCalculationsReturn {
  storedCalculations: StoredCalculation[];
  saveCalculation: (
    calculationType: 'hosting' | 'self',
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    results: HostingROIResults | BTCROIResults,
    siteName?: string
  ) => void;
  deleteCalculation: (id: string) => void;
  clearAllCalculations: () => void;
  generateSiteName: () => string;
}

const STORAGE_KEY = 'btc_roi_calculations';

export const useStoredCalculations = (): UseStoredCalculationsReturn => {
  const [storedCalculations, setStoredCalculations] = useState<StoredCalculation[]>([]);

  // Load calculations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const calculations = parsed.map((calc: any) => ({
          ...calc,
          timestamp: new Date(calc.timestamp),
          networkData: {
            ...calc.networkData,
            lastUpdate: new Date(calc.networkData.lastUpdate)
          }
        }));
        setStoredCalculations(calculations);
      }
    } catch (error) {
      console.error('Error loading stored calculations:', error);
    }
  }, []);

  // Save calculations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCalculations));
    } catch (error) {
      console.error('Error saving calculations:', error);
    }
  }, [storedCalculations]);

  const generateSiteName = (): string => {
    const existingNames = storedCalculations
      .map(calc => calc.siteName)
      .filter(name => name.startsWith('Wattbyte Campus '));
    
    let counter = 1;
    let newName = `Wattbyte Campus ${counter}`;
    
    while (existingNames.includes(newName)) {
      counter++;
      newName = `Wattbyte Campus ${counter}`;
    }
    
    return newName;
  };

  const saveCalculation = (
    calculationType: 'hosting' | 'self',
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    results: HostingROIResults | BTCROIResults,
    siteName?: string
  ) => {
    const finalSiteName = siteName?.trim() || generateSiteName();
    
    const newCalculation: StoredCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      siteName: finalSiteName,
      calculationType,
      formData: { ...formData },
      networkData: { ...networkData },
      results: { ...results },
      timestamp: new Date()
    };

    setStoredCalculations(prev => [newCalculation, ...prev]);
  };

  const deleteCalculation = (id: string) => {
    setStoredCalculations(prev => prev.filter(calc => calc.id !== id));
  };

  const clearAllCalculations = () => {
    setStoredCalculations([]);
  };

  return {
    storedCalculations,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations,
    generateSiteName
  };
};
