"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../../../../../../i18n/config";
import SiteHeader from "../../../../../../components/SiteHeader";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sectionId = params.id;
  const categoryId = params.categoryId;
  const itemId = params.itemId;

  const language = (i18n.resolvedLanguage || i18n.language || "es").slice(0, 2);

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      try {
        setLoading(true);
        setError(false);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${apiUrl}/api/sections/${encodeURIComponent(sectionId)}/categories/${encodeURIComponent(categoryId)}/items/${encodeURIComponent(itemId)}`,
        );

        if (response.status === 404) {
          if (!cancelled) setItem(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load item");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid item response");
        }

        if (!cancelled) {
          setItem(result.data as SectionItem);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (sectionId && categoryId && itemId) {
      void loadItem();
    }

    return () => {
      cancelled = true;
    };
  }, [sectionId, categoryId, itemId]);

  const title = getLocalizedText(item?.title, language);
  const description = getLocalizedText(item?.description, language);
  const content = getLocalizedText(item?.content, language);

  return (
    <>
      <main className="almez-section-page">
        <div className="almez-section-page__container">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/sections/${encodeURIComponent(sectionId)}/categories/${encodeURIComponent(categoryId)}`,
              )
            }
            className="mb-6 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            ← {t("common.back", "Volver")}
          </button>

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
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={title}
                  className="mb-6 max-h-[420px] w-full rounded-xl object-cover"
                />
              )}

              <h1 className="mb-4 text-3xl font-bold">{title}</h1>

              {description && (
                <p className="mb-8 whitespace-pre-line text-gray-700">
                  {description}
                </p>
              )}

              <div
                className="almez-item-detail__content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          )}
        </div>
      </main>
    </>
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
