import "../config/loadEnv.mjs";
import { generateOTP } from "./generateOTP.mjs";
import nodemailer from "nodemailer";

const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
  port: emailPort,
  secure: emailPort === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify()
    .then(() => console.log("Email service ready"))
    .catch((err) => console.error("Email service verification failed:", err.message));
}

export const sendOtp = async (toEmail) => {
  try {
    const otp = generateOTP();
    console.log("OTP GENERATED:", otp);
    console.log("SENDING OTP TO:", toEmail);

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

    console.log("Email sent:", info.messageId);
    return otp;
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw new Error("OTP email failed");
  }
};
