
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Fingerprint, MapPin, Store, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DistributorProfilePage() {
    const router = useRouter();
  
    const distributorData = {
      name: 'Distributor',
      shopName: 'Annapurna Fair Price Shop',
      shopId: 'FPS-101-KA',
      address: '456, Market Road, Shivajinagar, Bangalore, Karnataka - 560001',
      mobile: '+91 87654 32109'
    };

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
                            <CardTitle className="text-3xl">{distributorData.name}</CardTitle>
                            <CardDescription>PDS Distributor</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                        <InfoItem icon={Store} label="Shop Name" value={distributorData.shopName} />
                        <InfoItem icon={Fingerprint} label="Shop ID" value={distributorData.shopId} />
                        <InfoItem icon={MapPin} label="Address" value={distributorData.address} />
                        <InfoItem icon={Phone} label="Mobile Number" value={distributorData.mobile} />
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
