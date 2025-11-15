"use client";

import { fpsLocations } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Package, MapPin } from 'lucide-react';
import { GoogleMapsComponent } from '@/components/shared/google-map';

export default function FindFpsPage() {

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Find a Fair Price Shop (FPS)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Nearby FPS Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                <GoogleMapsComponent locations={fpsLocations} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Shop List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fpsLocations.map((fps) => (
                <div key={fps.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {fps.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {fps.shopkeeper}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {fps.hours}
                      </p>
                    </div>
                  </div>
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
