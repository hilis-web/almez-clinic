"use client";

import Link from "next/link";

import type {
  Section,
  SectionCategory,
  SectionItem,
  LocalizedText,
} from "@/lib/server/sections";

interface ItemPageProps {
  initialItem: SectionItem;
  initialSection: Section;
  initialCategory: SectionCategory;
  locale: "es" | "en";
}

function getText(
  value: LocalizedText | string | null | undefined,
  locale: "es" | "en",
): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value[locale] || value.es || value.en || "";
}

export default function ItemPageClient({
  initialItem,
  initialSection,
  initialCategory,
  locale,
}: ItemPageProps) {
  const sectionTitle = getText(initialSection.title, locale);
  const categoryTitle = getText(initialCategory.title, locale);
  const itemTitle = getText(initialItem.title, locale);
  const content = getText(initialItem.content, locale);

  return (
    <main className="almez-section-page">
      <div className="almez-section-sticky-bar">
        <div className="almez-section-sticky-bar__inner">
          <Link
            href={`/${locale}/sections/${initialSection.id}/categories/${initialCategory.id}`}
            className="almez-section-sticky-bar__back"
          >
            <span aria-hidden="true">←</span>
            {locale === "es" ? "Volver" : "Back"}
          </Link>

          <div className="almez-section-sticky-bar__text">
            <div className="almez-section-sticky-bar__eyebrow">
              <Link href={`/${locale}/sections/${initialSection.id}`}>
                {sectionTitle}
              </Link>

              {sectionTitle && categoryTitle && " / "}

              <Link
                href={`/${locale}/sections/${initialSection.id}/categories/${initialCategory.id}`}
              >
                {categoryTitle}
              </Link>
            </div>

            {itemTitle && (
              <h1 className="almez-section-sticky-bar__title">{itemTitle}</h1>
            )}
          </div>
        </div>
      </div>

      <div className="almez-section-page__container">
        <article className="almez-item-detail">
          <div
            className="almez-item-detail__content"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        </article>
      </div>
    </main>
  );
}
