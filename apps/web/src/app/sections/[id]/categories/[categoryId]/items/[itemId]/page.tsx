"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../../../../../../i18n/config";

type LocalizedText = {
  ar?: string;
  en?: string;
  es?: string;
};

interface SectionItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  content: LocalizedText | string;
  imageUrl?: string | null;
}

interface SectionCategory {
  id: string;
  title: LocalizedText | string;
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
  if (typeof value === "string") return value;
  if (!value) return "";

  return (
    value[language as keyof LocalizedText] ||
    value.es ||
    value.en ||
    value.ar ||
    ""
  );
}

function ItemPageContent() {
  const params = useParams<{
    id: string;
    categoryId: string;
    itemId: string;
  }>();

  const router = useRouter();
  const { t } = useTranslation("common");

  const [item, setItem] = useState<SectionItem | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [category, setCategory] = useState<SectionCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sectionId = params.id;
  const categoryId = params.categoryId;
  const itemId = params.itemId;

  const language = (i18n.resolvedLanguage || i18n.language || "es").split(
    "-",
  )[0];

  useEffect(() => {
    if (!sectionId || !categoryId || !itemId) return;

    let cancelled = false;

    async function loadItemPage() {
      try {
        setLoading(true);
        setError(false);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const encodedSectionId = encodeURIComponent(sectionId);
        const encodedCategoryId = encodeURIComponent(categoryId);
        const encodedItemId = encodeURIComponent(itemId);

        const [itemResponse, sectionResponse] = await Promise.all([
          fetch(
            `${apiUrl}/api/sections/${encodedSectionId}/categories/${encodedCategoryId}/items/${encodedItemId}`,
          ),
          fetch(`${apiUrl}/api/sections/${encodedSectionId}`),
        ]);

        if (itemResponse.status === 404 || sectionResponse.status === 404) {
          if (!cancelled) {
            setItem(null);
            setSection(null);
            setCategory(null);
          }
          return;
        }

        if (!itemResponse.ok || !sectionResponse.ok) {
          throw new Error("Failed to load item page");
        }

        const [itemResult, sectionResult] = await Promise.all([
          itemResponse.json(),
          sectionResponse.json(),
        ]);

        if (
          !itemResult.success ||
          !itemResult.data ||
          !sectionResult.success ||
          !sectionResult.data
        ) {
          throw new Error("Invalid API response");
        }

        const foundSection = sectionResult.data as Section;

        const foundCategory =
          foundSection.categories?.find((entry) => entry.id === categoryId) ??
          null;

        if (!cancelled) {
          setItem(itemResult.data as SectionItem);
          setSection(foundSection);
          setCategory(foundCategory);
        }
      } catch (err) {
        console.error("Failed to load item page:", err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadItemPage();

    return () => {
      cancelled = true;
    };
  }, [sectionId, categoryId, itemId]);

  const sectionTitle = getLocalizedText(section?.title, language);
  const categoryTitle = getLocalizedText(category?.title, language);
  const title = getLocalizedText(item?.title, language);
  const description = getLocalizedText(item?.description, language);
  const content = getLocalizedText(item?.content, language);

  return (
    <main className="almez-section-page">
      {/* Sticky section and category bar */}
      <div className="almez-section-sticky-bar">
        <div className="almez-section-sticky-bar__inner">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/sections/${encodeURIComponent(sectionId)}/categories/${encodeURIComponent(categoryId)}`,
              )
            }
            className="almez-section-sticky-bar__back"
          >
            <span aria-hidden="true">←</span>
            {t("common.back", "Volver")}
          </button>

          <div className="almez-section-sticky-bar__text">
            {sectionTitle && (
              <span className="almez-section-sticky-bar__eyebrow">
                {sectionTitle}
              </span>
            )}

            {categoryTitle && (
              <h1 className="almez-section-sticky-bar__title">
                {categoryTitle}
              </h1>
            )}
          </div>
        </div>
      </div>

      <div className="almez-section-page__container">
        {loading ? (
          <p role="status">{t("common.loading", "Cargando...")}</p>
        ) : error ? (
          <p role="alert">
            {t("common.error", "No se pudo cargar el contenido.")}
          </p>
        ) : !item ? (
          <p role="status">
            {t("common.notFound", "Contenido no encontrado.")}
          </p>
        ) : (
          <article className="almez-item-detail">
            {/*
              Para mostrar la imagen, título y descripción del elemento,
              puedes activar estos bloques si los necesitas.
            */}

            {/*
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={title}
                className="almez-item-detail__image"
              />
            )}

            <h2 className="almez-item-detail__title">{title}</h2>

            {description && (
              <p className="almez-item-detail__description">
                {description}
              </p>
            )}
            */}

            <div
              className="almez-item-detail__content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        )}
      </div>
    </main>
  );
}

export default function ItemPage() {
  return (
    <Suspense
      fallback={
        <main className="almez-section-page">
          <div className="almez-section-page__container">
            <p role="status">Cargando...</p>
          </div>
        </main>
      }
    >
      <ItemPageContent />
    </Suspense>
  );
}
