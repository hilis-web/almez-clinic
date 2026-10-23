import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email SMTP configuration is incomplete.");
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass: pass.replace(/\s/g, ""),
    },
  };
}

export async function sendEmail(options: Omit<SendMailOptions, "from">) {
  const config = getEmailConfig();

  const transporter = nodemailer.createTransport(config);

  try {
    return await transporter.sendMail({
      ...options,
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
    });
  } finally {
    transporter.close();
  }
}
