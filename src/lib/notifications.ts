import nodemailer from 'nodemailer';
import twilio from 'twilio';

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// SMS Configuration (Twilio)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Email Templates
export async function sendWelcomeEmail(
  to: string,
  name: string,
  role: 'cardholder' | 'distributor'
) {
  if (!process.env.SMTP_USER) {
    console.warn('Email service not configured. Skipping email.');
    return;
  }

  const escapedName = escapeHtml(name);
  const subject = `Welcome to Anna Seva Portal - ${role === 'cardholder' ? 'Cardholder' : 'Distributor'} Registration Successful`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5d547 0%, #e6a834 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #2d1f00; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #e6a834; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 Anna Seva Portal</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${escapedName}!</h2>
          <p>Your registration as a <strong>${role === 'cardholder' ? 'Cardholder' : 'Distributor'}</strong> has been successfully completed.</p>
          
          ${role === 'cardholder' ? `
            <p>You can now:</p>
            <ul>
              <li>Book tokens for ration collection</li>
              <li>View your monthly entitlements</li>
              <li>Find nearby Fair Price Shops</li>
              <li>Track your orders</li>
            </ul>
          ` : `
            <p>You can now:</p>
            <ul>
              <li>Manage your Fair Price Shop inventory</li>
              <li>Process cardholder orders</li>
              <li>Track distribution records</li>
              <li>Manage your shop profile</li>
            </ul>
          `}
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login" class="button">Login to Your Account</a>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>Anna Seva Portal | A Digital India Initiative</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await emailTransporter.sendMail({
      from: `"Anna Seva Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function sendTokenBookingEmail(
  to: string,
  name: string,
  tokenDetails: {
    tokenNumber: string;
    bookingDate: string;
    items: { name: string; quantity: number }[];
    shopName: string;
    shopAddress: string;
  }
) {
  if (!process.env.SMTP_USER) {
    console.warn('Email service not configured. Skipping email.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedShopName = escapeHtml(tokenDetails.shopName);
  const escapedShopAddress = escapeHtml(tokenDetails.shopAddress);
  const subject = `Token Booking Confirmed - #${escapeHtml(tokenDetails.tokenNumber)}`;
  
  const itemsList = tokenDetails.items
    .map(item => `<li>${escapeHtml(item.name)}: ${item.quantity} kg</li>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5d547 0%, #e6a834 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #2d1f00; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .token-box { background: white; padding: 20px; border-left: 4px solid #e6a834; margin: 20px 0; }
        .token-number { font-size: 32px; font-weight: bold; color: #e6a834; margin: 10px 0; }
        .details { margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 Token Booking Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello, ${escapedName}!</h2>
          <p>Your token has been successfully booked.</p>
          
          <div class="token-box">
            <p><strong>Token Number:</strong></p>
            <div class="token-number">${escapeHtml(tokenDetails.tokenNumber)}</div>
            <p><strong>Booking Date:</strong> ${escapeHtml(tokenDetails.bookingDate)}</p>
          </div>

          <div class="details">
            <h3>Items to Collect:</h3>
            <ul>${itemsList}</ul>
          </div>

          <div class="details">
            <h3>Collection Point:</h3>
            <p><strong>${escapedShopName}</strong><br>
            ${escapedShopAddress}</p>
          </div>

          <p><strong>Important:</strong> Please bring your ration card and this token number when collecting your items.</p>
        </div>
        <div class="footer">
          <p>Anna Seva Portal | A Digital India Initiative</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await emailTransporter.sendMail({
      from: `"Anna Seva Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Token booking email sent to ${to}`);
  } catch (error) {
    console.error('Error sending token booking email:', error);
  }
}

