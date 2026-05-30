"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell, Loader2 } from 'lucide-react';

interface DistributionCycle {
  _id: string;
  distributorName: string;
  cycleStartDate: string;
  description?: string;
  announcementDate: string;
}

export default function DistributionCycleAnnouncement() {
  const [cycle, setCycle] = useState<DistributionCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestCycle = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cardholder/distribution-cycles');
        
        if (!response.ok) {
          throw new Error('Failed to fetch distribution cycles');
        }
        
        const data = await response.json();
        if (data.success && data.latest) {
          setCycle(data.latest);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching distribution cycle:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCycle();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Next Distribution Cycle
          </CardTitle>
          <CardDescription>Latest announcement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !cycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Next Distribution Cycle
          </CardTitle>
          <CardDescription>Latest announcement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No distribution cycle announced yet</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Next Distribution Cycle
          </CardTitle>
          <Badge variant="default" className="bg-green-600">Announced</Badge>
        </div>
        <CardDescription>New distribution cycle from {cycle.distributorName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Distribution Start Date</p>
          <p className="text-lg font-semibold">{formatDate(cycle.cycleStartDate)}</p>
        </div>
        {cycle.description && (
          <div>
            <p className="text-sm text-muted-foreground">Details</p>
            <p className="text-sm">{cycle.description}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">
            Announced on {formatDate(cycle.announcementDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
