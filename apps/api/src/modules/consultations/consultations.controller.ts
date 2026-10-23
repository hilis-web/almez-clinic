import type { Request, Response } from "express";
import { consultationSchema } from "./consultations.validation";
import { createConsultation } from "./consultations.service";
import { getConsultations } from "./consultations.service";
export async function createConsultationController(
  req: Request,
  res: Response,
) {
  const validation = consultationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid consultation request.",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const consultation = await createConsultation(validation.data);

    return res.status(201).json({
      message: "Consultation request submitted successfully.",
      consultation,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "RecaptchaVerificationError") {
      return res.status(403).json({
        error: error.message,
      });
    }

    console.error("Failed to create consultation request:", error);

    return res.status(500).json({
      error: "Unable to submit consultation request.",
    });
  }
}

export async function getConsultationsController(_req: Request, res: Response) {
  try {
    const consultations = await getConsultations();

    return res.status(200).json({
      consultations,
    });
  } catch (error) {
    console.error("Failed to fetch consultations:", error);

    return res.status(500).json({
      error: "Unable to fetch consultations.",
    });
  }
}
