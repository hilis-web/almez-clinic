import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import SectionPageClient from "../../../sections/[id]/SectionPageClient";

type Locale = "es" | "en";

interface SectionPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

type LocalizedText = {
  es?: string;
  en?: string;
};

interface Section {
  id: string;
  title: LocalizedText | string;
  description: LocalizedText | string;
  status?: string;
}

function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value[locale] || value.es || value.en || "";
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

async function getCachedSection(id: string): Promise<Section | null> {
  "use cache";

  return getSection(id);
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  "use cache";

  const { locale, id } = await params;

  if (locale !== "es" && locale !== "en") return {};

  const language = locale as Locale;
  const section = await getCachedSection(id);
  if (!section) return {};

  const title = getLocalizedText(section.title, language);
  const description = getLocalizedText(section.description, language);

  const pageTitle =
    title || (language === "es" ? "Sección médica" : "Medical Section");

  const pageDescription =
    description ||
    (language === "es"
      ? "Descubre nuestros servicios médicos en Almez."
      : "Discover our medical services at Almez.");

  return {
    title: pageTitle,
    description: pageDescription,

    alternates: {
      canonical: `/${locale}/sections/${id}`,
      languages: {
        es: `/es/sections/${id}`,
        en: `/en/sections/${id}`,
      },
    },

    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/${locale}/sections/${id}`,
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

async function SectionPageContent({ params }: SectionPageProps) {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  return <SectionPageClient />;
}

export default function SectionPage({ params }: SectionPageProps) {
  return (
    <>
      <Suspense
        fallback={
          <main className="almez-section-page">
            <div className="almez-section-page__container">
              <p role="status">Loading section...</p>
            </div>
          </main>
        }
      >
        <SectionPageContent params={params} />
      </Suspense>

      <Suspense fallback={null}>
        <ConnectionMarker />
      </Suspense>
    </>
  );
}
