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
    <main className="almez-item-detail">
      <div className="almez-item-detail__sticky">
        <div className="almez-item-detail__breadcrumb">
          <Link href={`/${locale}/sections/${initialSection.id}`}>
            {sectionTitle}
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href={`/${locale}/sections/${initialSection.id}/categories/${initialCategory.id}`}
          >
            {categoryTitle}
          </Link>

          <span aria-hidden="true">/</span>

          <span>{itemTitle}</span>
        </div>
      </div>

      <article className="almez-item-detail__article">
        <div
          className="almez-item-detail__content"
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      </article>
    </main>
  );
}
