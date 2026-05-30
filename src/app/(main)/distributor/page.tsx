"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Box, ClipboardList, Clock, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import AnnounceDistributionCycleForm from '@/components/distributor/announce-cycle-form';

const generateChartData = () => [
  { name: "Rice", total: Math.floor(Math.random() * 500) + 100 },
  { name: "Wheat", total: Math.floor(Math.random() * 500) + 100 },
  { name: "Sugar", total: Math.floor(Math.random() * 500) + 100 },
  { name: "Dal", total: Math.floor(Math.random() * 500) + 100 },
  { name: "Oil", total: Math.floor(Math.random() * 500) + 100 },
];

interface DistributionCycle {
  cycleStartDate: string;
}

export default function DistributorDashboard() {
  const [chartData, setChartData] = React.useState<{name: string, total: number}[]>([]);
  const [nextCycle, setNextCycle] = useState<DistributionCycle | null>(null);
  const [loadingCycle, setLoadingCycle] = useState(false);

  React.useEffect(() => {
    setChartData(generateChartData());
  }, []);

  const fetchDistributionCycle = async () => {
    setLoadingCycle(true);
    try {
      const response = await fetch('/api/distributor/announce-cycle');
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Get the latest cycle (first one since results are sorted by announcementDate: -1)
          setNextCycle(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch distribution cycle:', error);
    } finally {
      setLoadingCycle(false);
    }
  };

  useEffect(() => {
    fetchDistributionCycle();
  }, []);

  const formatCycleDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Aug 1, 2024';
    }
  };

  const cycleDate = nextCycle ? formatCycleDate(nextCycle.cycleStartDate) : 'Aug 1, 2024';

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">PDS Distributor Dashboard</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">different products managed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Fulfilled (Month)</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground">families served this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Distribution Cycle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cycleDate}</div>
            <p className="text-xs text-muted-foreground">starting next week</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Current inventory levels in KG/Litre.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">Low Stock Warning</p>
                <p className="text-sm text-muted-foreground">Sugar stock is below 20%. Please re-order.</p>
              </div>
              <Badge variant="outline">3 days ago</Badge>
            </div>
            <div className="flex items-start gap-4">
              <Box className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">New Stock Arrived</p>
                <p className="text-sm text-muted-foreground">500 KG of Wheat has been added to inventory.</p>
              </div>
              <Badge variant="outline">1 week ago</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 grid-cols-1">
        <AnnounceDistributionCycleForm onSuccess={fetchDistributionCycle} />
      </div>
    </div>
  )
}
