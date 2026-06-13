"use client";

import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { FPS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Package, Navigation, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 12.9716, lng: 77.5946 };

interface GoogleMapsProps {
  locations: FPS[];
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

// ─── Loading spinner UI ───────────────────────────────────────────────────────
function MapLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  );
}

// ─── Error UI ─────────────────────────────────────────────────────────────────
function MapError({ title, message }: { title: string; message: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        <p className="text-lg font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// ─── Inner map component — only rendered once we have a valid API key ─────────
// This ensures useJsApiLoader is NEVER called with an empty string.
function GoogleMapInner({
  apiKey,
  locations,
}: {
  apiKey: string;
  locations: FPS[];
}) {
  const [selectedLocation, setSelectedLocation] = useState<FPS | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Detect RefererNotAllowedMapError
  useEffect(() => {
    window.gm_authFailure = () => setAuthError(window.location.origin);
    return () => { delete window.gm_authFailure; };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,       // always a non-empty, valid key here
  });

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (locations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }));
        map.fitBounds(bounds);
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    },
    [locations],
  );

  // Must be defined at top level — NOT inside JSX
  const onUnmount = useCallback(() => {}, []);

  const openDirections = (lat: number, lng: number) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');

  const getMarkerIcon = (status: string) => {
    if (status === 'Available') return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    if (status === 'Limited')   return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-6">
        <div className="text-center max-w-md w-full">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-base font-semibold mb-1 text-destructive">Google Maps: Domain Not Authorized</p>
          <p className="text-sm text-muted-foreground mb-4">
            API key doesn't allow requests from{' '}
            <code className="bg-muted px-1 rounded text-xs">{authError}</code>
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-xs">
            <p className="font-semibold text-amber-800 mb-2">🔑 Fix in Google Cloud Console:</p>
            <ol className="list-decimal ml-4 space-y-1 text-amber-700">
              <li>APIs &amp; Services → Credentials → Edit Maps API key</li>
              <li>Add HTTP referrers:
                <ul className="list-disc ml-4 mt-1 font-mono text-[10px]">
                  <li>http://localhost:9002/*</li>
                  <li>https://anna-seva-portal-1088251282829.asia-south1.run.app/*</li>
                </ul>
              </li>
              <li>Save &amp; refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) return <MapError title="Unable to load Google Maps" message="Ensure Maps JavaScript API is enabled and billing is active in Google Cloud Console." />;
  if (!isLoaded)  return <MapLoading />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: true, mapTypeControl: true, fullscreenControl: true, zoomControl: true, gestureHandling: 'cooperative' }}
    >
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          onClick={() => setSelectedLocation(loc)}
          icon={getMarkerIcon(loc.stockStatus)}
          animation={google.maps.Animation.DROP}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-base mb-2">{selectedLocation.name}</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><User className="w-4 h-4" />{selectedLocation.shopkeeper}</p>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4" />{selectedLocation.hours}</p>
              {selectedLocation.address && (
                <p className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{selectedLocation.address}</span>
                </p>
              )}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <Badge
                  variant={selectedLocation.stockStatus === 'Available' ? 'default' : selectedLocation.stockStatus === 'Limited' ? 'secondary' : 'destructive'}
                  className={selectedLocation.stockStatus === 'Available' ? 'bg-green-500' : selectedLocation.stockStatus === 'Limited' ? 'bg-yellow-500' : ''}
                >
                  {selectedLocation.stockStatus}
                </Badge>
              </div>
              <Button size="sm" className="w-full mt-2" onClick={() => openDirections(selectedLocation.lat, selectedLocation.lng)}>
                <Navigation className="w-4 h-4 mr-2" />Get Directions
              </Button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

// ─── Public wrapper — fetches key first, renders inner map only when ready ────
export function GoogleMapsComponent({ locations }: GoogleMapsProps) {
  // null = still loading, '' = key missing, anything else = valid key
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config/maps-key')
      .then((r) => r.json())
      .then((d) => setApiKey(d.googleMapsApiKey || ''))
      .catch(() => setApiKey(''));
  }, []);

  // Still fetching key from server
  if (apiKey === null) return <MapLoading />;

  // Key not configured in environment
  if (apiKey === '') {
    return (
      <MapError
        title="Map not configured"
        message={
          <>
            Add <code className="bg-muted-foreground/20 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
            your Cloud Run environment variables and redeploy.
          </>
        }
      />
    );
  }

  // Key is ready — render the actual map (useJsApiLoader runs with a valid key)
  return <GoogleMapInner apiKey={apiKey} locations={locations} />;
}
