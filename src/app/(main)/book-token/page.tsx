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
import { CheckCircle, Loader2, Store, IndianRupee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRazorpay } from "@/hooks/use-razorpay";

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

/** Token booking fee in ₹ */
const BOOKING_FEE = 5;

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
  const [isPaying, setIsPaying] = useState(false);

  const { toast } = useToast();
  const { openCheckout } = useRazorpay();

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

  /** Step 2: after payment is verified, actually create the booking */
  const confirmBooking = async (paymentId: string) => {
    if (!selectedSlot || !date || !selectedDistributorId) return;

    setIsBooking(true);
    try {
      const res = await fetch("/api/cardholder/book-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distributorId: selectedDistributorId,
          collectionDate: date.toISOString(),
          timeSlot: selectedSlot,
          items: [],
          paymentId, // pass the verified payment ID for record-keeping
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

  /** Step 1: validate selections → open Razorpay → on success call confirmBooking */
  const handleBookSlot = () => {
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

    setIsPaying(true);

    const shopName =
      distributors.find((d) => d._id === selectedDistributorId)?.shopName ?? "Shop";

    openCheckout({
      amountInRupees: BOOKING_FEE,
      description: `Token booking fee – ${shopName}`,
      receipt: `token_${Date.now()}`,
      notes: {
        shop: shopName,
        slot: selectedSlot,
        date: date.toLocaleDateString("en-IN"),
      },
      onSuccess: (paymentId) => {
        setIsPaying(false);
        confirmBooking(paymentId);
      },
      onFailure: (errorMessage) => {
        setIsPaying(false);
        if (errorMessage !== "Payment was cancelled.") {
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      },
    });
  };

  const isBusy = isPaying || isBooking;

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
                onSelect={(d) => {
                  setDate(d);
                  setSelectedSlot(null);
                }}
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
                {date
                  ? date.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "..."}
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
                    disabled={isBusy}
                  >
                    {slot}
                  </Button>
                ))}
              </div>

              {/* Booking fee notice */}
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-md px-4 py-3">
                <IndianRupee className="w-4 h-4 shrink-0" />
                <span>
                  A nominal token booking fee of{" "}
                  <strong>₹{BOOKING_FEE}</strong> is collected via Razorpay to
                  confirm your slot.
                </span>
              </div>

              <Button
                onClick={handleBookSlot}
                className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!selectedSlot || !selectedDistributorId || isBusy}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening Payment…
                  </>
                ) : isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking…
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Pay ₹{BOOKING_FEE} &amp; Confirm Booking
                  </>
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
            <AlertDialogTitle className="text-2xl">
              Booking Confirmed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Payment successful. Your time slot has been booked.
              <br />
              Your token number is:
            </AlertDialogDescription>
            <p className="font-bold text-2xl text-primary bg-primary/10 px-4 py-2 rounded-md my-2">
              {bookedToken}
            </p>
            <p className="text-sm text-muted-foreground">
              Please show this token at the Fair Price Shop on your selected
              date.
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
