
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { products as allProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ShoppingCart, Minus, Plus, Trash2, IndianRupee, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: Math.max(0, item.quantity + amount) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">Order Rations</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
              <Badge className="ml-2">{totalItems}</Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Your Shopping Cart</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                        <Package size={32} className="text-muted-foreground" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          {quantity} x <IndianRupee className="inline-block h-4 w-4" />{product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, -1)}> <Minus className="h-4 w-4" /> </Button>
                        <span className="font-bold w-4 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, 1)}> <Plus className="h-4 w-4" /> </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(product.id)}> <Trash2 className="h-4 w-4 text-destructive" /> </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg items-center">
                    <span>Total</span>
                    <span className="flex items-center"><IndianRupee className="inline-block h-5 w-5" />{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <SheetFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={cart.length === 0}>
                        Proceed to Checkout
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Simulated UPI Payment</AlertDialogTitle>
                      <AlertDialogDescription className="flex items-center">
                        You are about to pay <IndianRupee className="inline-block h-4 w-4 mx-1" />{totalPrice.toFixed(2)}. This is a simulation. No real payment will be processed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                     <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <IndianRupee className="w-16 h-16 text-primary"/>
                        <p className="text-2xl font-bold">Scan to Pay</p>
                        <div className="bg-white p-2 rounded-lg">
                            <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=example@upi" width={150} height={150} alt="QR Code" />
                        </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <SheetClose asChild>
                        <AlertDialogAction onClick={() => setCart([])}>Confirm Payment</AlertDialogAction>
                      </SheetClose>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="aspect-[4/3] relative mb-4 flex items-center justify-center bg-muted rounded-t-lg">
                 <Package size={64} className="text-muted-foreground" />
              </div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.entitlement}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-2xl font-bold text-primary flex items-center"><IndianRupee className="inline-block h-6 w-6 mr-1" />{product.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground ml-1">/ {product.unit}</span></p>
              <p className="text-sm text-muted-foreground">Stock: {product.stock} {product.unit} available</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => addToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