export async function sendDistributionConfirmationEmail(
  to: string,
  name: string,
  distributionDetails: {
    tokenNumber: string;
    distributionDate: string;
    items: { name: string; quantity: number }[];
    shopName: string;
  }
) {
  if (!process.env.SMTP_USER) {
    console.warn('Email service not configured. Skipping email.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedShopName = escapeHtml(distributionDetails.shopName);
  const subject = `Food Grains Distributed - Token #${escapeHtml(distributionDetails.tokenNumber)}`;
  
  const itemsList = distributionDetails.items
    .map(item => `<li>${escapeHtml(item.name)}: ${item.quantity} kg</li>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #e8f5e9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Food Grains Distributed</h1>
        </div>
        <div class="content">
          <h2>Hello, ${escapedName}!</h2>
          <p>Your food grains have been successfully distributed.</p>
          
          <div class="success-box">
            <p><strong>Token Number:</strong> ${escapeHtml(distributionDetails.tokenNumber)}</p>
            <p><strong>Distribution Date:</strong> ${escapeHtml(distributionDetails.distributionDate)}</p>
            <p><strong>Distributed By:</strong> ${escapedShopName}</p>
          </div>

          <h3>Items Received:</h3>
          <ul>${itemsList}</ul>

          <p>Thank you for using Anna Seva Portal. Your feedback helps us improve our services.</p>
        </div>
        <div class="footer">
          <p>Anna Seva Portal | A Digital India Initiative</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await emailTransporter.sendMail({
      from: `"Anna Seva Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Distribution confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending distribution confirmation email:', error);
  }
}

export async function sendDistributionCycleAnnouncementEmail(
  to: string,
  name: string,
  cycleDetails: {
    distributorName: string;
    cycleStartDate: string;
    description?: string;
  }
) {
  if (!process.env.SMTP_USER) {
    console.warn('Email service not configured. Skipping email.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedDistributorName = escapeHtml(cycleDetails.distributorName);
  const escapedCycleStartDate = escapeHtml(cycleDetails.cycleStartDate);
  const escapedDescription = cycleDetails.description ? escapeHtml(cycleDetails.description) : null;
  const subject = `Next Distribution Cycle Announced - ${escapedDistributorName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5d547 0%, #e6a834 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #2d1f00; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .announcement-box { background: white; padding: 20px; border-left: 4px solid #f5d547; margin: 20px 0; }
        .start-date { font-size: 20px; font-weight: bold; color: #e6a834; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #e6a834; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Distribution Cycle Announced</h1>
        </div>
        <div class="content">
          <h2>Hello, ${escapedName}!</h2>
          <p>Good news! A new distribution cycle has been announced.</p>
          
          <div class="announcement-box">
            <p><strong>Fair Price Shop:</strong> ${escapedDistributorName}</p>
            <p><strong>Distribution Start Date:</strong></p>
            <div class="start-date">${escapedCycleStartDate}</div>
            ${escapedDescription ? `<p><strong>Details:</strong> ${escapedDescription}</p>` : ''}
          </div>

          <p>You can now book your tokens for the upcoming distribution cycle. Visit your dashboard to book your ration quota.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard" class="button">Go to Dashboard</a>

          <p>If you have any questions, please contact your Fair Price Shop directly.</p>
        </div>
        <div class="footer">
          <p>Anna Seva Portal | A Digital India Initiative</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await emailTransporter.sendMail({
      from: `"Anna Seva Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Distribution cycle announcement email sent to ${to}`);
  } catch (error) {
    console.error('Error sending distribution cycle announcement email:', error);
  }
}

// SMS Functions
export async function sendWelcomeSMS(phone: string, name: string, role: 'cardholder' | 'distributor') {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('SMS service not configured. Skipping SMS.');
    return;
  }

  const escapedName = escapeHtml(name);
  const message = role === 'cardholder'
    ? `Welcome to Anna Seva Portal, ${escapedName}! Your cardholder account is now active. You can book tokens and manage your ration entitlements. Login at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}`
    : `Welcome to Anna Seva Portal, ${escapedName}! Your distributor account for ${escapedName} is now active. Start managing your Fair Price Shop operations. Login at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    });
    console.log(`Welcome SMS sent to ${phone}`);
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
  }
}

export async function sendTokenBookingSMS(
  phone: string,
  name: string,
  tokenNumber: string,
  shopName: string
) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('SMS service not configured. Skipping SMS.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedTokenNumber = escapeHtml(tokenNumber);
  const escapedShopName = escapeHtml(shopName);
  const message = `Dear ${escapedName}, your token #${escapedTokenNumber} has been booked successfully at ${escapedShopName}. Please bring your ration card for collection. - Anna Seva Portal`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    });
    console.log(`Token booking SMS sent to ${phone}`);
  } catch (error) {
    console.error('Error sending token booking SMS:', error);
  }
}

export async function sendDistributionConfirmationSMS(
  phone: string,
  name: string,
  tokenNumber: string,
  items: string
) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('SMS service not configured. Skipping SMS.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedTokenNumber = escapeHtml(tokenNumber);
  const escapedItems = escapeHtml(items);
  const message = `Dear ${escapedName}, your food grains (${escapedItems}) for token #${escapedTokenNumber} have been distributed successfully. Thank you for using Anna Seva Portal.`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    });
    console.log(`Distribution confirmation SMS sent to ${phone}`);
  } catch (error) {
    console.error('Error sending distribution confirmation SMS:', error);
  }
}

export async function sendDistributionCycleAnnouncementSMS(
  phone: string,
  name: string,
  distributorName: string,
  cycleStartDate: string
) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('SMS service not configured. Skipping SMS.');
    return;
  }

  const escapedName = escapeHtml(name);
  const escapedDistributorName = escapeHtml(distributorName);
  const escapedCycleStartDate = escapeHtml(cycleStartDate);
  const message = `Dear ${escapedName}, a new distribution cycle has been announced by ${escapedDistributorName}. Distribution starts on ${escapedCycleStartDate}. Visit your dashboard to book your tokens. - Anna Seva Portal`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    });
    console.log(`Distribution cycle announcement SMS sent to ${phone}`);
  } catch (error) {
    console.error('Error sending distribution cycle announcement SMS:', error);
  }
}

