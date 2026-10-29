
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Fingerprint, MapPin, Store, Phone, ArrowLeft, Loader2, Edit, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProfileEditForm from '@/components/distributor/profile-edit-form';

interface DistributorData {
  ownerName: string;
  shopName: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  status?: string;
}

interface PendingChangeRequest {
  requestedChanges: Record<string, string>;
  requestedAt: string;
}

export default function DistributorProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [distributorData, setDistributorData] = useState<DistributorData | null>(null);
    const [pendingChangeRequest, setPendingChangeRequest] = useState<PendingChangeRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchDistributorProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/distributor/profile');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch profile');
                }
                
                const data = await response.json();
                if (data.success) {
                    setDistributorData(data.data);
                    setPendingChangeRequest(data.pendingChangeRequest ?? null);
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

        fetchDistributorProfile();
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

    if (error || !distributorData) {
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

    if (isEditing && distributorData) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Edit Profile</h1>
                </div>
                <div className="max-w-2xl mx-auto">
                    <ProfileEditForm 
                        distributorData={distributorData}
                        onSave={(data) => {
                            // Changes are now sent as a change request — refresh profile to show pending banner
                            setIsEditing(false);
                            window.location.reload();
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
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

            {/* Pending change request banner */}
            {pendingChangeRequest && (
                <div className="max-w-2xl mx-auto mb-4 flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-sm">Profile update pending admin review</p>
                        <p className="text-xs mt-0.5 text-orange-700">
                            Your changes have been submitted and will be applied once approved by the admin.
                            Submitted on {new Date(pendingChangeRequest.requestedAt).toLocaleDateString('en-IN')}.
                        </p>
                    </div>
                </div>
            )}

            {/* Account status banner for pending distributors */}
            {distributorData?.status === 'pending' && (
                <div className="max-w-2xl mx-auto mb-4 flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-sm">Account pending approval</p>
                        <p className="text-xs mt-0.5 text-yellow-700">
                            Your shop is not yet visible to cardholders. Please wait for admin approval.
                        </p>
                    </div>
                </div>
            )}

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                 <AvatarFallback className="h-full w-full"><User size={40}/></AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{distributorData?.ownerName}</CardTitle>
                                <CardDescription>PDS Distributor</CardDescription>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(true)}
                            className="gap-2"
                            disabled={!!pendingChangeRequest}
                            title={pendingChangeRequest ? 'A change request is already pending review' : 'Edit profile'}
                        >
                            <Edit className="h-4 w-4" />
                            {pendingChangeRequest ? 'Changes Pending' : 'Edit'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                        <InfoItem icon={Store} label="Shop Name" value={distributorData?.shopName || 'N/A'} />
                        <InfoItem icon={Fingerprint} label="License Number" value={distributorData?.licenseNumber || 'N/A'} />
                        <InfoItem icon={MapPin} label="Address" value={distributorData?.address || 'N/A'} />
                        <InfoItem icon={Phone} label="Mobile Number" value={distributorData?.phone || 'N/A'} />
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

