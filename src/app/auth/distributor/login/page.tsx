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

export default function DistributorLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'distributor' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      toast({ 
        title: 'Welcome back!', 
        description: 'Successfully logged in as Distributor' 
      });
      router.push('/distributor');
    } catch (err: any) {
      toast({ 
        title: 'Login failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link href="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Account Selection
          </Button>
        </Link>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/20 rounded-full">
              <BuildingIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Distributor Login</CardTitle>
          <CardDescription className="text-base">
            Manage your Fair Price Shop operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/distributor/register" className="text-primary font-semibold hover:underline">
                Register as Distributor
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
