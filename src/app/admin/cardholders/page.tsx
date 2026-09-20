'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Cardholder {
  _id: string;
  name: string;
  email: string;
  cardNumber: string;
  phone: string;
  status: string;
  createdAt: string;
  entitlements?: { rice: number; wheat: number; sugar: number };
}

export default function AdminCardholdersPage() {
  const { toast } = useToast();
  const [cardholders, setCardholders] = useState<Cardholder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCardholders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cardholders');
      const data = await res.json();
      setCardholders(data.cardholders ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch cardholders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCardholders(); }, [fetchCardholders]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cardholders</h1>
          <p className="text-muted-foreground mt-1">View all registered cardholders and their details.</p>
        </div>
        <Button variant="outline" onClick={fetchCardholders} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Cardholders ({cardholders.length})
          </CardTitle>
          <CardDescription>All registered beneficiaries in the PDS system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : cardholders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No cardholders registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Entitlements</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cardholders.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="font-mono text-sm">{c.cardNumber || '—'}</TableCell>
                    <TableCell className="text-sm">{c.phone || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.entitlements
                        ? `Rice ${c.entitlements.rice}kg · Wheat ${c.entitlements.wheat}kg · Sugar ${c.entitlements.sugar}kg`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {c.status ?? 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
