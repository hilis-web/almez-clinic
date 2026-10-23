import { prisma } from "../../lib/prisma";
import { verifyRecaptcha } from "../../lib/recaptcha";
import { sendEmail } from "../../lib/email";
import {
  createAdminConsultationEmail,
  createClientConsultationEmail,
} from "../../lib/consultation-emails";
import type { ConsultationInput } from "./consultations.validation";

export async function createConsultation(input: ConsultationInput) {
  const isHuman = await verifyRecaptcha(input.recaptchaToken);

  if (!isHuman) {
    const error = new Error("reCAPTCHA verification failed. Please try again.");
    error.name = "RecaptchaVerificationError";
    throw error;
  }

  // Save the consultation before attempting to send emails.
  const consultation = await prisma.consultationRequest.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      consultationType: input.consultationType,
      additionalInfo: input.additionalInfo,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  const emailData = {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    consultationType: input.consultationType,
    additionalInfo: input.additionalInfo,
    language: input.language,
  };

  const adminEmail = process.env.CONSULTATION_ADMIN_EMAIL;

  // Email failures must not undo or invalidate the saved consultation.
  const emailTasks: Promise<unknown>[] = [
    (async () => {
      const message = createClientConsultationEmail(emailData);

      await sendEmail({
        to: input.email,
        subject: message.subject,
        html: message.html,
      });
    })(),
  ];

  if (adminEmail) {
    emailTasks.push(
      (async () => {
        const message = createAdminConsultationEmail(emailData);

        await sendEmail({
          to: adminEmail,
          subject: message.subject,
          html: message.html,
        });
      })(),
    );
  } else {
    console.error(
      "CONSULTATION_ADMIN_EMAIL is not configured; admin notification skipped.",
    );
  }

  const emailResults = await Promise.allSettled(emailTasks);

  emailResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        index === 0
          ? "Failed to send consultation confirmation email."
          : "Failed to send consultation admin notification.",
        result.reason,
      );
    }
  });

  return consultation;
}

export async function getConsultations() {
  return prisma.consultationRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
      consultationType: true,
      additionalInfo: true,
      status: true,
      assignedToId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
