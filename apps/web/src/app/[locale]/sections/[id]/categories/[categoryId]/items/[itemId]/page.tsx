import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import SectionContentLoading from "@/app/components/SectionContentLoading";

import ItemPageClient from "../../../../../../../sections/[id]/categories/[categoryId]/items/[itemId]/ItemPageClient";

import {
  getPublishedSection,
  getPublishedSectionItem,
  getLocalizedText,
} from "@/lib/server/sections";

type Locale = "es" | "en";

interface ItemRouteProps {
  params: Promise<{
    locale: string;
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

async function getCachedItemMetadata(
  locale: string,
  id: string,
  categoryId: string,
  itemId: string,
): Promise<Metadata> {
  "use cache";

  if (locale !== "es" && locale !== "en") {
    return {};
  }

  const language = locale as Locale;

  const data = await getCachedItemPageData(id, categoryId, itemId);

  if (!data) {
    return {};
  }

  const title = getLocalizedText(data.item.title, language);

  const description = getLocalizedText(data.item.description, language);

  const pageTitle = title
    ? `${title} | Almez`
    : language === "es"
      ? "Información médica | Almez"
      : "Medical Information | Almez";

  const pageDescription =
    description ||
    (language === "es"
      ? `Información sobre ${title || "este servicio"} en Almez.`
      : `Information about ${title || "this service"} at Almez.`);

  const url = `/${locale}/sections/${id}/categories/${categoryId}/items/${itemId}`;

  return {
    title: pageTitle,
    description: pageDescription,

    alternates: {
      canonical: url,
      languages: {
        es: `/es/sections/${id}/categories/${categoryId}/items/${itemId}`,
        en: `/en/sections/${id}/categories/${categoryId}/items/${itemId}`,
      },
    },

    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: "Almez",
      type: "article",
      locale: language === "es" ? "es_ES" : "en_US",
    },
  };
}

export async function generateMetadata({
  params,
}: ItemRouteProps): Promise<Metadata> {
  const { locale, id, categoryId, itemId } = await params;

  return getCachedItemMetadata(locale, id, categoryId, itemId);
}

async function ConnectionMarker() {
  await connection();
  return null;
}

async function ItemPageContent({ params }: ItemRouteProps) {
  const { locale, id, categoryId, itemId } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const data = await getCachedItemPageData(id, categoryId, itemId);

  if (!data) {
    notFound();
  }

  return (
    <ItemPageClient
      initialItem={data.item}
      initialSection={data.section}
      initialCategory={data.category}
      locale={locale}
    />
  );
}

export default function LocalizedItemPage({ params }: ItemRouteProps) {
  return (
    <>
      <Suspense fallback={<SectionContentLoading type="section" />}>
        <ItemPageContent params={params} />
      </Suspense>

      <Suspense fallback={null}>
        <ConnectionMarker />
      </Suspense>
    </>
  );
}
