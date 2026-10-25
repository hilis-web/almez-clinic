"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

type ContentStatus = "PUBLISHED" | "UNPUBLISHED";

interface SectionItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
}

interface SectionCategory {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
  items: SectionItem[];
}

interface Section {
  id: string;
  title: LocalizedText | string;
  categories: SectionCategory[];
}

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

function CategoryPageContent() {
  const params = useParams<{ id: string; categoryId: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [section, setSection] = useState<Section | null>(null);
  const [category, setCategory] = useState<SectionCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const sectionId = params.id;
  const categoryId = params.categoryId;

  const language =
    i18n.resolvedLanguage?.split("-")[0] || i18n.language.split("-")[0];

  useEffect(() => {
    if (!sectionId || !categoryId) return;

    let cancelled = false;

    async function loadCategory() {
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
            setCategory(null);
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

        const foundSection = result.data as Section;

        const foundCategory =
          foundSection.categories?.find((item) => item.id === categoryId) ??
          null;

        if (!cancelled) {
          setSection(foundSection);
          setCategory(foundCategory);
        }
      } catch (err) {
        console.error("Failed to load category:", err);

        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [sectionId, categoryId]);

  if (loading) {
    return (
      <main className="almez-section-page">
        <div className="almez-section-page__container">
          <p role="status">{t("sections.loading", "Loading category...")}</p>
        </div>
      </main>
    );
  }

  if (error || !section || !category) {
    return (
      <main className="almez-section-page">
        <div className="almez-section-page__container">
          <p role="alert">
            {error
              ? t("sections.error", "We couldn't load the category.")
              : t("sections.categoryNotFound", "Category not found.")}
          </p>

          <button
            type="button"
            className="almez-section-page__back"
            onClick={() => router.push(`/sections/${sectionId}`)}
          >
            <span aria-hidden="true">←</span>
            {t("sections.backToSection", "Back to section")}
          </button>
        </div>
      </main>
    );
  }

  const sectionTitle = getLocalizedText(section.title, language);
  const categoryTitle = getLocalizedText(category.title, language);
  const categoryDescription = getLocalizedText(category.description, language);

  const items = [...(category.items || [])]
    .filter((item) => item.status !== "UNPUBLISHED")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="almez-section-page">
      {/* Sticky category title and description */}
      <div className="almez-section-sticky-bar">
        <div className="almez-section-sticky-bar__inner">
          <button
            type="button"
            className="almez-section-sticky-bar__back"
            onClick={() => router.push(`/sections/${section.id}`)}
          >
            <span aria-hidden="true">←</span>
            {t("sections.backToSection", "Back to section")}
          </button>

          <div className="almez-section-sticky-bar__text">
            <span className="almez-section-sticky-bar__eyebrow">
              {sectionTitle}
            </span>

            <h1 className="almez-section-sticky-bar__title">{categoryTitle}</h1>

            {categoryDescription && (
              <p className="almez-section-sticky-bar__description">
                {categoryDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="almez-section-page__container">
        <section className="almez-section-page__categories">
          <div className="almez-section-page__section-heading">
            <h2>{t("sections.itemsTitle", "Explore content")}</h2>

            <p>
              {t(
                "sections.itemsDescription",
                "Choose an item to discover more.",
              )}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="almez-section-page__empty">
              {t("sections.noItems", "No published items are available yet.")}
            </p>
          ) : (
            <div className="almez-category-grid">
              {items.map((item) => {
                const itemTitle = getLocalizedText(item.title, language);

                const itemDescription = getLocalizedText(
                  item.description,
                  language,
                );

                const isHovered = hoveredItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`almez-category-card ${
                      isHovered ? "is-hovered" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onFocus={() => setHoveredItemId(item.id)}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setHoveredItemId(null);
                      }
                    }}
                    onClick={() =>
                      router.push(
                        `/sections/${section.id}/categories/${category.id}/items/${item.id}`,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        router.push(
                          `/sections/${section.id}/categories/${category.id}/items/${item.id}`,
                        );
                      }
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        className="almez-category-card__image"
                        src={item.imageUrl}
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
                        {itemTitle}
                      </span>

                      {itemDescription && (
                        <span className="almez-category-card__description">
                          {itemDescription}
                        </span>
                      )}

                      <span className="almez-category-card__link">
                        {t("sections.readMore", "Read more")} →
                      </span>
                    </span>

                    {/* Dropdown for the item card */}
                    <div
                      className="almez-category-card__dropdown"
                      aria-hidden={!isHovered}
                    >
                      <p className="almez-category-card__dropdown-heading">
                        {itemTitle}
                      </p>

                      {itemDescription ? (
                        <p className="almez-category-card__dropdown-empty">
                          {itemDescription}
                        </p>
                      ) : (
                        <p className="almez-category-card__dropdown-empty">
                          {t(
                            "sections.itemDetailsHint",
                            "Open this item to read its full content.",
                          )}
                        </p>
                      )}

                      <a
                        href={`/sections/${section.id}/categories/${category.id}/items/${item.id}`}
                        className="almez-category-card__dropdown-all"
                        tabIndex={isHovered ? 0 : -1}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {t("sections.readMore", "Read more")} →
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

export default function CategoryPage() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <main className="almez-section-page">
          <div className="almez-section-page__container">
            <p role="status">{t("sections.loading", "Loading category...")}</p>
          </div>
        </main>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
