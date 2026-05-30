
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Fingerprint, MapPin, Store, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CardholderData {
  name: string;
  cardNumber: string;
  phone: string;
  address?: string;
  email: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [cardholderData, setCardholderData] = useState<CardholderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCardholderProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/cardholder/profile');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch profile');
                }
                
                const data = await response.json();
                if (data.success) {
                    setCardholderData(data.data);
                    setError(null);
                } else {
                    throw new Error('Failed to fetch profile');
                }
            } catch (err: any) {
                const message = err.message || 'An error occurred';
                setError(message);
                toast({
                    title: 'Error',
                    description: message,
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCardholderProfile();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !cardholderData) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
                </div>
                <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error || 'Failed to load profile'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            <CardTitle className="text-3xl">{cardholderData.name}</CardTitle>
                            <CardDescription>Ration Card Holder</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                        <InfoItem icon={Fingerprint} label="Ration Card Number" value={cardholderData.cardNumber} />
                        {cardholderData.address && <InfoItem icon={MapPin} label="Address" value={cardholderData.address} />}
                        <InfoItem icon={Phone} label="Mobile Number" value={cardholderData.phone} />
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
