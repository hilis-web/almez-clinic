import type { Metadata } from "next";
import HeroCarousel from "./components/HeroCarousel";
import AboutClinic from "./components/AboutClinic";
import ConsultationForm from "./components/ConsultationForm";
import SectionsShowcase from "./components/SectionsShowcase";
import SponsorsBanner from "./components/SponsorsBanner";
import FreeConsultationCTA from "./components/FreeConsultationCTA";
export const metadata: Metadata = {
  title: "Almez | Medical Care",
  description:
    "Discover Almez medical services and request a consultation with our medical team.",
  openGraph: {
    title: "Almez | Medical Care",
    description:
      "Discover Almez medical services and request a consultation with our medical team.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="almez-home">
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
