# Email and SMS Notification Setup Guide

This guide will help you set up email and SMS notifications for the Anna Seva Portal.

## 📧 Email Notifications

The portal sends emails for:
1. **Welcome Email** - After user registration
2. **Token Booking Confirmation** - When cardholder books a token
3. **Distribution Confirmation** - After food grains are distributed

### Setup Email (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env.local`**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   ```

### Other Email Providers

#### **Outlook/Hotmail**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
```

#### **Yahoo**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yahoo.com
SMTP_PASSWORD=your_app_password
```

#### **SendGrid (Recommended for Production)**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

---

## 📱 SMS Notifications

The portal sends SMS for:
1. **Welcome SMS** - After user registration
2. **Token Booking SMS** - When cardholder books a token
3. **Distribution SMS** - After food grains are distributed

### Setup Twilio SMS

1. **Create Twilio Account**
   - Visit [Twilio Console](https://www.twilio.com/console)
   - Sign up for a free account
   - Verify your email and phone number

2. **Get Credentials**
   - From the dashboard, copy:
     - **Account SID**
     - **Auth Token**

3. **Get a Phone Number**
   - Go to [Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
   - Click "Buy a number"
   - Select a number with SMS capabilities
   - Purchase the number (free trial includes credits)

4. **Update `.env.local`**
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Twilio Free Trial Limitations

- ✅ Free credits included ($15-20)
- ⚠️ Can only send to verified phone numbers
- ⚠️ Messages include "Sent from your Twilio trial account"

To verify a number during trial:
1. Go to [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Add the phone number you want to test with
3. Enter verification code sent to that number

### Alternative SMS Providers

#### **Nexmo/Vonage**
```javascript
// Requires different client library
import { Vonage } from '@vonage/server-sdk';
```

#### **AWS SNS**
```javascript
// Requires AWS SDK
import { SNS } from '@aws-sdk/client-sns';
```

---

## 🔧 Testing Notifications

### Test Email (Without Sending)

If you want to test without actual email sending:

```typescript
// In src/lib/notifications.ts
// Comment out the actual send and log instead:

// await emailTransporter.sendMail({...});
console.log('Would send email to:', to, 'with subject:', subject);
```

### Test SMS (Without Sending)

```typescript
// In src/lib/notifications.ts
// Comment out Twilio send and log instead:

// await twilioClient.messages.create({...});
console.log('Would send SMS to:', phone, 'with message:', message);
```

---

## 📊 Notification Flow

### 1. Registration Flow
```
User Registers
    ↓
Account Created in Database
    ↓
Send Welcome Email + SMS
    ↓
User Logged In
```

### 2. Token Booking Flow
```
Cardholder Books Token
    ↓
Token Created in Database
    ↓
Send Booking Email + SMS
    ↓
Cardholder Notified
```

### 3. Distribution Flow
```
Distributor Marks Distribution
    ↓
Token Status Updated to 'Collected'
    ↓
Send Distribution Email + SMS
    ↓
Cardholder Notified
```

---

## ⚙️ API Endpoints Using Notifications

### `POST /api/auth/register`
Sends:
- Welcome email with account details
- Welcome SMS with login link

### `POST /api/cardholder/book-token`
Sends:
- Token booking email with token number and items
- Token booking SMS with token number

### `POST /api/distributor/distribute`
Sends:
- Distribution confirmation email with items received
- Distribution confirmation SMS with summary

---

## 🛠️ Troubleshooting

### Email Not Sending

1. **Check Credentials**
   ```bash
   # Verify SMTP settings in .env.local
   echo $SMTP_USER
   echo $SMTP_PASSWORD
   ```

2. **Check Gmail Settings**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check "Less secure app access" is OFF

3. **Check Logs**
   ```bash
   # Server should log email errors
   npm run dev
   # Look for "Error sending email:" messages
   ```

### SMS Not Sending

1. **Verify Twilio Credentials**
   - Account SID starts with "AC"
   - Phone number includes country code (+1 for US)

2. **Check Trial Limitations**
   - Recipient number must be verified during trial
   - Ensure you have credits remaining

3. **Check Logs**
   ```bash
   # Look for "Error sending SMS:" messages
   ```

---

## 🎯 Production Recommendations

### Email
- ✅ Use **SendGrid** or **AWS SES** for production
- ✅ Implement rate limiting to prevent spam
- ✅ Add unsubscribe links
- ✅ Use email templates with branding
- ✅ Track delivery and open rates

### SMS
- ✅ Upgrade Twilio account (remove trial limitations)
- ✅ Use shorter messages to reduce costs
- ✅ Implement SMS opt-in/opt-out
- ✅ Consider WhatsApp Business API for free messaging
- ✅ Add retry logic for failed SMS

### Performance
- ✅ Use job queues (Bull, BullMQ) for async notifications
- ✅ Implement notification preferences (email/SMS/both)
- ✅ Log all notification attempts
- ✅ Add monitoring and alerts

---

## 💰 Cost Estimates

### Email (SendGrid)
- Free tier: 100 emails/day
- Essential: $19.95/month (50,000 emails)
- Pro: $89.95/month (100,000 emails)

### SMS (Twilio)
- India: ₹0.30 - ₹1.00 per SMS
- US: $0.0079 per SMS
- UK: $0.04 per SMS

### Alternative: WhatsApp Business API
- Free for business-initiated messages
- Better delivery rates
- Multimedia support

---

## 📝 Email Templates

All email templates are in `src/lib/notifications.ts`:

- `sendWelcomeEmail()` - Registration welcome
- `sendTokenBookingEmail()` - Token booking confirmation
- `sendDistributionConfirmationEmail()` - Distribution confirmation

### Customize Templates

Edit the HTML in each function:
```typescript
const html = `
  <!DOCTYPE html>
  <html>
    <!-- Your custom template -->
  </html>
`;
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to git
2. Use environment variables for all credentials
3. Validate phone numbers and emails before sending
4. Implement rate limiting on notification endpoints
5. Use HTTPS in production
6. Rotate API keys regularly
7. Monitor for suspicious activity

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart)
- [SendGrid Setup Guide](https://docs.sendgrid.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## ✅ Checklist

Before deploying to production:

- [ ] Email service configured and tested
- [ ] SMS service configured and tested
- [ ] All environment variables set
- [ ] Notification templates reviewed
- [ ] Error handling implemented
- [ ] Logs configured for monitoring
- [ ] Rate limiting enabled
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] User consent obtained for notifications
