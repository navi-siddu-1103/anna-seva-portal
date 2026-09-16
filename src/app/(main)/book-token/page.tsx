"use client";

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle } from 'lucide-react';

const availableSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

export default function BookTokenPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedToken, setBookedToken] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { toast } = useToast();

  const handleBookSlot = () => {
    if (!selectedSlot || !date) {
      toast({
        title: 'Booking Failed',
        description: 'Please select a date and a time slot.',
        variant: 'destructive',
      });
      return;
    }
    const token = `T${Math.floor(Math.random() * 1000)}-${date.toISOString().split('T')[0]}`;
    setBookedToken(token);
    setIsConfirmationOpen(true);
    setSelectedSlot(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Book Your Collection Token</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex justify-center">
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Slots for {date ? date.toLocaleDateString() : '...'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    onClick={() => setSelectedSlot(slot)}
                    className="h-12 text-sm"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleBookSlot}
                className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!selectedSlot}
              >
                Confirm Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
       <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <AlertDialogTitle className="text-2xl">Booking Confirmed!</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Your time slot has been successfully booked.
              <br />
              Your token number is:
            </AlertDialogDescription>
            <p className="font-bold text-2xl text-primary bg-primary/10 px-4 py-2 rounded-md my-2">
              {bookedToken}
            </p>
             <p className="text-sm text-muted-foreground">Please show this token at the Fair Price Shop.</p>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setIsConfirmationOpen(false)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
