import "../config/loadEnv.mjs";
import { generateOTP } from "./generateOTP.mjs";
import nodemailer from "nodemailer";

export const createTransporter = (port) => {
  const p = parseInt(port, 10) || 2525;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port: p,
    secure: false,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendOtp = async (toEmail) => {
  // Try port 2525 first (port 587 is blocked by Render's firewall)
  const portsToTry = [2525, 587];
  const portErrors = [];

  for (const port of portsToTry) {
    try {
      console.log(`Attempting OTP email delivery via port ${port}...`);
      const transporter = createTransporter(port);
      const otp = generateOTP();

      const info = await transporter.sendMail({
        from: `"HostelPulse" <${process.env.EMAIL_SENDER || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Verify Your Email | HostelPulse",

        text: `
Hello,

Welcome to HostelPulse!

Your One-Time Password (OTP) for email verification is: ${otp}

This code is valid for 10 minutes. Please do not share it with anyone.

If you did not request this verification code, you can safely ignore this email.

Regards,
Team HostelPulse

This is an automated email. Please do not reply.
        `.trim(),

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; color: #1f2937; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #2563eb; margin-bottom: 8px;">HostelPulse</h2>
            <h3 style="margin-top: 24px;">Verify your email address</h3>
            <p>Hello,</p>
            <p>Welcome to <strong>HostelPulse</strong>! Use the verification code below to verify your email address and continue creating your account.</p>
            <div style="text-align: center; margin: 28px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">YOUR VERIFICATION CODE</p>
              <h1 style="margin: 0; letter-spacing: 8px; color: #2563eb; font-size: 32px;">${otp}</h1>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #b91c1c;">
              <strong>Security reminder:</strong> Never share this OTP with anyone. HostelPulse will never ask you to disclose your verification code.
            </p>
            <p>If you did not request this verification code, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">
              Regards,<br>
              <strong>Team HostelPulse</strong><br>
              This is an automated email. Please do not reply.
            </p>
          </div>
        `
      });

      console.log(`✅ Email sent successfully via port ${port}:`, info.messageId);
      return otp;
    } catch (error) {
      console.warn(`⚠️ Port ${port} delivery failed:`, error.message);
      portErrors.push(`Port ${port}: ${error.message}`);
    }
  }

  throw new Error(`OTP email failed: ${portErrors.join(" | ")}`);
};
