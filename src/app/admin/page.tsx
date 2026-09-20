'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Users, Clock, FileCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  totalDistributors: number;
  pendingDistributors: number;
  totalCardholders: number;
  pendingChangeRequests: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Total Distributors',
      value: stats?.totalDistributors,
      icon: Store,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/distributors',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingDistributors,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/admin/distributors?tab=pending',
      urgent: (stats?.pendingDistributors ?? 0) > 0,
    },
    {
      title: 'Total Cardholders',
      value: stats?.totalCardholders,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/admin/cardholders',
    },
    {
      title: 'Pending Change Requests',
      value: stats?.pendingChangeRequests,
      icon: FileCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/change-requests',
      urgent: (stats?.pendingChangeRequests ?? 0) > 0,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage distributors, cardholders, and profile change requests.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${card.urgent ? 'border-orange-300 ring-1 ring-orange-200' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${card.urgent ? 'text-orange-600' : ''}`}>
                    {card.value ?? '—'}
                  </div>
                  {card.urgent && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">Requires attention</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick action */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/distributors?tab=pending">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Review Pending Distributors
            </Button>
          </Link>
          <Link href="/admin/change-requests">
            <Button variant="outline" className="gap-2">
              <FileCheck className="w-4 h-4" />
              Review Change Requests
            </Button>
          </Link>
          <Link href="/admin/cardholders">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              View All Cardholders
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
