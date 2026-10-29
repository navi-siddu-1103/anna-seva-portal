"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Box,
  ClipboardList,
  Clock,
  AlertTriangle,
  RefreshCw,
  Ticket,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import AnnounceDistributionCycleForm from "@/components/distributor/announce-cycle-form";
import { useToast } from "@/hooks/use-toast";

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

interface TokenRecord {
  _id: string;
  tokenNumber: string;
  cardholderName: string;
  cardNumber?: string;
  timeSlot: string | null;
  collectionDate: string;
  status: "booked" | "collected" | "cancelled";
  items: Array<{ productName: string; quantity: number }>;
}

export default function DistributorDashboard() {
  const { toast } = useToast();
  const [chartData, setChartData] = React.useState<{ name: string; total: number }[]>([]);
  const [nextCycle, setNextCycle] = useState<DistributionCycle | null>(null);
  const [loadingCycle, setLoadingCycle] = useState(false);

  // Today's token queue
  const [todayTokens, setTodayTokens] = useState<TokenRecord[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [markingToken, setMarkingToken] = useState<string | null>(null);

  React.useEffect(() => {
    setChartData(generateChartData());
  }, []);

  const fetchDistributionCycle = async () => {
    setLoadingCycle(true);
    try {
      const response = await fetch("/api/distributor/announce-cycle");
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setNextCycle(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch distribution cycle:", error);
    } finally {
      setLoadingCycle(false);
    }
  };

  const fetchTodayTokens = useCallback(async () => {
    setLoadingTokens(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/distributor/tokens?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setTodayTokens(data.tokens ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch today tokens:", err);
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    fetchDistributionCycle();
    fetchTodayTokens();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTodayTokens, 30_000);
    return () => clearInterval(interval);
  }, [fetchTodayTokens]);

  const handleMarkCollected = async (tokenNumber: string) => {
    setMarkingToken(tokenNumber);
    try {
      const res = await fetch("/api/distributor/tokens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to mark token");

      toast({ title: "Token collected", description: `${tokenNumber} marked as collected.` });
      // Optimistically update
      setTodayTokens((prev) =>
        prev.map((t) =>
          t.tokenNumber === tokenNumber ? { ...t, status: "collected" } : t
        )
      );
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setMarkingToken(null);
    }
  };

  const formatCycleDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Aug 1, 2024";
    }
  };

  const cycleDate = nextCycle
    ? formatCycleDate(nextCycle.cycleStartDate)
    : "Aug 1, 2024";

  const bookedCount = todayTokens.filter((t) => t.status === "booked").length;
  const collectedCount = todayTokens.filter((t) => t.status === "collected").length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          PDS Distributor Dashboard
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        {/* NEW: Tokens Booked Today */}
        <Card className="border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Booked Today</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingTokens ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{bookedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {collectedCount} collected · {bookedCount} pending
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts + alerts row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Current inventory levels in KG/Litre.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts &amp; Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">Low Stock Warning</p>
                <p className="text-sm text-muted-foreground">
                  Sugar stock is below 20%. Please re-order.
                </p>
              </div>
              <Badge variant="outline">3 days ago</Badge>
            </div>
            <div className="flex items-start gap-4">
              <Box className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">New Stock Arrived</p>
                <p className="text-sm text-muted-foreground">
                  500 KG of Wheat has been added to inventory.
                </p>
              </div>
              <Badge variant="outline">1 week ago</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODAY'S TOKEN QUEUE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today&apos;s Token Queue</CardTitle>
            <CardDescription>
              Cardholders who booked a token for today. Auto-refreshes every 30s.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTodayTokens}
            disabled={loadingTokens}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingTokens ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loadingTokens && todayTokens.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading today&apos;s tokens...
            </div>
          ) : todayTokens.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tokens booked for today yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token #</TableHead>
                  <TableHead>Cardholder</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayTokens.map((tok) => (
                  <TableRow key={tok._id}>
                    <TableCell className="font-mono font-medium">
                      {tok.tokenNumber}
                    </TableCell>
                    <TableCell>
                      <div>{tok.cardholderName}</div>
                      {tok.cardNumber && (
                        <div className="text-xs text-muted-foreground">
                          Card: {tok.cardNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {tok.timeSlot ?? (
                        <span className="text-muted-foreground text-xs">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tok.status === "collected" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Collected
                        </Badge>
                      ) : tok.status === "cancelled" ? (
                        <Badge variant="destructive">Cancelled</Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary text-primary">
                          Booked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {tok.status === "booked" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkCollected(tok.tokenNumber)}
                          disabled={markingToken === tok.tokenNumber}
                          className="gap-1"
                        >
                          {markingToken === tok.tokenNumber ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Mark Collected
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Announce distribution cycle */}
      <div className="grid gap-6 grid-cols-1">
        <AnnounceDistributionCycleForm onSuccess={fetchDistributionCycle} />
      </div>
    </div>
  );
}
