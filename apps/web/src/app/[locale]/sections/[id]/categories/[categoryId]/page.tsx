import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import CategoryPage from "../../../../../sections/[id]/categories/[categoryId]/page";

type Locale = "es" | "en";

interface CategoryRouteProps {
  params: Promise<{
    locale: string;
    id: string;
    categoryId: string;
  }>;
}

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

type ContentStatus = "PUBLISHED" | "UNPUBLISHED";

interface SectionItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
}

interface Category {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
  items: SectionItem[];
}

interface Section {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  categories: Category[];
}

function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value[locale] || value.es || value.en || value.ar || "";
}

async function getCategory(
  id: string,
  categoryId: string,
): Promise<Category | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(
      `${apiUrl}/api/sections/${encodeURIComponent(id)}`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return null;

    const result = await response.json();

    if (!result.success || !result.data) return null;

    const section = result.data as Section;

    return (
      section.categories?.find((category) => category.id === categoryId) ?? null
    );
  } catch {
    return null;
  }
}

async function getSection(id: string): Promise<Section | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(
      `${apiUrl}/api/sections/${encodeURIComponent(id)}`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return null;

    const result = await response.json();

    if (!result.success || !result.data) return null;

    return result.data as Section;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryRouteProps): Promise<Metadata> {
  const { locale, id, categoryId } = await params;

  if (locale !== "es" && locale !== "en") return {};

  const language = locale as Locale;

  const category = await getCategory(id, categoryId);

  if (!category) return {};

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

  const section = await getSection(id);

  if (!section) {
    notFound();
  }

  const category =
    section.categories?.find((item) => item.id === categoryId) ?? null;

  if (!category) {
    notFound();
  }

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
