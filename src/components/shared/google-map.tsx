"use client";

import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { FPS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Package, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

interface GoogleMapsProps {
  locations: FPS[];
}

// Extend Window type for Google Maps auth failure callback
declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function GoogleMapsComponent({ locations }: GoogleMapsProps) {
  const [selectedLocation, setSelectedLocation] = useState<FPS | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Detect RefererNotAllowedMapError and other auth failures from Google Maps
  useEffect(() => {
    window.gm_authFailure = () => {
      const currentUrl = window.location.origin;
      setAuthError(currentUrl);
      console.error('Google Maps auth failure: RefererNotAllowedMapError for', currentUrl);
    };
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
    setMap(map);
  }, [locations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (stockStatus: string) => {
    if (stockStatus === 'Available') return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    if (stockStatus === 'Limited') return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  // No API key configured
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-lg font-semibold mb-2">Map not configured</p>
          <p className="text-sm text-muted-foreground">
            Add <code className="bg-muted-foreground/20 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  // RefererNotAllowedMapError — API key has HTTP referrer restrictions
  if (authError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-6">
        <div className="text-center max-w-md w-full">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-base font-semibold mb-1 text-destructive">Google Maps: Domain Not Authorized</p>
          <p className="text-sm text-muted-foreground mb-4">
            Your API key doesn't allow requests from <code className="bg-muted px-1 rounded text-xs">{authError}</code>
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-xs space-y-1">
            <p className="font-semibold text-amber-800 mb-2">🔑 Fix in Google Cloud Console:</p>
            <ol className="list-decimal ml-4 space-y-1 text-amber-700">
              <li>Go to <strong>console.cloud.google.com → APIs &amp; Services → Credentials</strong></li>
              <li>Click your <strong>Maps JavaScript API key</strong></li>
              <li>Under <strong>"Application restrictions"</strong>, select <strong>HTTP referrers</strong></li>
              <li>Add these allowed referrers:
                <ul className="list-disc ml-4 mt-1 space-y-0.5 font-mono text-[10px]">
                  <li>http://localhost:9002/*</li>
                  <li>https://anna-seva-portal-1088251282829.asia-south1.run.app/*</li>
                </ul>
              </li>
              <li>Click <strong>Save</strong> and refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Script failed to load entirely (network / billing issue)
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-semibold mb-2 text-destructive">Unable to load Google Maps</p>
          <p className="text-sm text-muted-foreground">
            Ensure the <strong>Maps JavaScript API</strong> is enabled in Google Cloud Console and billing is active.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
      }}
    >
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => setSelectedLocation(location)}
          icon={getMarkerIcon(location.stockStatus)}
          animation={google.maps.Animation.DROP}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedLocation.shopkeeper}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedLocation.hours}
              </p>
              {selectedLocation.address && (
                <p className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{selectedLocation.address}</span>
                </p>
              )}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <Badge
                  variant={
                    selectedLocation.stockStatus === 'Available'
                      ? 'default'
                      : selectedLocation.stockStatus === 'Limited'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className={
                    selectedLocation.stockStatus === 'Available'
                      ? 'bg-green-500'
                      : selectedLocation.stockStatus === 'Limited'
                      ? 'bg-yellow-500'
                      : ''
                  }
                >
                  {selectedLocation.stockStatus}
                </Badge>
              </div>
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => openDirections(selectedLocation.lat, selectedLocation.lng)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
