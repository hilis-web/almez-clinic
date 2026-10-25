"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import i18n from "../../i18n/config";

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    let active = true;

    const savedLanguage = localStorage.getItem("almez-language");

    const initialLanguage =
      savedLanguage === "en" || savedLanguage === "es" ? savedLanguage : "es";

    const syncDocumentLanguage = (language: string) => {
      const normalizedLanguage = language.split("-")[0];

      document.documentElement.lang = normalizedLanguage;
      document.documentElement.dir = "ltr";
    };

    const handleLanguageChanged = (language: string) => {
      syncDocumentLanguage(language);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    void i18n.changeLanguage(initialLanguage).finally(() => {
      if (active) {
        syncDocumentLanguage(i18n.resolvedLanguage || initialLanguage);
        setIsLanguageReady(true);
      }
    });

    return () => {
      active = false;
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <Suspense fallback={<div aria-busy="true" />}>
      {isLanguageReady ? children : <div aria-busy="true" />}
    </Suspense>
  );
}
