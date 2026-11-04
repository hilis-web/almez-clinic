"use client";

import { useTranslation } from "react-i18next";

interface SectionContentLoadingProps {
  type?: "section" | "category" | "item";
}

export default function SectionContentLoading({
  type = "section",
}: SectionContentLoadingProps) {
  const { t } = useTranslation("common");

  const translationKeys = {
    section: {
      title: "sections.loadingTitle",
      description: "sections.loadingSections",
    },
    category: {
      title: "sections.loadingCategoryTitle",
      description: "sections.loadingCategory",
    },
    item: {
      title: "sections.loadingItemTitle",
      description: "sections.loadingItem",
    },
  };

  const keys = translationKeys[type];

  return (
    <div className="almez-loading" role="status" aria-live="polite">
      <div className="almez-loading__intro">
        <div className="almez-loading__icon" aria-hidden="true">
          <span className="almez-loading__spinner" />
        </div>

        <h2 className="almez-loading__title">{t(keys.title)}</h2>

        <p className="almez-loading__description">{t(keys.description)}</p>
      </div>

      <div className="almez-loading__grid" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div className="almez-loading__card" key={item}>
            <div className="almez-loading__image" />
            <div className="almez-loading__body">
              <div className="almez-loading__line almez-loading__line--title" />
              <div className="almez-loading__line" />
              <div className="almez-loading__line almez-loading__line--short" />
              <div className="almez-loading__action" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
