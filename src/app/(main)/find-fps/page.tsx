"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Package, MapPin, Loader2, Info } from 'lucide-react';
import { GoogleMapsComponent } from '@/components/shared/google-map';
import type { FPS } from '@/lib/types';
import { fpsLocations as staticFpsLocations } from '@/lib/data';

export default function FindFpsPage() {
  const [fpsLocations, setFpsLocations] = useState<FPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingStaticData, setUsingStaticData] = useState(false);

  useEffect(() => {
    const fetchFpsLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fps/list');

        if (!response.ok) {
          throw new Error('API error');
        }

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setFpsLocations(data.data);
          setUsingStaticData(false);
        } else {
          // API returned empty — show static demo shops
          setFpsLocations(staticFpsLocations);
          setUsingStaticData(true);
        }
      } catch (err: any) {
        console.error('Error fetching FPS locations:', err);
        // Fall back to static demo data on any error
        setFpsLocations(staticFpsLocations);
        setUsingStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFpsLocations();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Find a Fair Price Shop (FPS)</h1>

      {usingStaticData && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          <Info className="w-4 h-4 shrink-0" />
          <span>Showing demo shop locations. Register as a distributor to add your real shop.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Nearby FPS Locations ({fpsLocations.length} shops)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <GoogleMapsComponent locations={fpsLocations} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shop List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Shop List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[540px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : fpsLocations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No FPS shops available</p>
              ) : (
                fpsLocations.map((fps) => (
                  <div
                    key={fps.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Shop Name */}
                        <h3 className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          {fps.name}
                        </h3>

                        {/* Shopkeeper */}
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <User className="w-3 h-3 shrink-0" />
                          {fps.shopkeeper}
                        </p>

                        {/* Hours */}
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3 shrink-0" />
                          {fps.hours}
                        </p>

                        {/* Address (shown when available from registered distributor) */}
                        {fps.address && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-start gap-2">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{fps.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="flex items-center gap-2 mt-3">
                      <Package className="w-4 h-4" />
                      <Badge
                        variant={
                          fps.stockStatus === 'Available'
                            ? 'default'
                            : fps.stockStatus === 'Limited'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={
                          fps.stockStatus === 'Available'
                            ? 'bg-green-500'
                            : fps.stockStatus === 'Limited'
                            ? 'bg-yellow-500'
                            : ''
                        }
                      >
                        {fps.stockStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
