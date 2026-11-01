interface ClinicStructuredDataProps {
  locale: "es" | "en";
}

const BASE_URL = "https://almez-clinic.vercel.app";

export default function ClinicStructuredData({
  locale,
}: ClinicStructuredDataProps) {
  const description =
    locale === "es"
      ? "Clínica especializada en atención médica y consultas personalizadas."
      : "A clinic providing medical care and personalized consultations.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${BASE_URL}/#medical-clinic`,
    name: "Almez",
    url: `${BASE_URL}/${locale}`,
    description,
    availableLanguage: ["Spanish", "English"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
