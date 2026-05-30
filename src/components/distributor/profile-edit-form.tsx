"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';

interface DistributorData {
  ownerName: string;
  shopName: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
}

interface ProfileEditFormProps {
  distributorData: DistributorData;
  onSave: (data: Partial<DistributorData>) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({ distributorData, onSave, onCancel }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ownerName: distributorData.ownerName || '',
    shopName: distributorData.shopName || '',
    licenseNumber: distributorData.licenseNumber || '',
    address: distributorData.address || '',
    phone: distributorData.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ownerName || !formData.shopName || !formData.address || !formData.phone) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/distributor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      onSave(formData);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your shop information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              disabled={loading}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              value={formData.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              disabled={loading}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Shop Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your shop address"
              disabled={loading}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={loading}
              required
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
