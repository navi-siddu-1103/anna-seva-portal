"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2, Store } from "lucide-react";
import { Label } from "@/components/ui/label";

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

interface Distributor {
  _id: string;
  shopName: string;
  address: string;
  ownerName?: string;
}

export default function BookTokenPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>("");
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loadingDistributors, setLoadingDistributors] = useState(true);
  const [bookedToken, setBookedToken] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  // Fetch available distributors on mount
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await fetch("/api/distributor/list");
        if (res.ok) {
          const data = await res.json();
          setDistributors(data.data ?? []);
        }
      } catch {
        toast({
          title: "Failed to load shops",
          description: "Could not fetch distributor list. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setLoadingDistributors(false);
      }
    };
    fetchDistributors();
  }, [toast]);

  const handleBookSlot = async () => {
    if (!selectedSlot || !date) {
      toast({
        title: "Booking Failed",
        description: "Please select a date and a time slot.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDistributorId) {
      toast({
        title: "Booking Failed",
        description: "Please select a Fair Price Shop.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch("/api/cardholder/book-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distributorId: selectedDistributorId,
          collectionDate: date.toISOString(),
          timeSlot: selectedSlot,
          items: [], // items can be extended in future
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Booking failed");
      }

      setBookedToken(data.tokenNumber);
      setIsConfirmationOpen(true);
      setSelectedSlot(null);
    } catch (err: any) {
      toast({
        title: "Booking Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">
        Book Your Collection Token
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-1 flex justify-center">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setSelectedSlot(null); }}
                className="rounded-md"
                disabled={(d) =>
                  d < new Date(new Date().setDate(new Date().getDate() - 1))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distributor picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Select Fair Price Shop
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDistributors ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading shops...
                </div>
              ) : distributors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Fair Price Shops available.
                </p>
              ) : (
                <div className="space-y-2">
                  <Label>Choose your distributor</Label>
                  <Select
                    value={selectedDistributorId}
                    onValueChange={setSelectedDistributorId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a Fair Price Shop..." />
                    </SelectTrigger>
                    <SelectContent>
                      {distributors.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          <span className="font-medium">{d.shopName}</span>
                          {d.address && (
                            <span className="text-muted-foreground text-xs ml-2">
                              — {d.address}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slot picker */}
          <Card>
            <CardHeader>
              <CardTitle>
                Available Slots for{" "}
                {date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TIME_SLOTS.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
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
                disabled={!selectedSlot || !selectedDistributorId || isBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
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
            <p className="text-sm text-muted-foreground">
              Please show this token at the Fair Price Shop on your selected date.
            </p>
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
