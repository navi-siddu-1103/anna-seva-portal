"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WheatIcon } from '@/components/icons';
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Redirect countdown after success
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => router.push('/login'), 4000);
      return () => clearTimeout(timer);
    }
  }, [done, router]);

  // No token in URL
  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl text-destructive">Invalid Link</CardTitle>
          <CardDescription className="text-base mt-2">
            This reset link is missing or invalid. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Request New Reset Link
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (p: string) => {
    if (p.length === 0) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: '50%' };
    if (p.match(/[A-Z]/) && p.match(/[0-9]/)) return { label: 'Strong', color: 'bg-green-500', width: '100%' };
    return { label: 'Medium', color: 'bg-yellow-500', width: '75%' };
  };

  const strength = passwordStrength(password);

  return (
    <Card className="w-full max-w-md shadow-2xl animate-slide-up">
      {!done ? (
        <>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <KeyRound className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="font-headline text-2xl">Set New Password</CardTitle>
            <CardDescription className="text-base">
              Enter a strong new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {strength && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Strength: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && (
                  <p className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary underline">
                Request a new reset link
              </Link>
            </div>
          </CardContent>
        </>
      ) : (
        /* Success state */
        <>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="font-headline text-2xl text-green-700">Password Reset!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You'll be redirected to the login page in a few seconds…
            </p>
            <Link href="/login">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Go to Login Now
              </Button>
            </Link>
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link href="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-6">
        <div className="p-3 bg-primary/20 rounded-full inline-block mb-3">
          <div className="p-2 bg-primary/40 rounded-full">
            <WheatIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      <Suspense fallback={
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>

      <footer className="mt-8 text-sm text-muted-foreground">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}
