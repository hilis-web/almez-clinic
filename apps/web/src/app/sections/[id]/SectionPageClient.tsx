"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

interface SectionItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  sortOrder: number;
  status?: string;
}

interface SectionCategory {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  sortOrder: number;
  items: SectionItem[];
}

interface Section {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  categories: SectionCategory[];
}

function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  language: string,
): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value[language as keyof LocalizedText] ||
    value.es ||
    value.en ||
    value.ar ||
    ""
  );
}

export default function SectionPageClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );

  const sectionId = params.id;

  const language =
    i18n.resolvedLanguage?.split("-")[0] || i18n.language.split("-")[0];

  useEffect(() => {
    if (!sectionId) return;

    let cancelled = false;

    async function loadSection() {
      try {
        setLoading(true);
        setError(false);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${apiUrl}/api/sections/${encodeURIComponent(sectionId)}`,
        );

        if (response.status === 404) {
          if (!cancelled) {
            setSection(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load section");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid section response");
        }

        if (!cancelled) {
          setSection(result.data as Section);
        }
      } catch (err) {
        console.error("Failed to load section:", err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSection();

    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  if (loading) {
    return (
      <main className="almez-section-page">
        <div className="almez-section-page__container">
          <p role="status">{t("sections.loading", "Loading section...")}</p>
        </div>
      </main>
    );
  }

  if (error || !section) {
    return (
      <main className="almez-section-page">
        <div className="almez-section-page__container">
          <p role="alert">
            {error
              ? t("sections.error", "We couldn't load the section.")
              : t("sections.notFound", "Section not found.")}
          </p>

          <button
            type="button"
            className="almez-section-page__back"
            onClick={() => router.push("/")}
          >
            {t("sections.backHome", "Back to home")}
          </button>
        </div>
      </main>
    );
  }

  const title = getLocalizedText(section.title, language);
  const description = getLocalizedText(section.description, language);

  return (
    <main className="almez-section-page">
      {/* Sticky section title and description */}
      <div className="almez-section-sticky-bar">
        <div className="almez-section-sticky-bar__inner">
          <button
            type="button"
            className="almez-section-sticky-bar__back"
            onClick={() => router.push("/")}
          >
            <span aria-hidden="true">←</span>
            {t("sections.backHome", "Back to home")}
          </button>

          <div className="almez-section-sticky-bar__text">
            <h1 className="almez-section-sticky-bar__title">{title}</h1>

            {description && (
              <p className="almez-section-sticky-bar__description">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="almez-section-page__container">
        <section className="almez-section-page__categories">
          {section.categories.length === 0 ? (
            <p className="almez-section-page__empty">
              {t(
                "sections.noCategories",
                "No published categories are available yet.",
              )}
            </p>
          ) : (
            <div className="almez-category-grid">
              {section.categories.map((category) => {
                const categoryTitle = getLocalizedText(
                  category.title,
                  language,
                );

                const categoryDescription = getLocalizedText(
                  category.description,
                  language,
                );

                const visibleItems = [...(category.items || [])]
                  .filter((item) => item.status !== "UNPUBLISHED")
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .slice(0, 5);

                const isHovered = hoveredCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className={`almez-category-card ${
                      isHovered ? "is-hovered" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHoveredCategoryId(category.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    onFocus={() => setHoveredCategoryId(category.id)}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setHoveredCategoryId(null);
                      }
                    }}
                    onClick={() =>
                      router.push(
                        `/sections/${section.id}/categories/${category.id}`,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        router.push(
                          `/sections/${section.id}/categories/${category.id}`,
                        );
                      }
                    }}
                  >
                    {category.imageUrl ? (
                      <img
                        className="almez-category-card__image"
                        src={category.imageUrl}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="almez-category-card__icon"
                        aria-hidden="true"
                      >
                        ✳
                      </span>
                    )}

                    <span className="almez-category-card__content">
                      <span className="almez-category-card__title">
                        {categoryTitle}
                      </span>

                      {categoryDescription && (
                        <span className="almez-category-card__description">
                          {categoryDescription}
                        </span>
                      )}

                      <span className="almez-category-card__link">
                        {t("sections.explore", "Explore category")} →
                      </span>
                    </span>

                    {/* Dropdown shown on hover or keyboard focus */}
                    <div
                      className="almez-category-card__dropdown"
                      aria-hidden={!isHovered}
                    >
                      <p className="almez-category-card__dropdown-heading">
                        {categoryTitle}
                      </p>

                      {visibleItems.length > 0 ? (
                        <ul className="almez-category-card__dropdown-list">
                          {visibleItems.map((item) => (
                            <li key={item.id}>
                              <a
                                href={`/sections/${section.id}/categories/${category.id}/items/${item.id}`}
                                className="almez-category-card__dropdown-link"
                                tabIndex={isHovered ? 0 : -1}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <span>
                                  {getLocalizedText(item.title, language)}
                                </span>
                                <span aria-hidden="true">→</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="almez-category-card__dropdown-empty">
                          {t("sections.noItems", "No items available yet.")}
                        </p>
                      )}

                      <a
                        href={`/sections/${section.id}/categories/${category.id}`}
                        className="almez-category-card__dropdown-all"
                        tabIndex={isHovered ? 0 : -1}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {t("sections.explore", "Explore category")} →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
