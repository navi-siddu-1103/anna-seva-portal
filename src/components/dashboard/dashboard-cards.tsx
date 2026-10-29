'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wheat, CalendarClock, MessageSquareWarning } from "lucide-react"

export default function DashboardCards() {
  const [entitlements, setEntitlements] = useState<string>('35 KG');
  const [nextTokenDate, setNextTokenDate] = useState<string>('Aug 5, 2024');
  const [nextTokenSlot, setNextTokenSlot] = useState<string>('10:00 AM - 11:00 AM');
  const [activeComplaints, setActiveComplaints] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCardholderData = async () => {
      try {
        setLoading(true);
        
        // Fetch cardholder profile to get entitlements
        const profileResponse = await fetch('/api/cardholder/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.cardholder) {
            // Set entitlements if available
            const card = profileData.cardholder;
            if (card.cardType) {
              const entitlementMap: { [key: string]: string } = {
                'AAY': '35 KG',
                'BPL': '25 KG',
                'APL': '15 KG',
              };
              setEntitlements(entitlementMap[card.cardType] || '35 KG');
            }
          }
        }

        // Fetch distribution cycles to get next token date
        const cyclesResponse = await fetch('/api/cardholder/distribution-cycles');
        if (cyclesResponse.ok) {
          const cyclesData = await cyclesResponse.json();
          if (cyclesData.success && cyclesData.cycles && cyclesData.cycles.length > 0) {
            const nextCycle = cyclesData.cycles[0];
            if (nextCycle.cycleStartDate) {
              const date = new Date(nextCycle.cycleStartDate);
              setNextTokenDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch cardholder data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardholderData();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Entitlements</CardTitle>
          <Wheat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{entitlements}</div>
          <p className="text-xs text-muted-foreground">of grains per household</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Token Date</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{nextTokenDate}</div>
          <p className="text-xs text-muted-foreground">Slot: {nextTokenSlot}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
          <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeComplaints}</div>
          <p className="text-xs text-muted-foreground">pending resolution</p>
        </CardContent>
      </Card>
    </>
  )
}
