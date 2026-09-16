'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WheatIcon } from '@/components/icons';
import SplashScreen from '@/components/shared/splash-screen';

function MainContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-body animate-fade-in">
      <div className="flex flex-col items-center text-center p-8">
        <div className="p-4 bg-primary/20 rounded-full mb-6 transform transition-transform duration-500 hover:scale-105">
          <div className="p-3 bg-primary/40 rounded-full">
            <WheatIcon className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2 animate-slide-up">
          Anna Seva Portal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-slide-up [animation-delay:200ms]">
          Your digital gateway to the Public Distribution System. Fair, transparent, and efficient access to your food entitlements.
        </p>
        <Link href="/login" className="animate-slide-up [animation-delay:400ms]">
          <Button size="lg" className="font-bold text-lg px-10 py-6 bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:scale-105">
            Proceed to Login
          </Button>
        </Link>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground animate-fade-in [animation-delay:600ms]">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && <MainContent />}
    </>
  );
}
