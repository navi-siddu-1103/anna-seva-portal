"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BuildingIcon, ArrowLeft } from 'lucide-react';

export default function DistributorRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    licenseNumber: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ 
        title: 'Password mismatch', 
        description: 'Passwords do not match', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'distributor',
          shopName: formData.shopName,
          licenseNumber: formData.licenseNumber,
          phone: formData.phone,
          address: formData.address
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      toast({ 
        title: 'Registration successful!', 
        description: 'Your distributor account has been created' 
      });
      router.push('/distributor');
    } catch (err: any) {
      toast({ 
        title: 'Registration failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link href="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Account Selection
          </Button>
        </Link>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-md shadow-2xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/20 rounded-full">
              <BuildingIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Register as Distributor</CardTitle>
          <CardDescription className="text-base">
            Create your Fair Price Shop account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Owner Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter owner's full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Enter Fair Price Shop name"
                value={formData.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">FPS License Number</Label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="Enter FPS license number"
                value={formData.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Shop Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter shop address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90" 
              disabled={loading}
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/distributor/login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-8 text-sm text-muted-foreground">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}
