"use client";

import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Google icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Inner button that has access to GoogleOAuthProvider context
function GoogleLoginButton({ role, redirectTo }: { role: string; redirectTo: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token, role }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Google sign-in failed');

        toast({
          title: '✅ Signed in with Google!',
          description: `Welcome${data.name ? ', ' + data.name : ''}! You are logged in as ${role}.`,
        });
        router.push(redirectTo);
      } catch (err: any) {
        toast({
          title: 'Google Sign-In Failed',
          description: err.message,
          variant: 'destructive',
        });
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      toast({
        title: 'Google Sign-In Cancelled',
        description: 'Sign-in was cancelled or failed. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 font-medium border-2 hover:bg-gray-50 transition-all duration-200"
      onClick={() => {
        setLoading(true);
        login();
      }}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? 'Connecting to Google...' : 'Continue with Google'}
    </Button>
  );
}

// Public wrapper: fetches client ID at runtime → only renders if configured
export function GoogleSignInButton({
  role,
  redirectTo,
}: {
  role: 'cardholder' | 'distributor';
  redirectTo: string;
}) {
  const [clientId, setClientId] = useState<string | null>(null); // null = loading

  useEffect(() => {
    fetch('/api/config/google-client-id')
      .then((r) => r.json())
      .then((d) => setClientId(d.clientId || ''))
      .catch(() => setClientId(''));
  }, []);

  // Still loading or not configured — don't render button
  if (clientId === null || clientId === '') return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLoginButton role={role} redirectTo={redirectTo} />
    </GoogleOAuthProvider>
  );
}
