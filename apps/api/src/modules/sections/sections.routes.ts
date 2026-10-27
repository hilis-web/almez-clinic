import { Router } from "express";
import {
  createSectionController,
  getPublishedSectionsController,
  getPublishedSectionByIdController,
  getAllSectionsForAdminController,
  saveSectionContentController,
  getPublishedSectionItemByIdController,
  updateSectionController,
  deleteSectionController,
  updateCategoryController,
  deleteCategoryController,
  updateSectionItemController,
  deleteSectionItemController,
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

router.patch("/:id", authMiddleware, requireAdmin, updateSectionController);

router.delete("/:id", authMiddleware, requireAdmin, deleteSectionController);

router.patch(
  "/categories/:id",
  authMiddleware,
  requireAdmin,
  updateCategoryController,
);

router.delete(
  "/categories/:id",
  authMiddleware,
  requireAdmin,
  deleteCategoryController,
);

router.patch(
  "/items/:id",
  authMiddleware,
  requireAdmin,
  updateSectionItemController,
);

router.delete(
  "/items/:id",
  authMiddleware,
  requireAdmin,
  deleteSectionItemController,
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
