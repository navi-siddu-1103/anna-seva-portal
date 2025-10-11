import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wheat, CalendarClock, MessageSquareWarning } from "lucide-react"

export default function DashboardCards() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Entitlements</CardTitle>
          <Wheat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">35 KG</div>
          <p className="text-xs text-muted-foreground">of grains per household</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Token Date</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Aug 5, 2024</div>
          <p className="text-xs text-muted-foreground">Slot: 10:00 AM - 11:00 AM</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
          <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1</div>
          <p className="text-xs text-muted-foreground">pending resolution</p>
        </CardContent>
      </Card>
    </>
  )
}
