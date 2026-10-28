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
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSectionId, setExpandedMobileSectionId] = useState<
    string | null
  >(null);

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

        setSections(
          (result.data as Section[])
            .filter((section) => section.status !== "UNPUBLISHED")
            .sort((a, b) => a.sortOrder - b.sortOrder),
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load navigation sections:", error);
      } finally {
        if (!controller.signal.aborted) setIsLoadingSections(false);
      }
    }

    void loadSections();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setOpenSectionId(null);
    setExpandedMobileSectionId(null);
    setIsMobileMenuOpen(false);
  }, [language]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const translate = (key: string, fallback: string) =>
    mounted ? t(key, fallback) : fallback;

  const closeMenu = () => {
    setOpenSectionId(null);
    setIsMobileMenuOpen(false);
    setExpandedMobileSectionId(null);
  };

  const renderSectionLinks = (section: Section) => {
    const sectionTitle = getLocalizedText(section.title, language);
    const sectionDescription = getLocalizedText(section.description, language);
    const categories = [...(section.categories || [])]
      .filter((category) => category.status !== "UNPUBLISHED")
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <>
        <Link
          href={`/sections/${section.id}`}
          className="almez-mobile-menu__section-link"
          onClick={closeMenu}
        >
          {sectionTitle}
        </Link>

        {sectionDescription && (
          <p className="almez-mobile-menu__description">{sectionDescription}</p>
        )}

        <Link
          href={`/sections/${section.id}`}
          className="almez-mobile-menu__view-all"
          onClick={closeMenu}
        >
          {translate("navigation.viewAll", "Ver todo")} →
        </Link>

        {categories.map((category) => {
          const categoryTitle = getLocalizedText(category.title, language);
          const items = [...(category.items || [])]
            .filter((item) => item.status !== "UNPUBLISHED")
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return (
            <div className="almez-mobile-menu__category" key={category.id}>
              <Link
                href={`/sections/${section.id}/categories/${category.id}`}
                className="almez-mobile-menu__category-link"
                onClick={closeMenu}
              >
                {categoryTitle}
              </Link>

              {items.length > 0 && (
                <ul className="almez-mobile-menu__items">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/sections/${section.id}/categories/${category.id}/items/${item.id}`}
                        onClick={closeMenu}
                      >
                        {getLocalizedText(item.title, language)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </>
    );
  };

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
        onMouseLeave={() => setOpenSectionId(null)}
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

          <button
            type="button"
            className="almez-mobile-menu__toggle"
            aria-label={
              isMobileMenuOpen
                ? translate("navigation.closeMenu", "Cerrar menú")
                : translate("navigation.openMenu", "Abrir menú")
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="almez-mobile-drawer"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        <nav
          aria-label={translate("navigation.mainLabel", "Main navigation")}
          className="almez-header__navigation"
        >
          <div className="almez-header__navigation-inner">
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

            {isLoadingSections ? (
              <div
                className="almez-nav-skeleton-group"
                role="status"
                aria-label={translate(
                  "navigation.loadingSections",
                  "Loading sections",
                )}
              >
                {[1, 2, 3, 4].map((item) => (
                  <span
                    key={item}
                    className={`almez-nav-skeleton almez-nav-skeleton--${item}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : (
              sections.map((section) => {
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
                              {translate("navigation.viewAll", "View all")} →
                            </Link>
                          </div>

                          <div className="almez-mega__categories">
                            {(section.categories || [])
                              .filter(
                                (category) => category.status !== "UNPUBLISHED",
                              )
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((category) => {
                                const categoryTitle = getLocalizedText(
                                  category.title,
                                  language,
                                );
                                const items = [...(category.items || [])]
                                  .filter(
                                    (item) => item.status !== "UNPUBLISHED",
                                  )
                                  .sort((a, b) => a.sortOrder - b.sortOrder);

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
                                      {items.slice(0, 5).map((item) => (
                                        <li key={item.id}>
                                          <Link
                                            href={`/sections/${section.id}/categories/${category.id}/items/${item.id}`}
                                            className="almez-mega__item-link"
                                            onClick={closeMenu}
                                          >
                                            {getLocalizedText(
                                              item.title,
                                              language,
                                            )}
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
                                        {translate("navigation.more", "More")} →
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
              })
            )}

            <a
              href="/#contact"
              className="almez-header__nav-link"
              onClick={closeMenu}
            >
              {translate("navigation.contact", "Contacto")}
            </a>
          </div>
        </nav>
      </header>

      <div
        className={`almez-mobile-menu__backdrop ${isMobileMenuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        id="almez-mobile-drawer"
        className={`almez-mobile-menu__drawer ${isMobileMenuOpen ? "is-open" : ""}`}
        aria-label={translate("navigation.mainLabel", "Main navigation")}
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        <div className="almez-mobile-menu__header">
          <span className="almez-mobile-menu__title">
            {translate("navigation.menu", "Menú")}
          </span>
          <button
            type="button"
            className="almez-mobile-menu__close"
            aria-label={translate("navigation.closeMenu", "Cerrar menú")}
            onClick={closeMenu}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label={translate("navigation.mainLabel", "Main navigation")}>
          <Link
            href="/"
            className="almez-mobile-menu__link"
            onClick={closeMenu}
          >
            {translate("navigation.home", "Inicio")}
          </Link>
          <a
            href="/#team"
            className="almez-mobile-menu__link"
            onClick={closeMenu}
          >
            {translate("navigation.team", "Nuestro equipo")}
          </a>

          {isLoadingSections ? (
            <p className="almez-mobile-menu__loading">
              {translate("navigation.loadingSections", "Loading sections")}
            </p>
          ) : (
            sections.map((section) => {
              const expanded = expandedMobileSectionId === section.id;

              return (
                <div className="almez-mobile-menu__section" key={section.id}>
                  <div className="almez-mobile-menu__section-row">
                    <Link
                      href={`/sections/${section.id}`}
                      className="almez-mobile-menu__link"
                      onClick={closeMenu}
                    >
                      {getLocalizedText(section.title, language)}
                    </Link>
                    <button
                      type="button"
                      className="almez-mobile-menu__expand"
                      aria-label={`${expanded ? translate("navigation.collapse", "Collapse") : translate("navigation.expand", "Expand")} ${getLocalizedText(section.title, language)}`}
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedMobileSectionId(expanded ? null : section.id)
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d={expanded ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
                      </svg>
                    </button>
                  </div>

                  {expanded && (
                    <div className="almez-mobile-menu__section-content">
                      {renderSectionLinks(section)}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <a
            href="/#contact"
            className="almez-mobile-menu__link"
            onClick={closeMenu}
          >
            {translate("navigation.contact", "Contacto")}
          </a>
        </nav>

        <div className="almez-mobile-menu__language">
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
