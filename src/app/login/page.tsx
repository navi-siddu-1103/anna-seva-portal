"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WheatIcon } from '@/components/icons';
import { Fingerprint, Store } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'user' | 'distributor') => {
    if (role === 'user') {
      router.push('/dashboard');
    } else {
      router.push('/distributor');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WheatIcon className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Anna Seva Portal</CardTitle>
          <CardDescription>
            Securely access your PDS account. Please select your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Authentication via Aadhaar & OTP
          </div>
          <Button
            onClick={() => handleLogin('user')}
            className="w-full h-14 text-lg"
            variant="outline"
          >
            <Fingerprint className="mr-2" />
            Login as Card Holder
          </Button>
          <Button
            onClick={() => handleLogin('distributor')}
            className="w-full h-14 text-lg"
            variant="secondary"
          >
            <Store className="mr-2" />
            Login as Distributor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
