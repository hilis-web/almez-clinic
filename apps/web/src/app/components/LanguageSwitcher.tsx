"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/config";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).slice(0, 2);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span>{mounted ? t("language.label") : "Idioma"}</span>

      <select
        aria-label={mounted ? t("language.label") : "Idioma"}
        value={currentLanguage}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          void i18n.changeLanguage(nextLanguage);
          localStorage.setItem("almez-language", nextLanguage);
        }}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
