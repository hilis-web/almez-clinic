-- CreateEnum
CREATE TYPE "SectionContentStatus" AS ENUM ('PUBLISHED', 'UNPUBLISHED');

-- CreateTable
CREATE TABLE "sections" (
    "id" UUID NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "image_url" TEXT,
    "status" "SectionContentStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_categories" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "image_url" TEXT,
    "tool_tip" JSONB,
    "status" "SectionContentStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "section_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_items" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "image_url" TEXT,
    "tool_tip" JSONB,
    "status" "SectionContentStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "section_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sections_status_sort_order_idx" ON "sections"("status", "sort_order");

-- CreateIndex
CREATE INDEX "section_categories_section_id_status_sort_order_idx" ON "section_categories"("section_id", "status", "sort_order");

-- CreateIndex
CREATE INDEX "section_items_category_id_status_sort_order_idx" ON "section_items"("category_id", "status", "sort_order");

-- AddForeignKey
ALTER TABLE "section_categories" ADD CONSTRAINT "section_categories_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_items" ADD CONSTRAINT "section_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "section_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
