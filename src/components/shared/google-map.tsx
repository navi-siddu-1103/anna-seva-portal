"use client";

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { FPS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Package, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (Bangalore coordinates as fallback)
const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

interface GoogleMapsProps {
  locations: FPS[];
}

export function GoogleMapsComponent({ locations }: GoogleMapsProps) {
  const [selectedLocation, setSelectedLocation] = useState<FPS | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Use environment variable for API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // Calculate bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach((location) => {
      bounds.extend({ lat: location.lat, lng: location.lng });
    });
    map.fitBounds(bounds);
    setMap(map);
  }, [locations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (stockStatus: string) => {
    // Different colors for different stock statuses
    if (stockStatus === 'Available') {
      return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (stockStatus === 'Limited') {
      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else {
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold mb-2 text-destructive">Unable to load map</p>
          <p className="text-sm text-muted-foreground mb-4">
            {apiKey 
              ? 'Google Maps requires billing to be enabled in Google Cloud Console.' 
              : 'Google Maps API key is not configured.'}
          </p>
          {apiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-xs">
              <p className="font-semibold mb-2">💳 Billing Not Enabled</p>
              <p className="mb-2">Google Maps requires a billing account (first $200/month is FREE).</p>
              <p className="mb-2"><strong>To fix:</strong></p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Go to Google Cloud Console</li>
                <li>Enable billing for your project</li>
                <li>Link your billing account</li>
                <li>Refresh this page</li>
              </ol>
              <p className="mt-2 text-blue-600">
                See <strong>GOOGLE_MAPS_BILLING.md</strong> for detailed instructions
              </p>
            </div>
          )}
          {!apiKey && (
            <p className="text-xs text-muted-foreground mt-4">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="animate-pulse">
          <p className="text-lg font-semibold">Loading map...</p>
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
