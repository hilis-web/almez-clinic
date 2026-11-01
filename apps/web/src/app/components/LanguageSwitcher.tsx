"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import i18n from "../../i18n/config";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLanguage = (
    pathname.split("/")[1] === "en" || pathname.split("/")[1] === "es"
      ? pathname.split("/")[1]
      : i18n.resolvedLanguage || i18n.language || "es"
  ).slice(0, 2);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span>{mounted ? t("language.label") : "Idioma"}</span>

      <select
        aria-label={mounted ? t("language.label") : "Idioma"}
        value={currentLanguage}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          const segments = pathname.split("/");

          if (segments[1] === "es" || segments[1] === "en") {
            segments[1] = nextLanguage;
          } else {
            segments.splice(1, 0, nextLanguage);
          }

          const nextPath = segments.join("/") || `/${nextLanguage}`;

          localStorage.setItem("almez-language", nextLanguage);
          void i18n.changeLanguage(nextLanguage);
          router.push(nextPath);
        }}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
