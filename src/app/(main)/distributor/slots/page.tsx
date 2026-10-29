'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface SlotData {
  timeSlot: string;
  booked: number;
  capacity: number;
  available: number;
}

interface SlotsResponse {
  success: boolean;
  date: string;
  slots: SlotData[];
  totalSlots: number;
}

export default function DistributorSlotsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots when selected date changes
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/distributor/slots?date=${dateStr}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch slots data');
        }
        
        const data: SlotsResponse = await response.json();
        if (data.success) {
          setSlots(data.slots);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Distribution Slots Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex justify-center">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booked Slots for {formatDate(selectedDate)}</CardTitle>
              <CardDescription>Overview of appointments for the selected date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading slots data...</p>
              )}
              {error && (
                <p className="text-sm text-destructive">Error: {error}</p>
              )}
              {!loading && !error && slots.length === 0 && (
                <p className="text-sm text-muted-foreground">No time slots available for this date.</p>
              )}
              {!loading && !error && slots.map((slot) => {
                const percentage = (slot.booked / slot.capacity) * 100;
                return (
                  <div key={slot.timeSlot}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{slot.timeSlot}</p>
                      <p className="text-sm text-muted-foreground">{slot.booked} / {slot.capacity} booked</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
