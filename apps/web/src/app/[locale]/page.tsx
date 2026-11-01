import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HeroCarousel from "../components/HeroCarousel";
import AboutClinic from "../components/AboutClinic";
import ConsultationForm from "../components/ConsultationForm";
import SectionsShowcase from "../components/SectionsShowcase";
import SponsorsBanner from "../components/SponsorsBanner";
import FreeConsultationCTA from "../components/FreeConsultationCTA";
import ClinicStructuredData from "../components/ClinicStructuredData";
type Locale = "es" | "en";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

export const metadata: Metadata = {
  title: "Almez | Atención médica",
  description:
    "Descubre los servicios médicos de Almez y solicita una consulta con nuestro equipo médico.",
  alternates: {
    canonical: "/es",
    languages: {
      es: "/es",
      en: "/en",
    },
  },
  openGraph: {
    title: "Almez | Atención médica",
    description:
      "Descubre los servicios médicos de Almez y solicita una consulta con nuestro equipo médico.",
    url: "/es",
    siteName: "Almez",
    type: "website",
    locale: "es_ES",
  },
};

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  return (
    <main className="almez-home">
      <ClinicStructuredData locale={locale} />

      <HeroCarousel />
      <AboutClinic />
      <SectionsShowcase />
      <SponsorsBanner />

      <ConsultationForm variant="inline" />
      <ConsultationForm variant="floating" />
      <FreeConsultationCTA />
    </main>
  );
}
