"use client";

import { useTranslation } from "react-i18next";

export default function FreeConsultationCTA() {
  const { t } = useTranslation("common");

  return (
    <section className="almez-free-cta">
      <div className="almez-free-cta__card">
        <div className="almez-free-cta__content">
          <span className="almez-free-cta__label">
            {t("freeConsultation.label")}
          </span>

          <h2 className="almez-free-cta__title">
            {t("freeConsultation.title")}{" "}
            <span>{t("freeConsultation.duration")}</span>
          </h2>

          <p className="almez-free-cta__description">
            {t("freeConsultation.description")}
          </p>

          <div className="almez-free-cta__features">
            <span>
              <span aria-hidden="true">✓</span>
              {t("freeConsultation.noCommitment")}
            </span>

            <span>
              <span aria-hidden="true">◷</span>
              {t("freeConsultation.minutes")}
            </span>

            <span>
              <span aria-hidden="true">✓</span>
              {t("freeConsultation.response")}
            </span>
          </div>
        </div>

        <div className="almez-free-cta__action">
          <a
            href="#inline-consultation-form"
            className="almez-free-cta__button"
          >
            {t("freeConsultation.button")}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
