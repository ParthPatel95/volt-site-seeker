import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, X, Target } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string, placeId?: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  types?: string;
  acceptCoordinates?: boolean;
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter address or coordinates (lat, lng)...",
  className,
  disabled = false,
  types = 'address',
  acceptCoordinates = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { predictions, isSearching, isGeocoding, searchPlaces, geocodeAddress, clearPredictions } = useGooglePlaces();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to parse coordinates
  const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
    if (!acceptCoordinates) return null;
    
    // Remove whitespace and normalize separators
    const cleaned = input.trim().replace(/\s+/g, '');
    
    // Match various coordinate formats
    const patterns = [
      /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/, // lat,lng
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/, // lat lng
      /^lat:\s*(-?\d+\.?\d*)[,\s]+lng:\s*(-?\d+\.?\d*)$/i, // lat: X, lng: Y
      /^latitude:\s*(-?\d+\.?\d*)[,\s]+longitude:\s*(-?\d+\.?\d*)$/i, // latitude: X, longitude: Y
      /^\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)$/, // (lat,lng)
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedPlace(null);
    
    // Check if input looks like coordinates
    const coordinates = parseCoordinates(newValue);
    if (coordinates) {
      // If valid coordinates detected, use them directly
      onChange(newValue, undefined, coordinates);
      clearPredictions();
      setIsOpen(false);
      return;
    }
    
    if (newValue !== value) {
      onChange(newValue);
    }

    // Only search for places if it's not coordinates and has enough characters
    if (newValue.trim().length >= 2 && !coordinates) {
      await searchPlaces(newValue, types);
      setIsOpen(true);
    } else {
      clearPredictions();
      setIsOpen(false);
    }
  };

  const handlePlaceSelect = async (prediction: any) => {
    setInputValue(prediction.description);
    setSelectedPlace(prediction.place_id);
    setIsOpen(false);
    clearPredictions();

    // Geocode the selected place to get coordinates
    const result = await geocodeAddress(prediction.description, prediction.place_id);
    if (result) {
      onChange(result.formattedAddress, prediction.place_id, result.coordinates);
    } else {
      onChange(prediction.description, prediction.place_id);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedPlace(null);
    onChange('');
    inputRef.current?.focus();
  };

  const handleGeocodeCurrentInput = async () => {
    if (inputValue.trim() && !selectedPlace) {
      const result = await geocodeAddress(inputValue);
      if (result) {
        setInputValue(result.formattedAddress);
        onChange(result.formattedAddress, undefined, result.coordinates);
      }
    }
  };

  // Check if current input is coordinates
  const currentCoordinates = parseCoordinates(inputValue);
  const isCoordinateInput = !!currentCoordinates;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isGeocoding}
          className={cn(
            "pr-20",
            isCoordinateInput && "border-green-500 focus:border-green-600"
          )}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isCoordinateInput && (
            <div className="flex items-center gap-1 mr-1">
              <Target className="w-4 h-4 text-green-600" />
            </div>
          )}
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {inputValue && !selectedPlace && !isCoordinateInput && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGeocodeCurrentInput}
              disabled={isGeocoding}
              className="h-8 w-8 p-0"
              title="Get coordinates"
            >
              {isGeocoding ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Helper text for coordinate formats */}
      {acceptCoordinates && inputValue && !isCoordinateInput && !isOpen && (
        <p className="text-xs text-muted-foreground mt-1">
          💡 You can also enter coordinates directly: 40.7128, -74.0060 or lat: 40.7128, lng: -74.0060
        </p>
      )}

      {/* Coordinate validation feedback */}
      {isCoordinateInput && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <Target className="w-3 h-3" />
          ✓ Valid coordinates detected ({currentCoordinates.lat.toFixed(4)}, {currentCoordinates.lng.toFixed(4)})
        </p>
      )}

      {isOpen && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0 flex items-start gap-3"
                onClick={() => handlePlaceSelect(prediction)}
              >
                <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{prediction.main_text}</p>
                  {prediction.secondary_text && (
                    <p className="text-xs text-muted-foreground">{prediction.secondary_text}</p>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isSearching && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Searching...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};