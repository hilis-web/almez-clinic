"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import esCommon from "../locales/es/common.json";
import enCommon from "../locales/en/common.json";

const resources = {
  es: { common: esCommon },
  en: { common: enCommon },
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "es",
    initAsync: false,
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    load: "languageOnly",
    defaultNS: "common",
    ns: ["common"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
