import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import CategoryPage from "../../../../../sections/[id]/categories/[categoryId]/page";

import { getPublishedCategory, getLocalizedText } from "@/lib/server/sections";

type Locale = "es" | "en";

interface CategoryRouteProps {
  params: Promise<{
    locale: string;
    id: string;
    categoryId: string;
  }>;
}

async function getCachedCategory(sectionId: string, categoryId: string) {
  "use cache";

  try {
    return await getPublishedCategory(sectionId, categoryId);
  } catch (error) {
    console.error("Failed to load category:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryRouteProps): Promise<Metadata> {
  const { locale, id, categoryId } = await params;

  if (locale !== "es" && locale !== "en") {
    return {};
  }

  const language = locale as Locale;

  const result = await getCachedCategory(id, categoryId);

  if (!result) {
    return {};
  }

  const { category } = result;

  const title = getLocalizedText(category.title, language);
  const description = getLocalizedText(category.description, language);

  const pageTitle = title
    ? `${title} | Almez`
    : language === "es"
      ? "Categoría médica | Almez"
      : "Medical Category | Almez";

  const pageDescription =
    description ||
    (language === "es"
      ? "Descubre esta categoría de servicios médicos en Almez."
      : "Discover this medical services category at Almez.");

  const url = `/${locale}/sections/${id}/categories/${categoryId}`;

  return {
    title: pageTitle,
    description: pageDescription,

    alternates: {
      canonical: url,
      languages: {
        es: `/es/sections/${id}/categories/${categoryId}`,
        en: `/en/sections/${id}/categories/${categoryId}`,
      },
    },

    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: "Almez",
      type: "website",
      locale: language === "es" ? "es_ES" : "en_US",
    },
  };
}

async function ConnectionMarker() {
  await connection();
  return null;
}

async function CategoryPageContent({ params }: CategoryRouteProps) {
  const { locale, id, categoryId } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  const result = await getCachedCategory(id, categoryId);

  if (!result) {
    notFound();
  }

  const { section, category } = result;

  return <CategoryPage initialSection={section} initialCategory={category} />;
}

export default function LocalizedCategoryPage({ params }: CategoryRouteProps) {
  return (
    <>
      <Suspense fallback={null}>
        <CategoryPageContent params={params} />
      </Suspense>

      <Suspense fallback={null}>
        <ConnectionMarker />
      </Suspense>
    </>
  );
}
