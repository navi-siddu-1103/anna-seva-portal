"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WheatIcon } from '@/components/icons';
import { UserIcon, BuildingIcon } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="p-4 bg-primary/20 rounded-full inline-block mb-4 transform transition-transform duration-500 hover:scale-105">
          <div className="p-3 bg-primary/40 rounded-full">
            <WheatIcon className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
          Choose Your Account Type
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select how you want to access the Anna Seva Portal
        </p>
      </div>

      {/* Two Card Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl animate-slide-up [animation-delay:200ms]">
        {/* Cardholder Container */}
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-accent/20 rounded-full">
                <UserIcon className="w-16 h-16 text-accent" />
              </div>
            </div>
            <CardTitle className="font-headline text-3xl text-accent">Cardholder</CardTitle>
            <CardDescription className="text-base mt-2">
              Access your ration card, book tokens, and manage your food entitlements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="text-sm text-muted-foreground mb-4 text-center">
              For ration card holders and beneficiaries
            </div>
            <Link href="/auth/cardholder/login" className="block">
              <Button className="w-full h-12 text-lg bg-accent hover:bg-accent/90" size="lg">
                Login as Cardholder
              </Button>
            </Link>
            <Link href="/auth/cardholder/register" className="block">
              <Button className="w-full h-12 text-lg" variant="outline" size="lg">
                Register as Cardholder
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Distributor Container */}
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/20 rounded-full">
                <BuildingIcon className="w-16 h-16 text-primary" />
              </div>
            </div>
            <CardTitle className="font-headline text-3xl text-primary">Distributor</CardTitle>
            <CardDescription className="text-base mt-2">
              Manage Fair Price Shop, stock inventory, and serve cardholders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="text-sm text-muted-foreground mb-4 text-center">
              For Fair Price Shop owners and operators
            </div>
            <Link href="/auth/distributor/login" className="block">
              <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90" size="lg">
                Login as Distributor
              </Button>
            </Link>
            <Link href="/auth/distributor/register" className="block">
              <Button className="w-full h-12 text-lg" variant="outline" size="lg">
                Register as Distributor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-muted-foreground animate-fade-in [animation-delay:400ms]">
        Anna Seva Portal | A Digital India Initiative
      </footer>
    </div>
  );
}
