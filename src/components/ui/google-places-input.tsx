import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, X } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string, placeId?: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  types?: string;
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter address...",
  className,
  disabled = false,
  types = 'address'
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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedPlace(null);
    
    if (newValue !== value) {
      onChange(newValue);
    }

    if (newValue.trim().length >= 2) {
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
          className="pr-20"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
          {inputValue && !selectedPlace && (
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