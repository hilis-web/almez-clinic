import { z } from "zod";

export const consultationTypes = [
  "new_patient",
  "second_opinion",
  "follow_up",
  "online",
  "post_surgery",
  "other",
] as const;

export const consultationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(200, "Full name cannot exceed 200 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(254, "Email cannot exceed 254 characters.")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(30, "Phone cannot exceed 30 characters."),

  consultationType: z.enum(consultationTypes),
  language: z.enum(["es", "en"]).optional().default("es"),
  additionalInfo: z
    .string()
    .trim()
    .max(5000, "Additional information cannot exceed 5000 characters.")
    .optional()
    .transform((value) => value || undefined),

  recaptchaToken: z.string().min(1, "reCAPTCHA token is required.").max(5000),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
