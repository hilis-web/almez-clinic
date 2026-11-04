import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import SectionContentLoading from "@/app/components/SectionContentLoading";
import SectionPageClient from "../../../sections/[id]/SectionPageClient";
import {
  getPublishedSection,
  getLocalizedText,
  type Section,
} from "@/lib/server/sections";

type Locale = "es" | "en";

interface SectionPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

async function getCachedSection(id: string): Promise<Section | null> {
  "use cache";

  try {
    return await getPublishedSection(id);
  } catch {
    return null;
  }
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
  const { locale, id } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  const section = await getPublishedSection(id);

  if (!section) {
    notFound();
  }

  return <SectionPageClient initialSection={section} locale={locale} />;
}

export default function SectionPage({ params }: SectionPageProps) {
  return (
    <>
      <Suspense fallback={<SectionContentLoading type="section" />}>
        <SectionPageContent params={params} />
      </Suspense>

      <Suspense fallback={null}>
        <ConnectionMarker />
      </Suspense>
    </>
  );
}
