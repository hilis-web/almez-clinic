"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../components/admin-sidebar";
import AdminHeader from "../components/admin-header";

export default function AdminPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("almez_admin_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);
  const { t, i18n } = useTranslation("common");

  const stats = [
    {
      title: t("dashboard.consultations"),
      description: t("dashboard.consultationsDescription"),
    },
    {
      title: t("dashboard.doctors"),
      description: t("dashboard.doctorsDescription"),
    },
    {
      title: t("dashboard.patients"),
      description: t("dashboard.patientsDescription"),
    },
    {
      title: t("dashboard.clients"),
      description: t("dashboard.clientsDescription"),
    },
  ];

  const language = i18n.resolvedLanguage?.startsWith("en") ? "en" : "es";

  if (isCheckingAuth) {
    return (
      <main
        lang={language}
        dir="ltr"
        className="flex min-h-screen items-center justify-center bg-[#f8f9fa]"
      >
        <p className="text-sm text-[#758078]">Checking session...</p>
      </main>
    );
  }
  return (
    <div
      lang={language}
      dir="ltr"
      className="min-h-screen bg-[#f8f9fa] md:flex"
    >
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminHeader />

        <main className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm text-[#758078]">{t("dashboard.welcome")}</p>

            <h2 className="mt-2 font-heading text-3xl font-semibold text-[#1b3b36]">
              {t("dashboard.overview")}
            </h2>

            <p className="mt-2 text-sm text-[#758078]">
              {t("dashboard.overviewDescription")}
            </p>
          </div>

          <section aria-label={t("dashboard.statistics")}>
            <h3 className="mb-4 font-heading text-xl font-semibold text-[#1b3b36]">
              {t("dashboard.statistics")}
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.title}
                  className="rounded-2xl border border-[#e3e8e3] bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-[#758078]">{stat.title}</p>

                  <p className="mt-4 font-heading text-3xl font-semibold text-[#1b3b36]">
                    —
                  </p>

                  <p className="mt-2 text-xs text-[#758078]">
                    {stat.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-[#e3e8e3] bg-white p-6 md:p-8">
            <h3 className="font-heading text-xl font-semibold text-[#1b3b36]">
              {t("dashboard.recentActivity")}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#758078]">
              {t("dashboard.activityDescription")}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
