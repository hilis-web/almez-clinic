"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

export default function AdminHeader() {
  const [search, setSearch] = useState("");

  const { t } = useTranslation("common");
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("almez_admin_token");
    sessionStorage.removeItem("almez_admin_user");
    router.replace("/login");
  };

  const changeLanguage = (language: "es" | "en") => {
    void i18n.changeLanguage(language);
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-[#e3e8e3] bg-white/95 px-6 py-4 backdrop-blur md:px-8">
      <div>
        <p className="text-sm text-[#758078]">{t("brand.name")}</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#1b3b36]">
          {t("header.title")}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <label htmlFor="admin-search" className="sr-only">
            {t("header.searchPlaceholder")}
          </label>
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("header.searchPlaceholder")}
            className="w-48 rounded-xl border border-[#e3e8e3] bg-[#f8f9fa] px-4 py-2.5 text-sm outline-none transition focus:border-[#496e5a] focus:ring-2 focus:ring-[#9fd3af]/40 lg:w-64"
          />
        </div>

        <label htmlFor="header-language" className="sr-only">
          {t("header.language")}
        </label>
        <select
          id="header-language"
          value={i18n.resolvedLanguage?.startsWith("en") ? "en" : "es"}
          onChange={(event) =>
            changeLanguage(event.target.value as "es" | "en")
          }
          className="rounded-xl border border-[#e3e8e3] bg-white px-3 py-2.5 text-sm text-[#1b3b36] outline-none focus:border-[#496e5a]"
        >
          <option value="es">{t("languages.spanish")}</option>
          <option value="en">{t("languages.english")}</option>
        </select>

        <button
          type="button"
          aria-label={t("header.notifications")}
          title={t("header.notifications")}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e3e8e3] text-lg text-[#1b3b36] transition hover:bg-[#f1f5f0]"
        >
          ♧
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#9fd3af]" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-[#e3e8e3] px-3 py-2.5 text-sm font-semibold text-[#1b3b36] transition hover:bg-[#f1f5f0]"
        >
          <span aria-hidden="true">↪</span>
          <span>
            {i18n.resolvedLanguage?.startsWith("en")
              ? "Sign out"
              : "Cerrar sesión"}
          </span>
        </button>

        <div
          aria-label="Admin"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1b3b36] font-semibold text-white"
        >
          A
        </div>
      </div>
    </header>
  );
}
