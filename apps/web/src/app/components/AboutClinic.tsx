"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AboutClinic() {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translate = (key: string, fallback: string) =>
    mounted ? t(key, fallback) : fallback;

  return (
    <section
      id="about"
      className="almez-about"
      aria-labelledby="almez-about-title"
    >
      <div className="almez-about__inner">
        <div className="almez-about__content">
          <p className="almez-about__eyebrow">
            {translate("about.eyebrow", "Sobre Almez")}
          </p>

          <h2 id="almez-about-title" className="almez-about__title">
            {translate("about.title", "Cuidamos de tu salud y bienestar")}
          </h2>

          <p className="almez-about__description">
            {translate(
              "about.description",
              "Ofrecemos atención médica especializada con un enfoque centrado en cada paciente, para ayudarte a comprender tus opciones y tomar decisiones informadas sobre tu salud.",
            )}
          </p>

          <p className="almez-about__description">
            {translate(
              "about.approach",
              "Nuestro objetivo es ofrecer una atención cercana, profesional y adaptada a tus necesidades.",
            )}
          </p>

          <a href="#contact" className="almez-about__link">
            {translate("about.cta", "Solicitar una consulta")}
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        <div className="almez-about__visual" aria-hidden="true">
          <div className="almez-about__visual-accent" />
          <div className="almez-about__visual-card">
            <span className="almez-about__visual-mark">A</span>
            <span className="almez-about__visual-name">ALMEZ</span>
            <span className="almez-about__visual-caption">
              {translate(
                "about.visualCaption",
                "Atención médica especializada",
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
