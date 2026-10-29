'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Distributor {
  _id: string;
  ownerName: string;
  shopName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
  adminNote?: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Pending</Badge>;
}

export default function AdminDistributorsPage() {
  const { toast } = useToast();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState('pending');

  const fetchDistributors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/distributors?status=all');
      const data = await res.json();
      setDistributors(data.distributors ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch distributors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchDistributors(); }, [fetchDistributors]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`/api/admin/distributors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: action === 'approve' ? 'Distributor Approved ✅' : 'Distributor Rejected', description: data.message });
      fetchDistributors();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = distributors.filter(d => tab === 'all' ? true : d.status === tab);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Distributors</h1>
          <p className="text-muted-foreground mt-1">Approve or reject distributor registrations and manage all shops.</p>
        </div>
        <Button variant="outline" onClick={fetchDistributors} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({distributors.filter(d => d.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="active">Active ({distributors.filter(d => d.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({distributors.filter(d => d.status === 'rejected').length})</TabsTrigger>
          <TabsTrigger value="all">All ({distributors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Distributors
              </CardTitle>
              <CardDescription>
                {tab === 'pending' ? 'These distributors are awaiting your approval to go live on the platform.' : `Showing ${tab} distributors.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No {tab} distributors found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner / Shop</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d) => (
                      <TableRow key={d._id}>
                        <TableCell>
                          <div className="font-medium">{d.ownerName}</div>
                          <div className="text-xs text-muted-foreground">{d.shopName}</div>
                          {d.address && <div className="text-xs text-muted-foreground">{d.address}</div>}
                        </TableCell>
                        <TableCell className="text-sm">{d.email}</TableCell>
                        <TableCell className="text-sm">{d.phone || '—'}</TableCell>
                        <TableCell className="text-sm font-mono text-xs">{d.licenseNumber || '—'}</TableCell>
                        <TableCell><StatusBadge status={d.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right">
                          {d.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(d._id, 'approve')}
                                disabled={actionLoading !== null}
                              >
                                {actionLoading === d._id + 'approve'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <CheckCircle2 className="w-3 h-3" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                                onClick={() => handleAction(d._id, 'reject')}
                                disabled={actionLoading !== null}
                              >
                                {actionLoading === d._id + 'reject'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <XCircle className="w-3 h-3" />}
                                Reject
                              </Button>
                            </div>
                          )}
                          {d.status === 'active' && (
                            <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/50"
                              onClick={() => handleAction(d._id, 'reject')} disabled={actionLoading !== null}>
                              <XCircle className="w-3 h-3" /> Suspend
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
