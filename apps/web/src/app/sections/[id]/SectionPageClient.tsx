"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type Locale = "es" | "en";

type LocalizedText = {
  es?: string;
  en?: string;
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

interface SectionPageClientProps {
  initialSection: Section;
  locale: Locale;
}

function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  language: Locale,
): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value[language] || value.es || value.en || "";
}

export default function SectionPageClient({
  initialSection,
  locale,
}: SectionPageClientProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );

  const section = initialSection;
  const language = locale;

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
            onClick={() => router.push(`/${language}`)}
          >
            <span aria-hidden="true">←</span>
            {t("common.back", "Volver")}
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
                        `/${language}/sections/${section.id}/categories/${category.id}`,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        router.push(
                          `/${language}/sections/${section.id}/categories/${category.id}`,
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
                                href={`/${language}/sections/${section.id}/categories/${category.id}/items/${item.id}`}
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
                        href={`/${language}/sections/${section.id}/categories/${category.id}`}
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
