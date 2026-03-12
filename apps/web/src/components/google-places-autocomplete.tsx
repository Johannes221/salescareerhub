'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';

let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  if (!GOOGLE_PLACES_API_KEY) {
    return Promise.reject(new Error('Google Places API Key not configured'));
  }

  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    if ((window as any).google?.maps?.places) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=de`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Stadt eingeben...',
  className = '',
}: GooglePlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const autocompleteServiceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY) return;

    loadGoogleMapsScript()
      .then(() => {
        autocompleteServiceRef.current =
          new (window as any).google.maps.places.AutocompleteService();
        setIsLoaded(true);
      })
      .catch(() => {
        // Silently fail if Google Maps can't load
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteServiceRef.current || input.length < 2) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          types: ['(cities)'],
          componentRestrictions: { country: ['de', 'at', 'ch'] },
        },
        (results: PlacePrediction[] | null, status: string) => {
          if (status === 'OK' && results) {
            setPredictions(results.slice(0, 5));
            setIsOpen(true);
            setHighlightIndex(-1);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        },
      );
    },
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    onChange(prediction.structured_formatting.main_text);
    onPlaceSelect?.({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    });
    setPredictions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Fallback to plain input if no API key
  if (!GOOGLE_PLACES_API_KEY) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
          autoComplete="off"
        />
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                index === highlightIndex
                  ? 'bg-primary/5 text-primary'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(prediction)}
              onMouseEnter={() => setHighlightIndex(index)}
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <span className="font-medium">
                  {prediction.structured_formatting.main_text}
                </span>
                <span className="ml-1 text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
