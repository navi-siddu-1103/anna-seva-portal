'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Loader2, RefreshCw, FileCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChangeRequest {
  _id: string;
  distributorId: string;
  distributorName: string;
  distributorEmail: string;
  requestedChanges: Record<string, string>;
  currentValues: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

const fieldLabels: Record<string, string> = {
  ownerName: 'Owner Name',
  shopName: 'Shop Name',
  phone: 'Phone',
  address: 'Address',
  licenseNumber: 'License Number',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-green-300">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Pending</Badge>;
}

export default function AdminChangeRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState('pending');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-requests?status=all');
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch change requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`/api/admin/change-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: action === 'approve' ? 'Changes Applied ✅' : 'Request Rejected', description: data.message });
      fetchRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter(r => tab === 'all' ? true : r.status === tab);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Change Requests</h1>
          <p className="text-muted-foreground mt-1">Review and approve profile changes submitted by distributors.</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending ({requests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({requests.filter(r => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({requests.filter(r => r.status === 'rejected').length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No {tab} change requests.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((req) => (
                <Card key={req._id} className={req.status === 'pending' ? 'border-orange-200' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{req.distributorName}</CardTitle>
                        <CardDescription>{req.distributorEmail}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Side by side comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <p className="text-xs font-semibold text-red-700 mb-3 uppercase tracking-wide">Current Values</p>
                        <div className="space-y-2">
                          {Object.entries(req.currentValues).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground w-28 shrink-0">{fieldLabels[key] ?? key}:</span>
                              <span className="text-sm line-through text-red-600">{value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wide">Requested Changes</p>
                        <div className="space-y-2">
                          {Object.entries(req.requestedChanges).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground w-28 shrink-0">{fieldLabels[key] ?? key}:</span>
                              <span className="text-sm font-medium text-green-700">{value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(req._id, 'approve')}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === req._id + 'approve'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle2 className="w-4 h-4" />}
                          Approve & Apply Changes
                        </Button>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === req._id + 'reject'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <XCircle className="w-4 h-4" />}
                          Reject
                        </Button>
                      </div>
                    )}

                    {req.status !== 'pending' && req.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed on {new Date(req.reviewedAt).toLocaleDateString('en-IN')}
                        {req.adminNote && ` — Note: ${req.adminNote}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
