# Anna Seva Portal - Notification System

## 🔔 Overview

The Anna Seva Portal now includes automated email and SMS notifications for key user actions:

### Notifications Sent:

1. **Registration Notifications** ✉️ 📱
   - Sent when a cardholder or distributor registers
   - Includes: Welcome message, account details, and login link

2. **Token Booking Notifications** ✉️ 📱
   - Sent when a cardholder books a token
   - Includes: Token number, items, collection point details

3. **Distribution Notifications** ✉️ 📱
   - Sent when a distributor marks food grains as distributed
   - Includes: Confirmation, items received, distribution date

---

## 🚀 Quick Start

### 1. Install Dependencies

Already installed:
```bash
npm install nodemailer twilio @types/nodemailer
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

**Required variables:**

```bash
# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 3. Setup Instructions

See detailed setup guides:
- 📧 **Email Setup**: [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md#-email-notifications)
- 📱 **SMS Setup**: [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md#-sms-notifications)

---

## 📋 Features Implemented

### ✅ Registration Flow
- **Endpoint**: `POST /api/auth/register`
- **Email**: Welcome email with account type (cardholder/distributor)
- **SMS**: Welcome SMS with login link

### ✅ Token Booking Flow
- **Endpoint**: `POST /api/cardholder/book-token`
- **Email**: Token confirmation with number, items, shop details
- **SMS**: Short confirmation with token number
- **Database**: Creates entry in `tokens` collection

### ✅ Distribution Flow
- **Endpoint**: `POST /api/distributor/distribute`
- **Email**: Distribution confirmation with items and date
- **SMS**: Quick confirmation with items summary
- **Database**: Updates token status, creates `distributions` entry

---

## 🗄️ New Database Collections

### `tokens` Collection
Stores token bookings:
```typescript
{
  tokenNumber: string,
  cardholderId: ObjectId,
  distributorId: ObjectId,
  items: Array<{productId, productName, quantity}>,
  status: 'booked' | 'collected' | 'cancelled',
  bookingDate: Date,
  collectionDate: Date,
  ...
}
```

### `distributions` Collection
Stores distribution records:
```typescript
{
  tokenNumber: string,
  cardholderId: ObjectId,
  distributorId: ObjectId,
  items: Array<{productId, productName, quantity}>,
  distributionDate: Date,
  ...
}
```

---

## 🛠️ API Endpoints

### Cardholder Endpoints

**Book Token**
```bash
POST /api/cardholder/book-token
Authorization: Cookie (JWT token)
Body: {
  items: [{productId, productName, quantity}],
  distributorId: string,
  collectionDate?: string
}
```

**Get My Tokens**
```bash
GET /api/cardholder/book-token
Authorization: Cookie (JWT token)
Returns: List of all tokens booked by cardholder
```

### Distributor Endpoints

**Mark Distribution**
```bash
POST /api/distributor/distribute
Authorization: Cookie (JWT token)
Body: {
  tokenNumber: string
}
```

**Get My Distributions**
```bash
GET /api/distributor/distribute
Authorization: Cookie (JWT token)
Returns: List of all distributions by this distributor
```

---

## 📧 Email Templates

All email templates are responsive and branded with Anna Seva Portal theme.

**Preview:**
- Yellow/gold gradient header with wheat icon 🌾
- Professional layout with clear information
- Call-to-action buttons
- Footer with Digital India branding

**Customize:**
Edit templates in `src/lib/notifications.ts`:
- `sendWelcomeEmail()`
- `sendTokenBookingEmail()`
- `sendDistributionConfirmationEmail()`

---

## 📱 SMS Format

**Welcome SMS:**
```
Welcome to Anna Seva Portal, [Name]! Your cardholder account is now active. 
You can book tokens and manage your ration entitlements. 
Login at http://localhost:9002
```

**Token Booking SMS:**
```
Dear [Name], your token #TKN1234567890 has been booked successfully 
at [Shop Name]. Please bring your ration card for collection. 
- Anna Seva Portal
```

**Distribution SMS:**
```
Dear [Name], your food grains (Rice 5kg, Wheat 5kg) for token #TKN1234567890 
have been distributed successfully. Thank you for using Anna Seva Portal.
```

---

## 🧪 Testing

### Test Without Sending (Development)

To test notification flow without actually sending emails/SMS:

1. Comment out the actual send in `src/lib/notifications.ts`
2. Check server console for logged notification attempts

### Test with Real Services

1. **Email**: Use your Gmail with App Password
2. **SMS**: Use Twilio trial (requires verified phone numbers)

---

## 🔒 Security & Privacy

- ✅ Notifications sent only to registered users
- ✅ Email/SMS credentials stored in environment variables
- ✅ No sensitive data in notification logs
- ✅ Error handling prevents registration failure if notification fails
- ✅ User phone numbers and emails validated before sending

---

## 📊 Monitoring

Server logs include:
```
✅ Welcome email sent to user@example.com
✅ Token booking SMS sent to +1234567890
❌ Error sending distribution email: [error details]
```

Monitor these logs to ensure notifications are working correctly.

---

## 💰 Cost Considerations

### Free Tier Options:
- **Email**: Gmail (limited), SendGrid (100/day free)
- **SMS**: Twilio trial (with credits)

### Production Recommendations:
- **Email**: SendGrid ($19.95/month for 50K emails)
- **SMS**: Twilio ($0.0079/SMS in US, varies by country)
- **Alternative**: WhatsApp Business API (free for business-initiated)

See [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md#-cost-estimates) for details.

---

## 🐛 Troubleshooting

**Email not sending?**
- Check SMTP credentials in `.env.local`
- Verify Gmail App Password (not regular password)
- Check server logs for errors

**SMS not sending?**
- Verify Twilio credentials
- Check phone number format (include country code)
- Verify recipient number during trial period

**Detailed troubleshooting**: [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md#-troubleshooting)

---

## 📚 Documentation

- **Setup Guide**: [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)
- **Database Structure**: [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)
- **API Documentation**: Coming soon

---

## ✅ Next Steps

1. Set up email service (Gmail or SendGrid)
2. Set up SMS service (Twilio)
3. Test registration flow
4. Test token booking flow
5. Test distribution flow
6. Monitor notification logs
7. Adjust templates as needed

---

## 🎯 Future Enhancements

- [ ] Email template customization UI
- [ ] Notification preferences (email/SMS/both)
- [ ] Delivery status tracking
- [ ] Retry mechanism for failed notifications
- [ ] WhatsApp Business API integration
- [ ] Push notifications for mobile app
- [ ] Notification scheduling
- [ ] Multi-language support

---

**Need Help?** Check the [detailed setup guide](./NOTIFICATION_SETUP.md) or contact support.
