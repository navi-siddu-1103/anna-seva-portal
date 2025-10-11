import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

const bookedSlots = {
  "09:00 AM - 10:00 AM": 15,
  "10:00 AM - 11:00 AM": 20,
  "11:00 AM - 12:00 PM": 18,
  "02:00 PM - 03:00 PM": 12,
  "03:00 PM - 04:00 PM": 5,
  "04:00 PM - 05:00 PM": 8,
};
const totalCapacityPerSlot = 20;

export default function DistributorSlotsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Distribution Slots Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex justify-center">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booked Slots for Today</CardTitle>
              <CardDescription>Overview of appointments for the selected date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(bookedSlots).map(([slot, count]) => {
                const percentage = (count / totalCapacityPerSlot) * 100;
                return (
                  <div key={slot}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{slot}</p>
                      <p className="text-sm text-muted-foreground">{count} / {totalCapacityPerSlot} booked</p>
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
