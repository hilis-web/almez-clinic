import { notFound } from "next/navigation";

import ItemPageClient from "./ItemPageClient";

import {
  getPublishedSection,
  getPublishedSectionItem,
} from "@/lib/server/sections";

interface ItemRouteProps {
  params: Promise<{
    id: string;
    categoryId: string;
    itemId: string;
  }>;
}

async function getCachedItemPageData(
  sectionId: string,
  categoryId: string,
  itemId: string,
) {
  "use cache";

  try {
    const [item, section] = await Promise.all([
      getPublishedSectionItem(sectionId, categoryId, itemId),
      getPublishedSection(sectionId),
    ]);

    if (!item || !section) {
      return null;
    }

    const category =
      section.categories?.find((entry) => entry.id === categoryId) ?? null;

    if (!category) {
      return null;
    }

    return {
      item,
      section,
      category,
    };
  } catch (error) {
    console.error("Failed to load item page data:", error);
    return null;
  }
}

export default async function ItemPage({ params }: ItemRouteProps) {
  const { id, categoryId, itemId } = await params;

  const data = await getCachedItemPageData(id, categoryId, itemId);

  if (!data) {
    notFound();
  }

  return (
    <ItemPageClient
      initialItem={data.item}
      initialSection={data.section}
      initialCategory={data.category}
      locale="es"
    />
  );
}
