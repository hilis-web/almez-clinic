import { Router } from "express";
import {
  createSectionController,
  getPublishedSectionsController,
  getPublishedSectionByIdController,
  getAllSectionsForAdminController,
  saveSectionContentController,
  getPublishedSectionItemByIdController,
} from "./sections.controller";

import { authMiddleware, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

// Public: fetch published sections
router.get("/", getPublishedSectionsController);
router.get(
  "/admin",
  authMiddleware,
  requireAdmin,
  getAllSectionsForAdminController,
);
router.get(
  "/:sectionId/categories/:categoryId/items/:itemId",
  getPublishedSectionItemByIdController,
);

// Public: fetch one published section by ID
router.get("/:id", getPublishedSectionByIdController);

// Admin only: create a section
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  createSectionController,
  saveSectionContentController,
);

router.post(
  "/save-content",
  authMiddleware,
  requireAdmin,
  saveSectionContentController,
);

export default router;
