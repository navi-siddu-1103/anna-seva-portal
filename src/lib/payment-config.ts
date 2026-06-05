/**
 * Payment Configuration
 * Configure your UPI ID here for receiving payments
 */

// Get UPI ID from environment variable or use default
export const PAYMENT_UPI_ID = process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || 'example@upi';

// Generate QR code URL for UPI payment
export const generateUPIQRCodeUrl = (amount?: number): string => {
  // UPI URL format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<TRANSACTION_NOTE>
  const upiUrl = new URLSearchParams();
  upiUrl.append('pa', PAYMENT_UPI_ID);
  upiUrl.append('pn', 'Anna Seva Portal');
  if (amount) {
    upiUrl.append('am', amount.toString());
  }
  upiUrl.append('tn', 'Order Payment');

  const upiString = `upi://pay?${upiUrl.toString()}`;
  
  // Use QR Server API to generate QR code
  const qrUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qrUrl.searchParams.append('size', '150x150');
  qrUrl.searchParams.append('data', upiString);

  return qrUrl.toString();
};

// Export payment configuration object
export const paymentConfig = {
  upiId: PAYMENT_UPI_ID,
  generateQRCodeUrl: generateUPIQRCodeUrl,
} as const;
