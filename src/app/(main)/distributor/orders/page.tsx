
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Distribution {
  _id: string;
  tokenNumber: string;
  cardholderId: string;
  cardholderName: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  distributionDate: string;
}

export default function FulfilledOrdersPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/distributor/distribute');
        
        if (!response.ok) {
          throw new Error('Failed to fetch distributions');
        }
        
        const data = await response.json();
        if (data.success) {
          setDistributions(data.distributions || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributions();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const formatItems = (items: Distribution['items']) => {
    return items.map((item) => `${item.productName} ${item.quantity}kg`).join(', ');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Fulfilled Orders</h1>
      
      {loading && (
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground">Loading fulfilled orders...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-8">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && distributions.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">No fulfilled orders yet. Orders will appear here as they are distributed.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && distributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>A list of all orders fulfilled by your shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Card Holder ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((distribution) => (
                  <TableRow key={distribution._id}>
                    <TableCell className="font-medium">{distribution.tokenNumber}</TableCell>
                    <TableCell>{formatDate(distribution.distributionDate)}</TableCell>
                    <TableCell>{distribution.cardholderId}</TableCell>
                    <TableCell>{formatItems(distribution.items)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Completed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
