import { Button } from '@/components/ui/button';
import { Wheat } from 'lucide-react';
import Link from 'next/link';

export default function SplashPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-body">
      <div className="flex flex-col items-center text-center p-8">
        <div className="p-4 bg-primary/20 rounded-full mb-6">
          <div className="p-3 bg-primary/40 rounded-full">
            <Wheat className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2">
          Anna Seva Portal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Your digital gateway to the Public Distribution System. Fair, transparent, and efficient access to your food entitlements.
        </p>
        <Link href="/login">
          <Button size="lg" className="font-bold text-lg px-10 py-6 bg-accent text-accent-foreground hover:bg-accent/90">
            Proceed to Login
          </Button>
        </Link>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}
