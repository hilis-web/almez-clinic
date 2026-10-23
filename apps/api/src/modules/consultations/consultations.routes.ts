import { Router } from "express";
import {
  createConsultationController,
  getConsultationsController,
} from "./consultations.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Protected: staff must be authenticated to view consultations.
router.get("/", authMiddleware, getConsultationsController);

// Public: visitors can submit consultation requests.
router.post("/", createConsultationController);

export default router;
