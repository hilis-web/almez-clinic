import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ConsultationForm from "../../components/ConsultationForm";

interface ConsultationPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: ConsultationPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") return {};

  const isSpanish = locale === "es";

  const title = isSpanish
    ? "Solicitar consulta | Almez"
    : "Request a Consultation | Almez";

  const description = isSpanish
    ? "Solicita una consulta con nuestro equipo médico en Almez."
    : "Request a consultation with the medical team at Almez.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/consultation`,
      languages: {
        es: "/es/consultation",
        en: "/en/consultation",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/consultation`,
      siteName: "Almez",
      type: "website",
      locale: isSpanish ? "es_ES" : "en_US",
    },
  };
}

export default async function ConsultationPage({
  params,
}: ConsultationPageProps) {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ConsultationForm />
    </main>
  );
}
