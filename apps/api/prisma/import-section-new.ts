import "dotenv/config";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

type MongoId = {
  $oid: string;
};

type MongoDate =
  | string
  | {
      $date: string;
    };

type SourceItem = {
  itemId: MongoId;
  title: unknown;
  description: unknown;
  content: unknown;
  imageUrl?: string | null;
  toolTip?: unknown;
  status?: string;
};

type SourceCategory = {
  categoryId: MongoId;
  title: unknown;
  description: unknown;
  imageUrl?: string | null;
  toolTip?: unknown;
  items: SourceItem[];
  status?: string;
};

type SourceSection = {
  _id: MongoId;
  title: unknown;
  description: unknown;
  imageUrl?: string | null;
  categories: SourceCategory[];
  status?: string;
  createdAt?: MongoDate;
  updatedAt?: MongoDate;
};

function toJson(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    throw new Error("A required JSON field is missing.");
  }

  return value as Prisma.InputJsonValue;
}

function toNullableJson(value: unknown) {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }

  return toJson(value);
}

function sourceId(value: MongoId | undefined, label: string): string {
  if (!value || typeof value.$oid !== "string" || !value.$oid.trim()) {
    throw new Error(`Missing MongoDB ID: ${label}`);
  }

  return value.$oid;
}

/**
 * Produce a stable UUID for each source document.
 * Re-importing the same MongoDB document uses the same PostgreSQL ID.
 */
function stableUuid(kind: string, mongoId: string): string {
  const bytes = createHash("sha256")
    .update(`almez-section-new:${kind}:${mongoId}`)
    .digest()
    .subarray(0, 16);

  // Set UUID version and variant bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function toStatus(status: string | undefined) {
  return status?.toLowerCase() === "published" ? "PUBLISHED" : "UNPUBLISHED";
}

function toDate(value: MongoDate | undefined, label: string): Date {
  if (!value) {
    throw new Error(`Missing date: ${label}`);
  }

  const raw = typeof value === "string" ? value : value.$date;
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${label}`);
  }

  return date;
}

function optionalImage(value: string | null | undefined) {
  return value ?? null;
}

async function main() {
  const filePath = path.resolve(process.cwd(), "prisma/data/section-new.json");

  const fileContent = await readFile(filePath, "utf8");
  const sections = JSON.parse(fileContent) as SourceSection[];

  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error("The JSON file must contain a non-empty array.");
  }

  let categoryCount = 0;
  let itemCount = 0;

  // Validate the entire export before any database writes.
  for (const section of sections) {
    sourceId(section._id, "section");

    if (
      section.title == null ||
      section.description == null ||
      !Array.isArray(section.categories)
    ) {
      throw new Error(
        `Invalid section data: ${sourceId(section._id, "section")}`,
      );
    }

    toDate(section.createdAt, "section.createdAt");
    toDate(section.updatedAt, "section.updatedAt");

    categoryCount += section.categories.length;

    for (const category of section.categories) {
      sourceId(category.categoryId, "category");

      if (
        category.title == null ||
        category.description == null ||
        !Array.isArray(category.items)
      ) {
        throw new Error(
          `Invalid category data: ${sourceId(category.categoryId, "category")}`,
        );
      }

      itemCount += category.items.length;

      for (const item of category.items) {
        sourceId(item.itemId, "item");

        if (
          item.title == null ||
          item.description == null ||
          item.content == null
        ) {
          throw new Error(
            `Required item content is missing: ${sourceId(item.itemId, "item")}`,
          );
        }
      }
    }
  }

  console.log("SectionNew export validated.");
  console.log(`Sections: ${sections.length}`);
  console.log(`Categories: ${categoryCount}`);
  console.log(`Items: ${itemCount}`);
  console.log("Mode:", process.argv.includes("--apply") ? "IMPORT" : "DRY RUN");

  if (!process.argv.includes("--apply")) {
    console.log("\nDry run only. No database records were changed.");
    console.log("Review the counts, then use --apply to import.");
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      for (const [sectionIndex, section] of sections.entries()) {
        const mongoSectionId = sourceId(section._id, "section");
        const sectionId = stableUuid("section", mongoSectionId);

        const sectionData = {
          title: toJson(section.title),
          description: toJson(section.description),
          imageUrl: optionalImage(section.imageUrl),
          status: toStatus(section.status),
          sortOrder: sectionIndex,
          createdAt: toDate(section.createdAt, "section.createdAt"),
          updatedAt: toDate(section.updatedAt, "section.updatedAt"),
        };

        await tx.section.upsert({
          where: { id: sectionId },
          create: {
            id: sectionId,
            ...sectionData,
          },
          update: sectionData,
        });

        for (const [categoryIndex, category] of section.categories.entries()) {
          const mongoCategoryId = sourceId(category.categoryId, "category");
          const categoryId = stableUuid("category", mongoCategoryId);

          const categoryData = {
            sectionId,
            title: toJson(category.title),
            description: toJson(category.description),
            imageUrl: optionalImage(category.imageUrl),
            toolTip: toNullableJson(category.toolTip),
            status: toStatus(category.status),
            sortOrder: categoryIndex,
          };

          await tx.sectionCategory.upsert({
            where: { id: categoryId },
            create: {
              id: categoryId,
              ...categoryData,
            },
            update: categoryData,
          });

          for (const [itemIndex, item] of category.items.entries()) {
            const mongoItemId = sourceId(item.itemId, "item");
            const itemId = stableUuid("item", mongoItemId);

            const itemData = {
              categoryId,
              title: toJson(item.title),
              description: toJson(item.description),
              content: toJson(item.content),
              imageUrl: optionalImage(item.imageUrl),
              toolTip: toNullableJson(item.toolTip),
              status: toStatus(item.status),
              sortOrder: itemIndex,
            };

            await tx.sectionItem.upsert({
              where: { id: itemId },
              create: {
                id: itemId,
                ...itemData,
              },
              update: itemData,
            });
          }
        }
      }
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );

  console.log("\nSectionNew import completed successfully.");
  console.log(`Imported/updated sections: ${sections.length}`);
  console.log(`Imported/updated categories: ${categoryCount}`);
  console.log(`Imported/updated items: ${itemCount}`);
}

main()
  .catch((error: unknown) => {
    console.error("SectionNew import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
