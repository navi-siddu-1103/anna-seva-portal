
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { products as allProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  IndianRupee,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getProductImage, getProductPlaceholder } from '@/lib/product-images';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRazorpay } from '@/hooks/use-razorpay';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    paymentId: string;
    orderId: string;
  }>({ open: false, paymentId: '', orderId: '' });

  const { toast } = useToast();
  const { openCheckout } = useRazorpay();

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast({
      title: '✅ Added to Cart!',
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPaying(true);

    openCheckout({
      amountInRupees: totalPrice,
      description: `Food grain order – ${totalItems} item(s)`,
      receipt: `order_${Date.now()}`,
      notes: {
        items: cart
          .map((i) => `${i.product.name} x${i.quantity}`)
          .join(', '),
      },
      onSuccess: (paymentId, orderId) => {
        setIsPaying(false);
        setCart([]);
        setIsCartOpen(false);
        setSuccessDialog({ open: true, paymentId, orderId });
      },
      onFailure: (errorMessage) => {
        setIsPaying(false);
        if (errorMessage !== 'Payment was cancelled.') {
          toast({
            title: 'Payment Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      },
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">Order Rations</h1>
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
              <Badge className="ml-2">{totalItems}</Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
            <SheetHeader>
              <SheetTitle>Your Shopping Cart</SheetTitle>
            </SheetHeader>

            <div className="py-4 flex-grow overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  Your cart is empty.
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
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
                      <div className="flex-grow">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          {quantity} x{' '}
                          <IndianRupee className="inline-block h-4 w-4" />
                          {product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-4 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between font-bold text-lg items-center">
                    <span>Total</span>
                    <span className="flex items-center">
                      <IndianRupee className="inline-block h-5 w-5" />
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="pt-4">
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={cart.length === 0 || isPaying}
                onClick={handleCheckout}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Payment…
                  </>
                ) : (
                  <>
                    <IndianRupee className="mr-2 h-4 w-4" />
                    Pay ₹{totalPrice.toFixed(2)} with Razorpay
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="aspect-[4/3] relative mb-4 rounded-t-lg overflow-hidden bg-muted">
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
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.entitlement}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-2xl font-bold text-primary flex items-center">
                <IndianRupee className="inline-block h-6 w-6 mr-1" />
                {product.price.toFixed(2)}{' '}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {product.unit}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock} {product.unit} available
              </p>
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

      {/* Payment Success Dialog */}
      <AlertDialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog((s) => ({ ...s, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
            <AlertDialogTitle className="text-2xl">
              Payment Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-1">
              <span>Your order has been placed successfully.</span>
              <br />
              <span className="text-xs text-muted-foreground">
                Payment ID:{' '}
                <code className="font-mono">{successDialog.paymentId}</code>
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                Order ID:{' '}
                <code className="font-mono">{successDialog.orderId}</code>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => setSuccessDialog({ open: false, paymentId: '', orderId: '' })}
            >
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
