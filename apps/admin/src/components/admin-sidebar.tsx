"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const navigation = [
    { title: t("navigation.dashboard"), href: "/", icon: "⌂" },
    {
      title: t("navigation.consultations"),
      href: "/consultations",
      icon: "▤",
    },
    {
      title: t("navigation.sections"),
      href: "/sections",
      icon: "▤",
    },
    { title: t("navigation.doctors"), href: "/doctors", icon: "♙" },
    { title: t("navigation.patients"), href: "/patients", icon: "♧" },
    { title: t("navigation.settings"), href: "/settings", icon: "⚙" },
  ];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-[#e3e8e3] bg-white">
      <div className="border-b border-[#e3e8e3] px-6 py-7">
        <Link href="/" className="block">
          <span className="font-heading text-3xl font-semibold text-[#1b3b36]">
            {t("brand.name")}
          </span>

          <span className="mt-1 block text-base text-[#758078]">
            {t("brand.adminSubtitle")}
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-sm font-semibold tracking-wider text-[#758078]">
          {t("navigation.section")}
        </p>

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1b3b36] text-white"
                  : "text-[#496e5a] hover:bg-[#f1f5f0]"
              }`}
            >
              <span aria-hidden="true" className="text-lg">
                {item.icon}
              </span>

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e3e8e3] p-5">
        <p className="text-sm text-[#758078]">{t("brand.name")}</p>
        <p className="mt-1 text-xs text-[#758078]">{t("brand.footer")}</p>
      </div>
    </aside>
  );
}
