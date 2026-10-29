# Quick Start: Email & SMS API Setup

Follow these steps to enable email and SMS notifications in Anna Seva Portal.

---

## 📧 STEP 1: Setup Email (Gmail - Easiest Option)

### Get Gmail App Password

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"
   - Follow the prompts to set it up

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

3. **Update `.env.local`**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=naveen@gmail.com                    # Your Gmail address
   SMTP_PASSWORD=abcd efgh ijkl mnop              # Your app password (no spaces)
   ```

4. **Remove spaces from password:**
   ```bash
   SMTP_PASSWORD=abcdefghijklmnop
   ```

### ✅ Test Email Setup

After updating `.env.local`:
1. Restart your dev server
2. Register a new test user
3. Check your email inbox for welcome message

---

## 📱 STEP 2: Setup SMS (Twilio - Free Trial)

### Get Twilio Credentials

1. **Sign Up**
   - Go to: https://www.twilio.com/try-twilio
   - Create a free account
   - Verify your email and phone number

2. **Get Account SID & Auth Token**
   - Go to: https://console.twilio.com
   - From the Dashboard, copy:
     - **Account SID** (starts with `AC...`)
     - **Auth Token** (click to reveal)

3. **Get a Phone Number**
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click "Buy a number"
   - Select a number with SMS capability
   - Complete purchase (free trial includes credits)

4. **Update `.env.local`**
   ```bash
   TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
   TWILIO_AUTH_TOKEN=your_auth_token_from_console
   TWILIO_PHONE_NUMBER=+12345678901            # Number you bought (with +1 country code)
   ```

### ⚠️ Important: Trial Account Limitations

**During Free Trial:**
- Can only send SMS to **verified phone numbers**
- Messages include "Sent from your Twilio trial account"
- Limited credits (~$15-20)

**To Verify a Test Phone Number:**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new Caller ID"
3. Enter phone number (with country code: +91 for India)
4. Enter verification code sent to that number

### ✅ Test SMS Setup

After updating `.env.local`:
1. Restart your dev server
2. Register with a verified phone number
3. You should receive welcome SMS

---

## 🚀 Complete Setup

Your `.env.local` should look like this:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=naveen@gmail.com
SMTP_PASSWORD=abcdefghijklmnop

# SMS Configuration
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_PHONE_NUMBER=+12345678901

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

---

## 🧪 Testing Without Real Services

If you want to test without setting up email/SMS services:

### Option 1: Check Server Logs

The notifications are **optional** and won't break registration if not configured.

You'll see in the terminal:
```
Email service not configured. Skipping email.
SMS service not configured. Skipping SMS.
```

Registration still works, just no notifications sent.

### Option 2: Mock Notifications (for Development)

Edit `src/lib/notifications.ts` and replace actual sends with console logs:

```typescript
// Comment out:
// await emailTransporter.sendMail({...});

// Add:
console.log('📧 MOCK EMAIL:', { to, subject, html });
```

---

## 💰 Cost Summary

### Email
- **Gmail**: Free (with limits: ~500 emails/day)
- **SendGrid**: Free tier (100 emails/day), then $19.95/month

### SMS
- **Twilio Free Trial**: ~$15-20 in credits
- **Twilio Paid**: 
  - India: ₹0.30 - ₹1.00 per SMS
  - USA: $0.0079 per SMS
  - Upgrade required to send to unverified numbers

---

## 🔍 Troubleshooting

### Email Not Sending

**Error: "Invalid login"**
- ✅ Make sure you're using App Password, not your regular Gmail password
- ✅ Remove all spaces from the app password
- ✅ Ensure 2FA is enabled on your Google account

**Error: "Authentication failed"**
- ✅ Double-check SMTP_USER is your full email address
- ✅ Try regenerating a new app password

### SMS Not Sending

**Error: "Unable to create record"**
- ✅ Verify the recipient phone number in Twilio console
- ✅ Ensure phone number includes country code (+91 for India, +1 for US)
- ✅ Check you have trial credits remaining

**Error: "From number not verified"**
- ✅ Make sure TWILIO_PHONE_NUMBER matches your Twilio number exactly

---

## 📖 Need More Help?

See detailed documentation:
- [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md) - Full setup guide
- [NOTIFICATION_FEATURES.md](./NOTIFICATION_FEATURES.md) - Feature overview

---

## ✅ Next Steps

1. **Setup Gmail** (5 minutes)
   - Enable 2FA
   - Generate app password
   - Update `.env.local`

2. **Setup Twilio** (10 minutes)
   - Sign up
   - Get credentials
   - Get phone number
   - Verify test number
   - Update `.env.local`

3. **Restart Server**
   ```bash
   npm run dev
   ```

4. **Test Registration**
   - Register a new cardholder
   - Check email inbox
   - Check phone for SMS

5. **Test Token Booking** (coming soon)
   - Book a token
   - Verify notifications

**Ready to go!** 🚀
