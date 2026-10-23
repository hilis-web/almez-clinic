"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const slides = [
  {
    title: {
      es: "Bienvenido a nuestra clínica",
      en: "Welcome to Our Clinic",
    },
    description: {
      es: "Ofrecemos atención médica de alta calidad en distintas especialidades.",
      en: "We offer high-quality medical care across multiple specialties.",
    },
    image:
      "https://res.cloudinary.com/dheh8ee3r/image/upload/v1738760173/golf_kt4o3t.jpg",
    alt: {
      es: "Imagen de bienvenida de la clínica",
      en: "Welcome image for the clinic",
    },
  },
  {
    title: {
      es: "La mejor atención médica",
      en: "The Best Medical Care",
    },
    description: {
      es: "Nuestro equipo médico está preparado para ayudarte.",
      en: "Our medical team is ready to assist you.",
    },
    image:
      "https://raw.githubusercontent.com/hilis-web/almez/main/public-clinic/assets/images/tennis.jpg",
    alt: {
      es: "Atención y bienestar",
      en: "Care and wellbeing",
    },
  },
  {
    title: {
      es: "Especialidades médicas integrales",
      en: "Comprehensive Medical Sections",
    },
    description: {
      es: "Atención sanitaria de calidad en un entorno cómodo y seguro.",
      en: "High-quality healthcare in a comfortable and safe environment.",
    },
    image:
      "https://raw.githubusercontent.com/hilis-web/almez/main/public-clinic/assets/images/yoga.jpg",
    alt: {
      es: "Salud y bienestar",
      en: "Health and wellbeing",
    },
  },
];

type Language = "es" | "en";

export default function HeroCarousel() {
  const { i18n } = useTranslation();

  // Mantener el mismo idioma durante el renderizado inicial
  // del servidor y del navegador evita errores de Hydration.
  const [language, setLanguage] = useState<Language>("es");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const syncLanguage = (currentLanguage: string) => {
      const normalizedLanguage = currentLanguage.split("-")[0];
      setLanguage(normalizedLanguage === "en" ? "en" : "es");
    };

    // Escuchar los cambios de idioma.
    i18n.on("languageChanged", syncLanguage);

    // Recuperar el idioma guardado después del montaje.
    const savedLanguage = localStorage.getItem("almez-language");

    if (savedLanguage === "en" || savedLanguage === "es") {
      syncLanguage(savedLanguage);
    } else {
      syncLanguage(i18n.resolvedLanguage || i18n.language || "es");
    }

    return () => {
      i18n.off("languageChanged", syncLanguage);
    };
  }, [i18n]);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const slide = slides[activeSlide];

  function showPrevious() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  const labels =
    language === "es"
      ? {
          previous: "Diapositiva anterior",
          next: "Diapositiva siguiente",
          readMore: "Más información",
          slide: "Diapositiva",
          consultation: "Solicitar una consulta",
          clinicPresentation: "Presentación de la clínica",
        }
      : {
          previous: "Previous slide",
          next: "Next slide",
          readMore: "Read More",
          slide: "Slide",
          consultation: "Request a consultation",
          clinicPresentation: "Clinic highlights",
        };

  return (
    <section
      className="almez-hero"
      aria-roledescription="carousel"
      aria-label={labels.clinicPresentation}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      {slides.map((item, index) => (
        <div
          key={item.title.en}
          className={`almez-hero__slide ${
            index === activeSlide ? "is-active" : ""
          }`}
          style={{ backgroundImage: `url("${item.image}")` }}
          aria-hidden={index !== activeSlide}
        />
      ))}

      <div className="almez-hero__overlay" />

      <div className="almez-hero__content" key={slide.title.en}>
        <p className="almez-hero__eyebrow">ALMEZ</p>

        <h1>{slide.title[language]}</h1>

        <p className="almez-hero__description">{slide.description[language]}</p>

        <a className="almez-hero__button" href="#inline-consultation-form">
          {labels.consultation}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <button
        type="button"
        className="almez-hero__arrow almez-hero__arrow--previous"
        onClick={showPrevious}
        aria-label={labels.previous}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        type="button"
        className="almez-hero__arrow almez-hero__arrow--next"
        onClick={showNext}
        aria-label={labels.next}
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="almez-hero__indicators" aria-label={labels.slide}>
        {slides.map((item, index) => (
          <button
            key={item.title.en}
            type="button"
            className={`almez-hero__indicator ${
              index === activeSlide ? "is-active" : ""
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`${labels.slide} ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
