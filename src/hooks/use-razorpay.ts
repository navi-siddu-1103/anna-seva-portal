'use client';

import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Lazily loads the Razorpay checkout.js SDK and provides an `openCheckout`
 * helper that:
 *   1. Creates a Razorpay order via POST /api/payment/create-order
 *   2. Opens the native Razorpay modal
 *   3. Verifies the signature via POST /api/payment/verify
 *   4. Calls onSuccess / onFailure accordingly
 */
export function useRazorpay() {
  const scriptLoaded = useRef(false);

  // Load the Razorpay JS SDK once
  useEffect(() => {
    if (scriptLoaded.current || typeof window === 'undefined') return;
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  /**
   * @param amountInRupees   Total amount in ₹ (will be converted to paise)
   * @param description      Short description shown in the modal
   * @param prefill          Optional { name, email, contact } for the customer
   * @param onSuccess        Called with paymentId after successful & verified payment
   * @param onFailure        Called with an error message when payment fails / is dismissed
   */
  const openCheckout = useCallback(
    async (params: {
      amountInRupees: number;
      description: string;
      receipt?: string;
      notes?: Record<string, string>;
      prefill?: { name?: string; email?: string; contact?: string };
      onSuccess: (paymentId: string, orderId: string) => void;
      onFailure: (errorMessage: string) => void;
    }) => {
      const {
        amountInRupees,
        description,
        receipt,
        notes,
        prefill,
        onSuccess,
        onFailure,
      } = params;

      // 1. Fetch public key from server
      let razorpayKeyId: string;
      try {
        const keyRes = await fetch('/api/config/razorpay-key');
        if (!keyRes.ok) throw new Error('Razorpay not configured');
        const keyData = await keyRes.json();
        razorpayKeyId = keyData.keyId;
      } catch {
        onFailure('Payment gateway is not available. Please try again later.');
        return;
      }

      // 2. Create Razorpay order on server
      let orderId: string;
      let orderAmount: number;
      try {
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(amountInRupees * 100), // paise
            currency: 'INR',
            receipt: receipt ?? `rcpt_${Date.now()}`,
            notes: notes ?? {},
          }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error ?? 'Order creation failed');
        orderId = orderData.orderId;
        orderAmount = orderData.amount;
      } catch (err: any) {
        onFailure(err.message ?? 'Could not initiate payment. Please try again.');
        return;
      }

      // 3. Ensure SDK is loaded
      if (typeof window.Razorpay === 'undefined') {
        onFailure('Payment SDK failed to load. Please refresh and try again.');
        return;
      }

      // 4. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: orderAmount,
        currency: 'INR',
        name: 'Anna Seva Portal',
        description,
        order_id: orderId,
        prefill: {
          name: prefill?.name ?? '',
          email: prefill?.email ?? '',
          contact: prefill?.contact ?? '',
        },
        theme: { color: '#16a34a' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          // 5. Verify signature on server
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? 'Signature mismatch');
            onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          } catch (err: any) {
            onFailure(err.message ?? 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment was cancelled.');
          },
        },
      });

      rzp.open();
    },
    []
  );

  return { openCheckout };
}
