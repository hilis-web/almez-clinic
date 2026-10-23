"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LegalModalContent from "./LegalModalContent";
type LegalModal = "legal" | "privacy" | "cookies" | null;

type LocalizedText = {
  es?: string;
  en?: string;
};

type FooterSection = {
  id: string;
  title: LocalizedText | string;
  status?: string;
};

function getSectionTitle(
  title: FooterSection["title"],
  language: string,
): string {
  if (typeof title === "string") return title;

  const lang = language.startsWith("en") ? "en" : "es";

  return title[lang] || title.es || title.en || "";
}

export default function SiteFooter() {
  const { t, i18n } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<LegalModal>(null);
  const [sections, setSections] = useState<FooterSection[]>([]);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSections() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(`${apiUrl}/api/sections`);
        if (!response.ok) return;

        const result = await response.json();

        if (!cancelled && result.success && Array.isArray(result.data)) {
          setSections(result.data);
        }
      } catch (error) {
        console.error("Failed to load footer sections:", error);
      }
    }

    loadSections();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  const translate = (key: string, fallback: string) =>
    mounted ? t(key, fallback) : fallback;

  const navigationLinks = [
    { key: "home", href: "/" },
    { key: "about", href: "/#about" },
    { key: "sections", href: "" },
    { key: "treatments", href: "/#treatments" },
    { key: "team", href: "/#team" },
    { key: "contact", href: "/#contact" },
    { key: "bookAppointment", href: "/#contact" },
  ];

  const legalLinks: {
    id: Exclude<LegalModal, null>;
    label: string;
  }[] = [
    {
      id: "legal",
      label: translate("footer.legalNotice", "Aviso legal"),
    },
    {
      id: "privacy",
      label: translate("footer.privacyPolicy", "Política de privacidad"),
    },
    {
      id: "cookies",
      label: translate("footer.cookiePolicy", "Política de cookies"),
    },
  ];

  const modalTitles = {
    legal: translate("footer.legalNotice", "Aviso legal"),
    privacy: translate("footer.privacyPolicy", "Política de privacidad"),
    cookies: translate("footer.cookiePolicy", "Política de cookies"),
  };

  return (
    <>
      <footer className="almez-footer" id="footer">
        <div className="almez-footer__container">
          <div className="almez-footer__main">
            <section className="almez-footer__brand">
              <Link
                href="/"
                className="almez-footer__logo"
                aria-label="Almez — Inicio"
              >
                <span className="almez-footer__logo-mark">A</span>
                <span className="almez-footer__logo-name">
                  ALMEZ<span>.</span>
                </span>
              </Link>

              <div className="almez-footer__specialties">
                <p>{translate("footer.spineSurgery", "Cirugía de Columna")}</p>
                <p>{translate("footer.orthopedics", "Ortopedia")}</p>
                <p>{translate("footer.traumatology", "Traumatología")}</p>
              </div>

              <p className="almez-footer__description">
                {translate(
                  "footer.description",
                  "Atención médica especializada, centrada en tu salud y bienestar.",
                )}
              </p>
            </section>

            <nav
              className="almez-footer__links"
              aria-label={translate(
                "footer.navigationLabel",
                "Navegación del sitio",
              )}
            >
              <h2 className="almez-footer__heading">
                {translate("footer.linksTitle", "Enlaces")}
              </h2>

              <ul>
                {navigationLinks.map((item) => {
                  if (item.key === "sections") {
                    return sections.map((section) => (
                      <li key={section.id}>
                        <Link href={`/sections/${section.id}`}>
                          {getSectionTitle(section.title, i18n.language)}
                        </Link>
                      </li>
                    ));
                  }
                  const labels: Record<string, string> = {
                    home: "Inicio",
                    about: "Sobre la clínica",
                    pathologies: "Patologías",
                    treatments: "Tratamientos",
                    team: "Nuestro equipo",
                    contact: "Contacto",
                    bookAppointment: "Reservar una cita",
                  };

                  const translationKeys: Record<string, string> = {
                    home: "navigation.home",
                    about: "navigation.about",
                    pathologies: "navigation.pathologies",
                    treatments: "navigation.treatments",
                    team: "navigation.team",
                    contact: "navigation.contact",
                    bookAppointment: "navigation.bookAppointment",
                  };

                  return (
                    <li key={item.key}>
                      <Link href={item.href}>
                        {translate(translationKeys[item.key], labels[item.key])}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <section className="almez-footer__contact">
              <h2 className="almez-footer__heading">
                {translate("footer.contactTitle", "Contacto")}
              </h2>

              <ul className="almez-footer__contact-list">
                <li>
                  <span aria-hidden="true">✉</span>
                  <a href="mailto:contact@almez.com">contact@almez.com</a>
                </li>
                <li>
                  <span aria-hidden="true">☎</span>
                  <a href="tel:+346045432">+34 604 5432</a>
                </li>
                <li>
                  <span aria-hidden="true">⌖</span>
                  <a
                    href="https://www.google.com/maps/place/06400+Don+Benito,+Badajoz,+Spain"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Don Benito
                    <br />
                    Badajoz, España
                  </a>
                </li>
              </ul>

              <div className="almez-footer__social">
                <a
                  href="https://www.facebook.com/people/Cl%C3%ADnica-Espalda-Sana/61581704639360/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  f
                </a>
              </div>
            </section>

            <section className="almez-footer__location">
              <h2 className="almez-footer__heading">
                {translate("footer.location", "Ubicación")}
              </h2>

              <a
                className="almez-footer__map"
                href="https://www.google.com/maps/place/06400+Don+Benito,+Badajoz,+Spain"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={translate(
                  "footer.openMap",
                  "Abrir ubicación en Google Maps",
                )}
              >
                <iframe
                  title={translate(
                    "footer.mapTitle",
                    "Ubicación de Almez en Don Benito",
                  )}
                  src="https://www.google.com/maps?q=Don%20Benito%2C%20Badajoz%2C%20Spain&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span>
                  {translate("footer.openMap", "Ver en Google Maps")} ↗
                </span>
              </a>
            </section>
          </div>

          <div className="almez-footer__bottom">
            <p className="almez-footer__copyright">
              © {currentYear ?? ""} ALMEZ.{" "}
              {translate("footer.copyright", "Todos los derechos reservados.")}
            </p>

            <nav
              className="almez-footer__legal"
              aria-label={translate(
                "footer.legalNavigation",
                "Información legal",
              )}
            >
              {legalLinks.map((link, index) => (
                <span className="almez-footer__legal-item" key={link.id}>
                  {index > 0 && (
                    <span
                      className="almez-footer__separator"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}

                  <button type="button" onClick={() => setActiveModal(link.id)}>
                    {link.label}
                  </button>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div
          className="almez-legal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveModal(null);
            }
          }}
        >
          <section
            className="almez-legal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="almez-legal-modal-title"
          >
            <header className="almez-legal-modal__header">
              <div>
                <span className="almez-legal-modal__eyebrow">ALMEZ</span>
                <h2 id="almez-legal-modal-title">{modalTitles[activeModal]}</h2>
              </div>

              <button
                type="button"
                className="almez-legal-modal__close"
                onClick={() => setActiveModal(null)}
                aria-label={translate("footer.close", "Cerrar")}
                autoFocus
              >
                ×
              </button>
            </header>

            <div className="almez-legal-modal__body">
              <LegalModalContent type={activeModal} />
            </div>

            <footer className="almez-legal-modal__footer">
              <button type="button" onClick={() => setActiveModal(null)}>
                {translate("footer.close", "Cerrar")}
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("almez:open-cookie-settings"))
                }
                className="text-sm transition hover:underline"
              >
                {translate("cookies.configure", "Configuración de cookies")}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
