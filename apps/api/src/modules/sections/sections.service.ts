import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { SectionContentStatus } from "../../generated/prisma/client";

export async function getPublishedSections() {
  return prisma.section.findMany({
    where: {
      status: SectionContentStatus.PUBLISHED,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      categories: {
        where: {
          status: SectionContentStatus.PUBLISHED,
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          items: {
            where: {
              status: SectionContentStatus.PUBLISHED,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getPublishedSectionById(id: string) {
  return prisma.section.findFirst({
    where: {
      id,
      status: SectionContentStatus.PUBLISHED,
    },
    include: {
      categories: {
        where: {
          status: SectionContentStatus.PUBLISHED,
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          items: {
            where: {
              status: SectionContentStatus.PUBLISHED,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getPublishedSectionItemById(
  sectionId: string,
  categoryId: string,
  itemId: string,
) {
  return prisma.sectionItem.findFirst({
    where: {
      id: itemId,
      categoryId,
      status: SectionContentStatus.PUBLISHED,
      category: {
        sectionId,
        status: SectionContentStatus.PUBLISHED,
        section: {
          status: SectionContentStatus.PUBLISHED,
        },
      },
    },
  });
}

export async function getAllSectionsForAdmin() {
  return prisma.section.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

interface CreateSectionInput {
  title: {
    ar?: string;
    en?: string;
    es?: string;
  };
  description: {
    ar?: string;
    en?: string;
    es?: string;
  };
  imageUrl?: string | null;
  status?: "PUBLISHED" | "UNPUBLISHED";
  sortOrder?: number;
}

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

type ContentStatus = "PUBLISHED" | "UNPUBLISHED";

interface CreateSectionItemInput {
  title: LocalizedText;
  description: LocalizedText;
  content: LocalizedText;
  imageUrl?: string | null;
  toolTip?: LocalizedText | null;
  status?: ContentStatus;
  sortOrder?: number;
}

interface SaveSectionContentInput {
  sectionId?: string;
  section?: {
    title: LocalizedText;
    description: LocalizedText;
    imageUrl?: string | null;
    status?: ContentStatus;
    sortOrder?: number;
  };
  categoryId?: string;
  category?: {
    title: LocalizedText;
    description: LocalizedText;
    imageUrl?: string | null;
    toolTip?: LocalizedText | null;
    status?: ContentStatus;
    sortOrder?: number;
  };
  items: CreateSectionItemInput[];
}

export async function saveSectionContent(input: SaveSectionContentInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Use an existing section or create a new one.
    let sectionId = input.sectionId;

    if (sectionId) {
      const existingSection = await tx.section.findUnique({
        where: { id: sectionId },
        select: { id: true },
      });

      if (!existingSection) {
        throw new Error("SECTION_NOT_FOUND");
      }
    } else {
      if (!input.section) {
        throw new Error("SECTION_DATA_REQUIRED");
      }

      const section = await tx.section.create({
        data: {
          title: input.section.title,
          description: input.section.description,
          imageUrl: input.section.imageUrl ?? null,
          status: input.section.status ?? "UNPUBLISHED",
          sortOrder: input.section.sortOrder ?? 0,
        },
        select: { id: true },
      });

      sectionId = section.id;
    }

    // 2. Use an existing category or create a new one.
    let categoryId = input.categoryId;

    if (categoryId) {
      const existingCategory = await tx.sectionCategory.findUnique({
        where: { id: categoryId },
        select: { id: true, sectionId: true },
      });

      if (!existingCategory) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      if (existingCategory.sectionId !== sectionId) {
        throw new Error("CATEGORY_SECTION_MISMATCH");
      }
    } else {
      if (!input.category) {
        throw new Error("CATEGORY_DATA_REQUIRED");
      }

      const category = await tx.sectionCategory.create({
        data: {
          sectionId,
          title: input.category.title,
          description: input.category.description,
          imageUrl: input.category.imageUrl ?? null,
          toolTip: input.category.toolTip ?? undefined,
          status: input.category.status ?? "UNPUBLISHED",
          sortOrder: input.category.sortOrder ?? 0,
        },
        select: { id: true },
      });

      categoryId = category.id;
    }

    // 3. Create the new items under the selected category.
    if (input.items.length === 0) {
      throw new Error("ITEMS_REQUIRED");
    }

    await tx.sectionItem.createMany({
      data: input.items.map((item, index) => ({
        categoryId: categoryId!,
        title: item.title,
        description: item.description,
        content: item.content,
        imageUrl: item.imageUrl ?? null,
        toolTip: item.toolTip ?? undefined,
        status: item.status ?? "UNPUBLISHED",
        sortOrder: item.sortOrder ?? index,
      })),
    });

    // 4. Return the complete saved structure.
    return tx.section.findUniqueOrThrow({
      where: { id: sectionId },
      include: {
        categories: {
          where: { id: categoryId },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  });
}

export async function createSection(input: CreateSectionInput) {
  const data: Prisma.SectionCreateInput = {
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl ?? null,
    status: input.status ?? SectionContentStatus.UNPUBLISHED,
    sortOrder: input.sortOrder ?? 0,
  };

  return prisma.section.create({ data });
}
