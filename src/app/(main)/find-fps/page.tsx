import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fpsLocations } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Clock, Package } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function FindFpsPage() {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'fps-map');

  // Approximate positions for markers on the static image
  const markerPositions = [
    { top: '30%', left: '40%' },
    { top: '50%', left: '60%' },
    { top: '65%', left: '25%' },
  ];

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
              <div className="relative aspect-[4/3] w-full">
                {mapImage && (
                  <Image
                    src={mapImage.imageUrl}
                    alt="Map of FPS locations"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                    data-ai-hint={mapImage.imageHint}
                  />
                )}
                {fpsLocations.map((fps, index) => (
                   <Popover key={fps.id}>
                    <PopoverTrigger asChild>
                      <button
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={markerPositions[index]}
                        aria-label={`Location of ${fps.name}`}
                      >
                        <MapPin className="w-8 h-8 text-destructive drop-shadow-lg animate-bounce" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <h4 className="font-bold">{fps.name}</h4>
                        <p className="text-sm flex items-center gap-2"><User className="w-4 h-4"/>{fps.shopkeeper}</p>
                        <p className="text-sm flex items-center gap-2"><Clock className="w-4 h-4"/>{fps.hours}</p>
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <Badge variant={fps.stockStatus === 'Available' ? 'default' : 'destructive'} className={fps.stockStatus === 'Available' ? 'bg-green-500' : 'bg-yellow-500'}>{fps.stockStatus}</Badge>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
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
                <div key={fps.id} className="p-4 border rounded-lg hover:bg-muted/50">
                  <h3 className="font-semibold">{fps.name}</h3>
                  <p className="text-sm text-muted-foreground">{fps.shopkeeper}</p>
                   <div className="flex items-center gap-2 mt-2">
                        <Badge variant={fps.stockStatus === 'Available' ? 'default' : fps.stockStatus === 'Limited' ? 'secondary' : 'destructive'}>
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
