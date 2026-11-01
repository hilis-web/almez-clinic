"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import i18n from "../../i18n/config";

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const pathname = usePathname();
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    const segments = pathname.split("/");
    const routeLanguage = segments[1];

    const initialLanguage =
      routeLanguage === "en" || routeLanguage === "es" ? routeLanguage : "es";

    let active = true;

    const syncDocumentLanguage = (language: string) => {
      document.documentElement.lang = language.split("-")[0];
      document.documentElement.dir = "ltr";
    };

    const handleLanguageChanged = (language: string) => {
      syncDocumentLanguage(language);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    void i18n.changeLanguage(initialLanguage).finally(() => {
      if (active) {
        syncDocumentLanguage(i18n.resolvedLanguage || initialLanguage);
        localStorage.setItem("almez-language", initialLanguage);
        setIsLanguageReady(true);
      }
    });

    return () => {
      active = false;
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [pathname]);

  return (
    <Suspense fallback={<div aria-busy="true" />}>
      {isLanguageReady ? children : <div aria-busy="true" />}
    </Suspense>
  );
}
