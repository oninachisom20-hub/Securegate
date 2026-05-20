import nodemailer from "nodemailer";

const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

const gmailUser = process.env.GMAIL_USER || "noreply@securegate.app";
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verify?token=${token}`;

  if (!transporter) {
    console.log("Mock Email: Verification link ->", confirmLink);
    return;
  }

  await transporter.sendMail({
    from: gmailUser,
    to: email,
    subject: "Verify your SecureGate account",
    html: `<p>Click <a href="${confirmLink}">here</a> to verify email.</p><p>This link expires in 15 minutes.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  if (!transporter) {
    console.log("Mock Email: Password reset link ->", resetLink);
    return;
  }

  await transporter.sendMail({
    from: gmailUser,
    to: email,
    subject: "Reset your SecureGate password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p><p>This link expires in 1 hour.</p>`,
  });
};
