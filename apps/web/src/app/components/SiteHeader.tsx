"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

type LocalizedText = {
  en?: string;
  es?: string;
  ar?: string;
};

type SectionItem = {
  id: string;
  title: LocalizedText | string;
  status?: "PUBLISHED" | "UNPUBLISHED";
  sortOrder: number;
};

type SectionCategory = {
  id: string;
  title: LocalizedText | string;
  status?: "PUBLISHED" | "UNPUBLISHED";
  sortOrder: number;
  items: SectionItem[];
};

type Section = {
  id: string;
  title: LocalizedText | string;
  description: LocalizedText | string;
  status?: "PUBLISHED" | "UNPUBLISHED";
  sortOrder: number;
  categories: SectionCategory[];
};

function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  language: string,
): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  return (
    value[language as keyof LocalizedText] ||
    value.es ||
    value.en ||
    value.ar ||
    ""
  );
}

export default function SiteHeader() {
  const { t, i18n } = useTranslation("common");

  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const language =
    i18n.resolvedLanguage?.split("-")[0] || i18n.language.split("-")[0] || "es";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSections() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(`${apiUrl}/api/sections`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load navigation sections");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid sections response");
        }

        setSections(result.data as Section[]);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load navigation sections:", error);
      }
    }

    void loadSections();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setOpenSectionId(null);
  }, [language]);

  const translate = (key: string, fallback: string) =>
    mounted ? t(key, fallback) : fallback;

  const closeMenu = () => setOpenSectionId(null);

  return (
    <>
      <div className="almez-header__contact-bar">
        <div className="almez-header__contact-inner">
          <div className="almez-header__contact-details">
            <a
              href="mailto:contact@almez.com"
              className="almez-header__contact-link"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              contact@almez.com
            </a>

            <a href="tel:+346045432" className="almez-header__contact-link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 3h4l2 5-2.5 1.5a15 15 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />
              </svg>
              +34 604 5432
            </a>
          </div>

          <div className="almez-header__language">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <header
        className="almez-header almez-header__sticky"
        onMouseLeave={closeMenu}
      >
        <div className="almez-header__identity">
          <div className="almez-header__brand">
            <div className="almez-header__logo" aria-hidden="true">
              A
            </div>

            <div className="almez-header__brand-copy">
              <Link
                href="/"
                className="almez-header__brand-name"
                onClick={closeMenu}
              >
                ALMEZ
              </Link>

              {/* <p className="almez-header__tagline">
                {translate(
                  "header.tagline",
                  "Cuidamos tu espalda, mejoramos tu vida",
                )}
              </p> */}

              <p className="almez-header__specialty">
                {translate(
                  "header.specialty",
                  "CLÍNICA DE CIRUGÍA ORTOPÉDICA Y COLUMNA",
                )}
              </p>
            </div>
          </div>

          <div className="almez-header__doctor">
            <p className="almez-header__doctor-name">
              {translate("header.doctorName", "Dr. Aaron Hilis")}
            </p>

            <p className="almez-header__doctor-details">
              {translate("header.credentials", "MB ChB BSc, MA, FRCS, PhD")}
            </p>

            <p className="almez-header__doctor-details almez-header__doctor-qualification">
              {translate(
                "header.qualification",
                "Máster en medicina deportiva",
              )}
            </p>
          </div>
        </div>

        <nav
          aria-label={translate("navigation.mainLabel", "Main navigation")}
          className="almez-header__navigation"
        >
          <div className="almez-header__navigation-inner">
            {/* Home is fixed and always first */}
            <Link
              href="/"
              className="almez-header__nav-link"
              onClick={closeMenu}
            >
              {translate("navigation.home", "Inicio")}
            </Link>

            <a
              href="/#team"
              className="almez-header__nav-link"
              onClick={closeMenu}
            >
              {translate("navigation.team", "Nuestro equipo")}
            </a>

            {/* Dynamic sections from the API */}
            {sections.map((section) => {
              const isOpen = openSectionId === section.id;

              const sectionTitle = getLocalizedText(section.title, language);

              const sectionDescription = getLocalizedText(
                section.description,
                language,
              );

              return (
                <div
                  key={section.id}
                  className={`almez-mega__nav-item ${isOpen ? "is-open" : ""}`}
                  onMouseEnter={() => setOpenSectionId(section.id)}
                >
                  <div className="almez-mega__trigger-group">
                    <div className="almez-mega__item">
                      <Link
                        href={`/sections/${section.id}`}
                        className="almez-header__nav-link almez-mega__section-link"
                        onClick={closeMenu}
                      >
                        <span>{sectionTitle}</span>
                      </Link>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      id={`almez-mega-${section.id}`}
                      className="almez-mega__panel"
                    >
                      <div className="almez-mega__inner">
                        <div className="almez-mega__intro">
                          <span className="almez-mega__eyebrow">
                            {translate("navigation.explore", "Explore")}
                          </span>

                          <h2 className="almez-mega__section-title">
                            {sectionTitle}
                          </h2>

                          {sectionDescription && (
                            <p className="almez-mega__description">
                              {sectionDescription}
                            </p>
                          )}

                          <Link
                            href={`/sections/${section.id}`}
                            className="almez-mega__view-all"
                            onClick={closeMenu}
                          >
                            {translate("navigation.viewAll", "View all")}
                            <span aria-hidden="true"> →</span>
                          </Link>
                        </div>

                        <div className="almez-mega__categories">
                          {section.categories?.map((category) => {
                            const categoryTitle = getLocalizedText(
                              category.title,
                              language,
                            );

                            const items = [...(category.items || [])]
                              .filter((item) => item.status !== "UNPUBLISHED")
                              .sort((a, b) => a.sortOrder - b.sortOrder);

                            const visibleItems = items.slice(0, 5);

                            return (
                              <div
                                key={category.id}
                                className="almez-mega__category"
                              >
                                <Link
                                  href={`/sections/${section.id}/categories/${category.id}`}
                                  className="almez-mega__category-title"
                                  onClick={closeMenu}
                                >
                                  {categoryTitle}
                                </Link>

                                <ul className="almez-mega__item-list">
                                  {visibleItems.map((item) => (
                                    <li key={item.id}>
                                      <Link
                                        href={`/sections/${section.id}/categories/${category.id}/items/${item.id}`}
                                        className="almez-mega__item-link"
                                        onClick={closeMenu}
                                      >
                                        {getLocalizedText(item.title, language)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>

                                {items.length > 5 && (
                                  <Link
                                    href={`/sections/${section.id}/categories/${category.id}`}
                                    className="almez-mega__more"
                                    onClick={closeMenu}
                                  >
                                    {translate("navigation.more", "More")}
                                    <span aria-hidden="true"> →</span>
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contact is fixed and always last */}
            <a
              href="/#contact"
              className="almez-header__nav-link"
              onClick={closeMenu}
            >
              {translate("navigation.contact", "Contacto")}
            </a>
            <a
              href="/#contact"
              className="almez-header__appointment-link"
              onClick={closeMenu}
            >
              {translate("navigation.bookAppointment", "Reservar una cita")}
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
