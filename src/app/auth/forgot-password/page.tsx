"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WheatIcon } from '@/components/icons';
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSent(true);
    } catch (err: any) {
      setError(err.message);
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
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="p-3 bg-primary/20 rounded-full inline-block mb-3">
          <div className="p-2 bg-primary/40 rounded-full">
            <WheatIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl animate-slide-up">
        {!sent ? (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Mail className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardTitle className="font-headline text-2xl">Forgot Password?</CardTitle>
              <CardDescription className="text-base">
                Enter your registered email address. We'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {error}
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
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Remembered your password?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Back to Login
                  </Link>
                </p>
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
              <CardTitle className="font-headline text-2xl text-green-700">Email Sent!</CardTitle>
              <CardDescription className="text-base mt-2">
                We've sent a password reset link to:
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-muted rounded-lg p-3 font-medium text-sm break-all">
                {email}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Check your inbox and click the reset link. The link will expire in <strong>1 hour</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSent(false); setError(''); }}
                  className="text-primary underline hover:no-underline font-medium"
                >
                  try again
                </button>
                .
              </p>
              <Link href="/login">
                <Button className="w-full mt-2" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </>
        )}
      </Card>

      <footer className="mt-8 text-sm text-muted-foreground">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}
