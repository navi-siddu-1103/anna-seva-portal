# Payment Configuration Guide

## Overview
The Anna Seva Portal now supports configurable UPI payment accounts for receiving payments. Instead of using a hardcoded payment ID, administrators can configure their own UPI ID.

## How to Configure Your Payment UPI ID

### Step 1: Create `.env.local` file
In the root directory of the project, create a `.env.local` file (copy from `.env.example` if it exists):

```bash
cp .env.example .env.local
```

### Step 2: Add Your UPI ID
Open `.env.local` and add your UPI ID:

```env
NEXT_PUBLIC_PAYMENT_UPI_ID=your-upi-id@your-bank
```

### Step 3: Restart the Application
Restart your development or production server for the changes to take effect.

```bash
npm run dev    # For development
npm run build  # For production build
```

## Examples of Valid UPI IDs

- `yourname@googleplay` - Google Pay
- `merchantid@okhdfcbank` - HDFC Bank
- `yourname@ibl` - ICICI Bank
- `merchantid@ybl` - Yonomo Bank
- `yourname@okaxis` - Axis Bank
- `merchantid@airtel` - Airtel Payments Bank

## How It Works

1. When a user clicks "Proceed to Checkout" and a total amount is calculated
2. A QR code is dynamically generated using the configured UPI ID
3. The QR code encodes the UPI payment request with:
   - Your configured UPI ID
   - Merchant name: "Anna Seva Portal"
   - Payment amount (if applicable)
   - Transaction note: "Order Payment"

## QR Code Generation

The payment module (`/src/lib/payment-config.ts`) provides:
- `PAYMENT_UPI_ID`: The configured UPI ID from environment variables
- `generateUPIQRCodeUrl(amount?)`: Function to generate QR code URL for a given amount
- `paymentConfig`: Exported configuration object

## Security Notes

- The `NEXT_PUBLIC_PAYMENT_UPI_ID` environment variable is prefixed with `NEXT_PUBLIC_` because it needs to be available in the browser for generating QR codes
- UPI IDs are not sensitive data (they are meant to be publicly shared)
- No sensitive payment information is stored in the client-side code

## Testing the Configuration

1. Set your UPI ID in `.env.local`
2. Navigate to the order page (`/order`)
3. Add items to cart
4. Click "Proceed to Checkout"
5. Verify that the QR code is generated with your UPI ID (you can scan it to verify)

## Troubleshooting

**QR code still shows old UPI ID:**
- Ensure `.env.local` file exists in the root directory
- Make sure the environment variable name is exactly `NEXT_PUBLIC_PAYMENT_UPI_ID`
- Restart the development server after updating `.env.local`
- Clear browser cache if using production builds

**QR code not displaying:**
- Check that the UPI ID is valid format (should contain `@`)
- Verify internet connectivity (QR code is generated via api.qrserver.com)
- Check browser console for any errors

## File Changes

- **New:** `/src/lib/payment-config.ts` - Payment configuration module
- **New:** `.env.example` - Environment variables template
- **Modified:** `/src/app/(main)/order/page.tsx` - Updated to use payment configuration
