'use client';

import { useState, useEffect } from 'react';
import { WheatIcon } from '@/components/icons';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center justify-center text-center">
        {/* Animated Logo */}
        <div className={`relative mb-8 transition-all duration-1000 ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className={`absolute inset-0 rounded-full bg-primary/20 transition-all duration-1000 ${animationPhase >= 1 ? 'animate-pulse' : ''}`} />
          <div className="relative p-6 bg-primary/20 rounded-full">
            <div className="p-4 bg-primary/40 rounded-full">
              <WheatIcon className={`w-20 h-20 text-primary transition-transform duration-1000 ${animationPhase >= 1 ? 'rotate-0' : '-rotate-180'}`} />
            </div>
          </div>
        </div>

        {/* Animated Title */}
        <h1 className={`font-headline text-4xl md:text-6xl font-bold text-primary mb-4 transition-all duration-1000 delay-300 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          Anna Seva Portal
        </h1>

        {/* Animated Subtitle */}
        <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          Digitizing Public Distribution System
        </p>

        {/* Loading Animation */}
        <div className={`transition-all duration-1000 delay-700 ${animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">Initializing...</p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className={`absolute bottom-8 text-sm text-muted-foreground transition-all duration-1000 delay-1000 ${animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        A Digital India Initiative
      </div>
    </div>
  );
}