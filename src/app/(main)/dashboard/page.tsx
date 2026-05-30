import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Wheat, CalendarClock } from "lucide-react"
import Link from "next/link"
import PersonalizedSuggestions from "@/components/dashboard/personalized-suggestions"
import DashboardCards from "@/components/dashboard/dashboard-cards"
import DistributionCycleAnnouncement from "@/components/dashboard/distribution-cycle-announcement"

export default function DashboardPage() {
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
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ration Order Placed</p>
                    <p className="text-sm text-muted-foreground">Order #202407-001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">July 15, 2024</p>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Token Booked</p>
                    <p className="text-sm text-muted-foreground">Token #T789-202408</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">July 28, 2024</p>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ration Order Placed</p>
                    <p className="text-sm text-muted-foreground">Order #202406-005</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">June 12, 2024</p>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </li>
              </ul>
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
