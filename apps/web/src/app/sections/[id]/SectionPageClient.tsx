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
      <div className="almez-section-page__container">
        <button
          type="button"
          className="almez-section-page__back"
          onClick={() => router.push("/")}
        >
          <span aria-hidden="true">←</span>
          {t("sections.backHome", "Back to home")}
        </button>

        <header className="almez-section-page__hero">
          {section.imageUrl && (
            <img
              className="almez-section-page__hero-image"
              src={section.imageUrl}
              alt=""
            />
          )}

          <div className="almez-section-page__hero-content">
            <span className="almez-section-page__eyebrow">
              {t("sections.eyebrow", "Explore Almez")}
            </span>

            <h1 className="almez-section-page__title">{title}</h1>

            {description && (
              <p className="almez-section-page__description">{description}</p>
            )}
          </div>
        </header>

        <section className="almez-section-page__categories">
          <div className="almez-section-page__section-heading">
            <h2>{t("sections.categoriesTitle", "Explore categories")}</h2>

            <p>
              {t(
                "sections.categoriesDescription",
                "Choose a category to discover its content.",
              )}
            </p>
          </div>

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

                return (
                  <button
                    key={category.id}
                    type="button"
                    className="almez-category-card"
                    onClick={() =>
                      router.push(
                        `/sections/${section.id}/categories/${category.id}`,
                      )
                    }
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
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
