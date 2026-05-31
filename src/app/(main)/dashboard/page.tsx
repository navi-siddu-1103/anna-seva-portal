'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PersonalizedSuggestions from "@/components/dashboard/personalized-suggestions"
import DashboardCards from "@/components/dashboard/dashboard-cards"
import DistributionCycleAnnouncement from "@/components/dashboard/distribution-cycle-announcement"

interface Activity {
  _id: string;
  type: string;
  description: string;
  date: string;
  status: string;
}

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch cardholder's distribution history (most recent activity)
        const response = await fetch('/api/cardholder/distribution-cycles');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cycles && Array.isArray(data.cycles)) {
            // Map distribution cycles to activity format
            const formattedActivities = data.cycles.slice(0, 3).map((cycle: any) => ({
              _id: cycle._id,
              type: 'Distribution',
              description: `Cycle for ${cycle.commodityTypes?.join(', ') || 'Rations'}`,
              date: cycle.cycleStartDate,
              status: 'Completed',
            }));
            setActivities(formattedActivities);
          }
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        // Don't show error to user, just use empty state
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Ration Card Holder Dashboard</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCards />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A log of your recent transactions and bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              )}
              {error && (
                <p className="text-sm text-destructive">Error: {error}</p>
              )}
              {!loading && !error && activities.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
              {!loading && !error && activities.length > 0 && (
                <ul className="space-y-4">
                  {activities.map((activity) => (
                    <li key={activity._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(activity.date)}</p>
                        <Badge variant={activity.status === 'Completed' ? 'secondary' : 'outline'}>{activity.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <DistributionCycleAnnouncement />
          <PersonalizedSuggestions />
        </div>
      </div>
    </div>
  )
}
