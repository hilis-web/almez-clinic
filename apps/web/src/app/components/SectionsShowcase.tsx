"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

interface Section {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  categories?: unknown[];
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

export default function SectionsShowcase() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSections() {
      try {
        setLoading(true);
        setError(false);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(`${apiUrl}/api/sections`);

        if (!response.ok) {
          throw new Error("Failed to load sections");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid sections response");
        }

        if (!cancelled) {
          setSections(result.data);
        }
      } catch (err) {
        console.error("Failed to load published sections:", err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSections();

    return () => {
      cancelled = true;
    };
  }, []);

  const language =
    i18n.resolvedLanguage?.split("-")[0] || i18n.language.split("-")[0];

  return (
    <section id="sections" className="almez-sections">
      <div className="almez-sections__container">
        <div className="almez-sections__heading">
          <span className="almez-sections__eyebrow">
            {t("sections.eyebrow", "Explore Almez")}
          </span>

          <h2 className="almez-sections__title">
            {t("sections.title", "Our Medical Sections")}
          </h2>

          <p className="almez-sections__description">
            {t(
              "sections.description",
              "Explore our medical sections and discover the information that matters to you.",
            )}
          </p>
        </div>

        {loading && (
          <div className="almez-sections__grid" aria-busy="true">
            {[1, 2, 3].map((item) => (
              <div
                className="almez-section-card almez-section-card--loading"
                key={item}
              >
                <div className="almez-section-card__image-skeleton" />
                <div className="almez-section-card__body">
                  <div className="almez-section-card__line" />
                  <div className="almez-section-card__line almez-section-card__line--short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="almez-sections__message" role="alert">
            <p>
              {t("sections.error", "We couldn't load the sections right now.")}
            </p>
            <button
              type="button"
              className="almez-sections__retry"
              onClick={() => window.location.reload()}
            >
              {t("sections.retry", "Try again")}
            </button>
          </div>
        )}

        {!loading && !error && sections.length === 0 && (
          <p className="almez-sections__message">
            {t("sections.empty", "No published sections are available yet.")}
          </p>
        )}

        {!loading && !error && sections.length > 0 && (
          <div className="almez-sections__grid">
            {sections.map((section) => {
              const title = getLocalizedText(section.title, language);
              const description = getLocalizedText(
                section.description,
                language,
              );

              return (
                <button
                  key={section.id}
                  type="button"
                  className="almez-category-card almez-section-showcase-card"
                  onClick={() => router.push(`/sections/${section.id}`)}
                  aria-label={`${title} — ${t(
                    "sections.viewSection",
                    "View section",
                  )}`}
                >
                  {section.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="almez-category-card__image"
                      src={section.imageUrl}
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
                    <span className="almez-category-card__title">{title}</span>

                    {description && (
                      <span className="almez-category-card__description">
                        {description}
                      </span>
                    )}

                    <span className="almez-category-card__link">
                      {t("sections.explore", "Explore section")} →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
