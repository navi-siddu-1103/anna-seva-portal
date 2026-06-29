import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');
    const passwordResets = db.collection('passwordResets');

    // Find user (return success even if user not found — security best practice)
    const user = await users.findOne({ email: email.toLowerCase() });

    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Remove any previous tokens for this email
      await passwordResets.deleteMany({ email: email.toLowerCase() });

      // Store reset token in DB
      await passwordResets.insertOne({
        email: email.toLowerCase(),
        token,
        expiresAt,
        createdAt: new Date(),
      });

      // Build reset URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
      const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

      // Send email via SMTP (nodemailer)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Anna Seva Portal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔑 Reset Your Password — Anna Seva Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D97706; font-size: 28px; margin: 0;">Anna Seva Portal</h1>
              <p style="color: #6B7280; font-size: 14px;">A Digital India Initiative</p>
            </div>

            <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #92400E; margin: 0 0 8px 0; font-size: 20px;">Password Reset Request</h2>
              <p style="color: #78350F; margin: 0; font-size: 14px;">
                We received a request to reset the password for your Anna Seva Portal account.
              </p>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Hello <strong>${user.name || email}</strong>,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #D97706; color: white; padding: 14px 32px; text-decoration: none; 
                        border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>

            <p style="color: #6B7280; font-size: 13px; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>

            <p style="color: #9CA3AF; font-size: 12px; margin-top: 8px;">
              Or copy this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #D97706; word-break: break-all;">${resetUrl}</a>
            </p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Anna Seva Portal. All rights reserved.
            </p>
          </div>
        `,
      });
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      ok: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
