import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createSection,
  getPublishedSections,
  updateSection,
  deleteSection,
  getPublishedSectionById,
  saveSectionContent,
  getAllSectionsForAdmin,
  getPublishedSectionItemById,
  deleteCategory,
  updateCategory,
  updateSectionItem,
  deleteSectionItem,
} from "./sections.service";

const localizedTextSchema = z.object({
  ar: z.string().optional(),
  en: z.string().optional(),
  es: z.string().optional(),
});

const createSectionSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  imageUrl: z.string().url().nullable().optional(),
  status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const contentStatusSchema = z.enum(["PUBLISHED", "UNPUBLISHED"]);

const sectionInputSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  imageUrl: z.string().url().nullable().optional(),
  status: contentStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const categoryInputSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  imageUrl: z.string().url().nullable().optional(),
  toolTip: localizedTextSchema.nullable().optional(),
  status: contentStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const itemInputSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  content: localizedTextSchema,
  imageUrl: z.string().url().nullable().optional(),
  toolTip: localizedTextSchema.nullable().optional(),
  status: contentStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const saveSectionContentSchema = z
  .object({
    sectionId: z.string().uuid().optional(),
    section: sectionInputSchema.optional(),
    categoryId: z.string().uuid().optional(),
    category: categoryInputSchema.optional(),
    items: z.array(itemInputSchema).min(1),
  })
  .refine((data) => Boolean(data.sectionId) !== Boolean(data.section), {
    message: "Provide either sectionId or section data, but not both.",
    path: ["sectionId"],
  })
  .refine((data) => Boolean(data.categoryId) !== Boolean(data.category), {
    message: "Provide either categoryId or category data, but not both.",
    path: ["categoryId"],
  });

export async function getPublishedSectionsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sections = await getPublishedSections();

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublishedSectionByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !z.string().uuid().safeParse(id).success) {
      res.status(400).json({
        success: false,
        message: "Invalid section ID.",
      });
      return;
    }

    const section = await getPublishedSectionById(id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSectionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createSectionSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid section data.",
        details: parsed.error.flatten(),
      });
      return;
    }

    const section = await createSection(parsed.data);

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveSectionContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = saveSectionContentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid section content data.",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.map(String).join("."),
          message: issue.message,
        })),
      });
    }
    const result = await saveSectionContent(parsed.data);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        SECTION_NOT_FOUND: "The selected section was not found.",
        CATEGORY_NOT_FOUND: "The selected category was not found.",
        CATEGORY_SECTION_MISMATCH:
          "The selected category does not belong to the selected section.",
        SECTION_DATA_REQUIRED: "Section data is required.",
        CATEGORY_DATA_REQUIRED: "Category data is required.",
        ITEMS_REQUIRED: "At least one item is required.",
      };

      const message = messages[error.message];

      if (message) {
        res.status(400).json({ error: message });
        return;
      }
    }

    next(error);
  }
}

export async function getAllSectionsForAdminController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sections = await getAllSectionsForAdmin();

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublishedSectionItemByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sectionId = req.params.sectionId;
    const categoryId = req.params.categoryId;
    const itemId = req.params.itemId;

    if (
      typeof sectionId !== "string" ||
      typeof categoryId !== "string" ||
      typeof itemId !== "string" ||
      !z.string().uuid().safeParse(sectionId).success ||
      !z.string().uuid().safeParse(categoryId).success ||
      !z.string().uuid().safeParse(itemId).success
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid section, category, or item ID.",
      });
      return;
    }

    const item = await getPublishedSectionItemById(
      sectionId,
      categoryId,
      itemId,
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

const updateSectionSchema = z
  .object({
    title: localizedTextSchema.optional(),
    description: localizedTextSchema.optional(),
    imageUrl: z.string().url().nullable().optional(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export async function updateSectionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const parsed = updateSectionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid section data.",
      details: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  try {
    const sectionId = req.params.id;

    if (typeof sectionId !== "string" || !sectionId.trim()) {
      return res.status(400).json({
        error: "Invalid section ID.",
      });
    }

    const section = await updateSection(
      sectionId,
      parsed.data,
      req.user.id,
      req.ip ?? null,
    );

    return res.status(200).json({ section });
  } catch (error) {
    if (error instanceof Error && error.message === "SECTION_NOT_FOUND") {
      return res.status(404).json({
        error: "Section not found.",
      });
    }

    return next(error);
  }
}

export async function deleteSectionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  try {
    const sectionId = req.params.id;

    if (typeof sectionId !== "string" || !sectionId.trim()) {
      return res.status(400).json({
        error: "Invalid section ID.",
      });
    }
    await deleteSection(sectionId, req.user.id, req.ip ?? null);

    return res.status(200).json({
      message: "Section deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SECTION_NOT_FOUND") {
      return res.status(404).json({
        error: "Section not found.",
      });
    }

    return next(error);
  }
}

export async function updateCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const parsed = z
    .object({
      title: localizedTextSchema.optional(),
      description: localizedTextSchema.optional(),
      imageUrl: z.string().url().nullable().optional(),
      toolTip: localizedTextSchema.nullable().optional(),
      status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
      sortOrder: z.number().int().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid category data.",
      details: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const categoryId = req.params.id;

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return res.status(400).json({ error: "Invalid category ID." });
  }

  try {
    const category = await updateCategory(
      categoryId,
      parsed.data,
      req.user.id,
      req.ip ?? null,
    );

    return res.status(200).json({ category });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ error: "Category not found." });
    }

    return next(error);
  }
}

export async function deleteCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const categoryId = req.params.id;

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return res.status(400).json({ error: "Invalid category ID." });
  }

  try {
    await deleteCategory(categoryId, req.user.id, req.ip ?? null);

    return res.status(200).json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ error: "Category not found." });
    }

    return next(error);
  }
}

export async function updateSectionItemController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const parsed = z
    .object({
      title: localizedTextSchema.optional(),
      description: localizedTextSchema.optional(),
      content: localizedTextSchema.optional(),
      imageUrl: z.string().url().nullable().optional(),
      toolTip: localizedTextSchema.nullable().optional(),
      status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
      sortOrder: z.number().int().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid item data.",
      details: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const itemId = req.params.id;

  if (typeof itemId !== "string" || !itemId.trim()) {
    return res.status(400).json({ error: "Invalid item ID." });
  }

  try {
    const item = await updateSectionItem(
      itemId,
      parsed.data,
      req.user.id,
      req.ip ?? null,
    );

    return res.status(200).json({ item });
  } catch (error) {
    if (error instanceof Error && error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ error: "Item not found." });
    }

    return next(error);
  }
}

export async function deleteSectionItemController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const itemId = req.params.id;

  if (typeof itemId !== "string" || !itemId.trim()) {
    return res.status(400).json({ error: "Invalid item ID." });
  }

  try {
    await deleteSectionItem(itemId, req.user.id, req.ip ?? null);

    return res.status(200).json({
      message: "Item deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ error: "Item not found." });
    }

    return next(error);
  }
}
