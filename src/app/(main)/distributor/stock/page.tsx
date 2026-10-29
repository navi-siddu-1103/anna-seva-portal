
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { products as initialProducts } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { getProductImage, getProductPlaceholder } from "@/lib/product-images";

export default function StockManagementPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newStockValues, setNewStockValues] = useState<{ [key: string]: string }>({});
  const [distributionDate, setDistributionDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleStockChange = (productId: string, value: string) => {
    setNewStockValues((prev) => ({ ...prev, [productId]: value }));
  };

  const handleUpdateStock = (productId: string) => {
    const newStock = parseInt(newStockValues[productId] || "0", 10);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid stock number.",
        variant: "destructive",
      });
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + newStock } : p
      )
    );

    setNewStockValues((prev) => ({ ...prev, [productId]: "" }));

    toast({
      title: "Stock Updated",
      description: `Stock for the product has been successfully updated.`,
    });
  };

  const handleAnnounceCycle = () => {
    if (!distributionDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date for the next distribution cycle.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Cycle Announced",
      description: `Next distribution cycle announced for ${distributionDate.toLocaleDateString()}.`,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDistributionDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Stock Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Update the stock levels for each product.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead className="w-[150px]">Add Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={getProductImage(product.id)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getProductPlaceholder(product.name);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.stock} {product.unit}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          value={newStockValues[product.id] || ""}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleUpdateStock(product.id)}>Update</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Next Distribution Cycle</CardTitle>
              <CardDescription>Announce the date for the next ration distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dist-date">Distribution Start Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !distributionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {distributionDate ? distributionDate.toLocaleDateString() : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={distributionDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAnnounceCycle} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Announce Cycle</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
