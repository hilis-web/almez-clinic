"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CONSENT_STORAGE_KEY = "almez-cookie-consent";
const CONSENT_VERSION = 1;

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentRecord = {
  version: number;
  preferences: CookiePreferences;
  updatedAt: string;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readConsent(): CookieConsentRecord | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("preferences" in parsed) ||
      !("updatedAt" in parsed)
    ) {
      return null;
    }

    const record = parsed as CookieConsentRecord;

    if (
      record.version !== CONSENT_VERSION ||
      typeof record.preferences?.analytics !== "boolean" ||
      typeof record.preferences?.marketing !== "boolean"
    ) {
      return null;
    }

    return {
      ...record,
      preferences: {
        necessary: true,
        analytics: record.preferences.analytics,
        marketing: record.preferences.marketing,
      },
    };
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const { t } = useTranslation("common");

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    setMounted(true);

    const existingConsent = readConsent();

    if (existingConsent) {
      setPreferences(existingConsent.preferences);
      setVisible(false);
    } else {
      setVisible(true);
    }

    function handleOpenSettings() {
      const currentConsent = readConsent();

      if (currentConsent) {
        setPreferences(currentConsent.preferences);
      }

      setShowSettings(true);
      setVisible(true);
    }

    window.addEventListener("almez:open-cookie-settings", handleOpenSettings);

    return () => {
      window.removeEventListener(
        "almez:open-cookie-settings",
        handleOpenSettings,
      );
    };
  }, []);

  function savePreferences(nextPreferences: CookiePreferences) {
    const record: CookieConsentRecord = {
      version: CONSENT_VERSION,
      preferences: {
        ...nextPreferences,
        necessary: true,
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

      setPreferences(record.preferences);
      setVisible(false);
      setShowSettings(false);
    } catch {
      // Keep the interface open if the choice could not be saved.
      setVisible(true);
    }
  }

  function acceptAll() {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  }

  function rejectOptional() {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  }

  if (!mounted || !visible) return null;

  const text = (key: string, fallback: string) => t(`cookies.${key}`, fallback);

  return (
    <>
      {showSettings && (
        <button
          type="button"
          aria-label={text("closeSettings", "Cerrar configuración")}
          className="fixed inset-0 z-[100] cursor-default bg-black/50"
          onClick={() => setShowSettings(false)}
        />
      )}

      <section
        role="dialog"
        aria-modal={showSettings ? true : undefined}
        aria-labelledby="almez-cookie-title"
        className={`fixed bottom-0 left-0 z-[101] w-full border-t border-[#e3e8e3] bg-white p-5 text-[#1b3b36] shadow-2xl sm:bottom-5 sm:left-5 sm:w-[min(440px,calc(100%-40px))] sm:rounded-2xl sm:border ${
          showSettings ? "max-h-[85vh] overflow-y-auto" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="almez-cookie-title" className="text-lg font-bold">
              {text("title", "Preferencias de cookies")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#59665e]">
              {text(
                "description",
                "Utilizamos cookies necesarias para el funcionamiento del sitio. Puedes elegir si permites las cookies opcionales.",
              )}
            </p>
          </div>

          {showSettings && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="rounded-lg px-2 py-1 text-xl hover:bg-[#f4f7f4]"
              aria-label={text("closeSettings", "Cerrar configuración")}
            >
              ×
            </button>
          )}
        </div>

        {showSettings && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-[#e3e8e3] pb-4">
              <div>
                <p className="font-semibold">
                  {text("necessary", "Cookies necesarias")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#758078]">
                  {text(
                    "necessaryDescription",
                    "Necesarias para el funcionamiento básico del sitio.",
                  )}
                </p>
              </div>

              <input
                type="checkbox"
                checked
                disabled
                aria-label={text("necessary", "Cookies necesarias")}
                className="h-4 w-4 accent-[#496e5a]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-[#e3e8e3] pb-4">
              <div>
                <p className="font-semibold">
                  {text("analytics", "Cookies analíticas")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#758078]">
                  {text(
                    "analyticsDescription",
                    "Ayudan a comprender cómo se utiliza el sitio.",
                  )}
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    analytics: event.target.checked,
                  }))
                }
                aria-label={text("analytics", "Cookies analíticas")}
                className="h-4 w-4 accent-[#496e5a]"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {text("marketing", "Cookies de marketing")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#758078]">
                  {text(
                    "marketingDescription",
                    "Permiten servicios de publicidad y contenido personalizado.",
                  )}
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    marketing: event.target.checked,
                  }))
                }
                aria-label={text("marketing", "Cookies de marketing")}
                className="h-4 w-4 accent-[#496e5a]"
              />
            </div>

            <button
              type="button"
              onClick={() => savePreferences(preferences)}
              className="w-full rounded-xl bg-[#496e5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1b3b36]"
            >
              {text("save", "Guardar preferencias")}
            </button>

            <button
              type="button"
              onClick={rejectOptional}
              className="w-full rounded-xl border border-[#e3e8e3] px-4 py-3 text-sm font-semibold hover:bg-[#f4f7f4]"
            >
              {text("reject", "Rechazar todas")}
            </button>
          </div>
        )}

        {!showSettings && (
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="w-full rounded-xl bg-[#496e5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1b3b36]"
            >
              {text("accept", "Aceptar todas")}
            </button>

            <button
              type="button"
              onClick={rejectOptional}
              className="w-full rounded-xl border border-[#e3e8e3] px-4 py-3 text-sm font-semibold transition hover:bg-[#f4f7f4]"
            >
              {text("reject", "Rechazar todas")}
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-[#496e5a] transition hover:bg-[#f4f7f4]"
            >
              {text("configure", "Configurar")}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
