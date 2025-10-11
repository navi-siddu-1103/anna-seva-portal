
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const fulfilledOrders = [
  {
    orderId: "ORD-202407-001",
    date: "2024-07-15",
    cardHolderId: "KA-345-2345678",
    items: "Rice, Wheat, Sugar",
    status: "Completed",
  },
  {
    orderId: "ORD-202407-002",
    date: "2024-07-16",
    cardHolderId: "KA-123-9876543",
    items: "Rice, Wheat",
    status: "Completed",
  },
  {
    orderId: "ORD-202406-005",
    date: "2024-06-12",
    cardHolderId: "KA-789-1234567",
    items: "Rice, Wheat, Sugar, Oil",
    status: "Completed",
  },
   {
    orderId: "ORD-202406-004",
    date: "2024-06-11",
    cardHolderId: "KA-555-5555555",
    items: "Wheat, Sugar",
    status: "Completed",
  },
];

export default function FulfilledOrdersPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Fulfilled Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of all orders fulfilled by your shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Card Holder ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fulfilledOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.cardHolderId}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
