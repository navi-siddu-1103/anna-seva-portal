
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Fingerprint, MapPin, Store, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const pathname = usePathname();
    const router = useRouter();
    const role = useMemo(() => pathname.startsWith('/distributor') ? 'distributor' : 'user', [pathname]);
    const isDistributor = role === 'distributor';
  
    const userData = {
      name: 'Card Holder',
      rationCardNumber: 'KA-345-2345678',
      address: '123, 4th Main, 5th Cross, Jayanagar, Bangalore, Karnataka - 560041',
      fps: 'Annapurna Fair Price Shop',
      mobile: '+91 98765 43210'
    };
  
    const distributorData = {
      name: 'Distributor',
      shopName: 'Annapurna Fair Price Shop',
      shopId: 'FPS-101-KA',
      address: '456, Market Road, Shivajinagar, Bangalore, Karnataka - 560001',
      mobile: '+91 87654 32109'
    };

    const displayData = isDistributor ? distributorData : userData;
    const userRole = isDistributor ? 'PDS Distributor' : 'Ration Card Holder';
    const userName = isDistributor ? distributorData.name : userData.name;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center gap-4 mb-8">
                 <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                             <AvatarFallback className="h-full w-full"><User size={40}/></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{userName}</CardTitle>
                            <CardDescription>{userRole}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                        {isDistributor ? (
                            <>
                                <InfoItem icon={Store} label="Shop Name" value={distributorData.shopName} />
                                <InfoItem icon={Fingerprint} label="Shop ID" value={distributorData.shopId} />
                            </>
                        ) : (
                            <InfoItem icon={Fingerprint} label="Ration Card Number" value={userData.rationCardNumber} />
                        )}
                        <InfoItem icon={MapPin} label="Address" value={displayData.address} />
                        <InfoItem icon={Phone} label="Mobile Number" value={displayData.mobile} />
                         {!isDistributor && <InfoItem icon={Store} label="Linked Fair Price Shop" value={userData.fps} />}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}
